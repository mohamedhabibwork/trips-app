import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { eq, inArray, schema } from "@trips-app/db";
import { computeBlindIndex, encryptField, signAccessToken } from "@trips-app/domain";

import { app } from "../../src/index";
import {
  db,
  disks,
  runUnlinkedMediaCleanup,
  startUnlinkedMediaCleanupWorker,
} from "../../src/services";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;

interface RpcBody {
  json?: Record<string, unknown> | null;
}

function send(path: string, init: RequestInit = {}): Promise<Response> {
  return app.handle(new Request(`http://localhost${path}`, init));
}

function rpcCall(
  procedurePath: readonly string[],
  body: unknown,
  token?: string,
): Promise<Response> {
  return send(`/rpc/${procedurePath.join("/")}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ json: body ?? null }),
  });
}

async function payload(response: Response): Promise<Record<string, unknown>> {
  const body = (await response.json()) as RpcBody;
  return (body.json ?? {}) as Record<string, unknown>;
}

const createdAccountIds: string[] = [];
const createdOrganizationIds: string[] = [];

async function createTestUser(
  role: "traveler" | "organization_owner" | "platform_driver" | "admin" = "traveler",
  tenantId?: string,
): Promise<{
  accountId: string;
  token: string;
}> {
  const id = randomUUID();
  const phone = `+2010${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
  const email = `media-e2e-${id.slice(0, 8)}@trips-enjoy.com`;

  await db.insert(schema.accounts).values({
    id,
    emailNormalized: email,
    emailBlindIndex: computeBlindIndex(email),
    emailEncrypted: encryptField(email),
    phoneE164: phone,
    phoneBlindIndex: computeBlindIndex(phone),
    phoneEncrypted: encryptField(phone),
    fullName: `Media Test ${role}`,
    preferredLanguage: "en",
    status: "active",
  });

  createdAccountIds.push(id);

  const token = signAccessToken({
    sub: id,
    sid: randomUUID(),
    role,
    ...(tenantId ? { tenantId } : {}),
    ...(role === "admin" ? { adminSubRole: "operations" as const } : {}),
  } as Parameters<typeof signAccessToken>[0]);

  return { accountId: id, token };
}

async function existsOnDisk(
  diskName: "uploads" | "documents" | "temp",
  storageKey: string,
): Promise<boolean> {
  const driver = await disks.disk(diskName);
  return driver.exists(storageKey);
}

describe("E2E: media upload intents, purpose-based validation, item create/update linking & 12h unlinked cleanup", () => {
  let user: { accountId: string; token: string };
  let opsAdmin: { accountId: string; token: string };

  beforeAll(async () => {
    user = await createTestUser("traveler");
    opsAdmin = await createTestUser("admin");
  });

  afterAll(async () => {
    if (createdAccountIds.length > 0) {
      const files = await db
        .select()
        .from(schema.uploadedFiles)
        .where(inArray(schema.uploadedFiles.uploaderAccountId, createdAccountIds));

      for (const file of files) {
        const driver = await disks.disk(file.disk);
        await driver.delete(file.storageKey).catch(() => undefined);
      }

      if (createdOrganizationIds.length > 0) {
        await db
          .delete(schema.organizations)
          .where(inArray(schema.organizations.id, createdOrganizationIds));
      }

      await db.delete(schema.accounts).where(inArray(schema.accounts.id, createdAccountIds));
    }
  });

  test("1. exposes purpose-based file type & size validation policies and rejects invalid purpose/MIME combinations", async () => {
    // 1a. Fetch upload purpose policies
    const purposesRes = await rpcCall(["media", "getUploadPurposes"], {}, user.token);
    expect(purposesRes.status).toBe(HTTP_OK);
    const purposesData = await payload(purposesRes);
    const purposes = purposesData.purposes as Array<Record<string, unknown>>;
    expect(purposes.length).toBeGreaterThanOrEqual(15);

    const avatarPolicy = purposes.find((p) => p.purpose === "avatar");
    expect(avatarPolicy).toBeDefined();
    expect(avatarPolicy?.unlinkedTtlHours).toBe(12);
    expect(avatarPolicy?.allowedMimeTypes).toContain("image/png");
    expect(avatarPolicy?.allowedMimeTypes).not.toContain("application/pdf");

    // 1b. Rejects uploading a PDF when purpose is 'avatar' (image-only purpose)
    const invalidRpcUpload = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "avatar.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("pdf-bytes").toString("base64"),
        purpose: "avatar",
      },
      user.token,
    );
    expect(invalidRpcUpload.status).toBe(HTTP_BAD_REQUEST);

    // 1c. Rejects multipart POST /upload when MIME type does not match purpose 'contract' (PDF-only purpose)
    const badForm = new FormData();
    badForm.set("file", new File(["png-bytes"], "contract.png", { type: "image/png" }));
    badForm.set("purpose", "contract");

    const badMultipartRes = await send("/upload", {
      method: "POST",
      headers: {
        authorization: `Bearer ${user.token}`,
      },
      body: badForm,
    });
    expect(badMultipartRes.status).toBe(HTTP_BAD_REQUEST);

    // 1d. Standalone linkFile / linkFiles API endpoints do NOT exist (linking happens only on item create/update)
    const removedLinkEndpoint = await rpcCall(
      ["media", "linkFile"],
      {
        fileId: randomUUID(),
        linkedEntityType: "trip",
        linkedEntityId: randomUUID(),
      },
      user.token,
    );
    expect(removedLinkEndpoint.status).toBe(404);
  });

  test("2. supports storagekit upload intent workflow (createUploadIntent -> fulfill via POST /upload?intentId=... or confirmUploadIntent)", async () => {
    // 2a. Create an upload intent for a driver_license image
    const licenseBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);
    const intentRes = await rpcCall(
      ["media", "createUploadIntent"],
      {
        originalFilename: "driver-license.png",
        mimeType: "image/png",
        fileSizeBytes: licenseBytes.byteLength,
        purpose: "driver_license",
      },
      user.token,
    );
    expect(intentRes.status).toBe(HTTP_OK);
    const intentData = await payload(intentRes);
    const intent = intentData.intent as Record<string, unknown>;
    expect(intent.fileId).toBeString();
    expect(intent.disk).toBe("documents");
    expect(intent.purpose).toBe("driver_license");
    expect(intent.uploadUrl).toBe(`/upload?intentId=${intent.fileId}`);
    expect((intent.policy as Record<string, unknown>).unlinkedTtlHours).toBe(12);

    // 2b. Fulfill the upload intent using multipart POST /upload?intentId=... (uses storagekit saveWebFile / saveUploadIntent + checksum)
    const formData = new FormData();
    formData.set("file", new File([licenseBytes], "driver-license.png", { type: "image/png" }));
    formData.set("purpose", "driver_license");

    const fulfillRes = await send(String(intent.uploadUrl), {
      method: "POST",
      headers: {
        authorization: `Bearer ${user.token}`,
      },
      body: formData,
    });
    expect(fulfillRes.status).toBe(HTTP_OK);
    const fulfillEnvelope = (await fulfillRes.json()) as {
      success: boolean;
      data: { file: Record<string, unknown> };
    };
    const uploadedFile = fulfillEnvelope.data.file;
    expect(uploadedFile.id).toBe(intent.fileId);
    expect(uploadedFile.storageKey).toBe(intent.storageKey);
    expect(uploadedFile.status).toBe("pending");
    expect(uploadedFile.checksumSha256).toBeString();
    expect((uploadedFile.checksumSha256 as string).length).toBe(64);
    expect(await existsOnDisk("documents", uploadedFile.storageKey as string)).toBe(true);

    // 2c. Also verify confirmUploadIntent when object is written directly to storage driver (via driver.write)
    const directIntentRes = await rpcCall(
      ["media", "createUploadIntent"],
      {
        originalFilename: "insurance-card.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 18,
        purpose: "insurance",
      },
      user.token,
    );
    expect(directIntentRes.status).toBe(HTTP_OK);
    const directIntent = (await payload(directIntentRes)).intent as Record<string, unknown>;

    const docsDriver = await disks.disk("documents");
    const { defineUploadIntent, saveUploadIntent } = await import("@mohamedhabibwork/storagekit");
    await saveUploadIntent(
      docsDriver,
      defineUploadIntent({
        source: {
          body: Buffer.from("insurance-pdf-data"),
          originalName: "insurance-card.pdf",
          mimeType: "application/pdf",
          size: 18,
        },
        key: String(directIntent.storageKey),
        contentType: "application/pdf",
        overwrite: true,
      }),
    );

    const confirmRes = await rpcCall(
      ["media", "confirmUploadIntent"],
      { fileId: directIntent.fileId },
      user.token,
    );
    expect(confirmRes.status).toBe(HTTP_OK);
    const confirmedFile = (await payload(confirmRes)).file as Record<string, unknown>;
    expect(confirmedFile.id).toBe(directIntent.fileId);
    expect(confirmedFile.fileSizeBytes).toBe(18);
    expect(confirmedFile.checksumSha256).toBeString();
    expect(confirmedFile.status).toBe("pending");
  });

  test("3. automatically links uploaded files on item CREATE (onboarding submitDriverApplication) and item UPDATE (resubmitApplication)", async () => {
    const applicant = await createTestUser("platform_driver");

    const uploadDoc = async (purpose: string, filename: string) => {
      const res = await rpcCall(
        ["media", "uploadFile"],
        {
          originalFilename: filename,
          mimeType: "application/pdf",
          contentBase64: Buffer.from(`content-for-${purpose}-${filename}`).toString("base64"),
          purpose,
        },
        applicant.token,
      );
      expect(res.status).toBe(HTTP_OK);
      return (await payload(res)).file as Record<string, unknown>;
    };

    const licenseFile = await uploadDoc("driver_license", "driver-license.pdf");
    const insuranceFile = await uploadDoc("insurance", "insurance.pdf");

    expect(licenseFile.status).toBe("pending");
    expect(licenseFile.expiresAt).toBeString();

    const now = Date.now();
    const licenseExpiry = new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();
    const labResultDate = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    const validFourMonthInsurance = new Date(now + 125 * 24 * 60 * 60 * 1000).toISOString();

    // Create item: submit driver application referencing the uploaded file storageKeys
    const submitRes = await rpcCall(
      ["onboarding", "submitDriverApplication"],
      {
        nationalId: "28602020101234",
        licenseNumber: `DRV-${randomUUID().slice(0, 6)}`,
        licenseCategory: "First Degree Bus",
        licenseExpiry,
        yearsOfExperience: 5,
        serviceAreas: ["Cairo"],
        hasOwnVehicle: true,
        vehicleMakeModel: "Toyota HiAce",
        vehicleYear: 2023,
        vehiclePlateNumber: "أ ب ج 123",
        vehicleSeatCapacity: 14,
        insurancePolicyNumber: "POL-123",
        insuranceExpiry: validFourMonthInsurance,
        labTestConsentSigned: true,
        backgroundCheckConsentSigned: true,
        labResultSubmittedAt: labResultDate,
        documents: [
          {
            documentType: "commercial_license",
            storageKey: String(licenseFile.storageKey),
            mimeType: "application/pdf",
            fileSizeBytes: Number(licenseFile.fileSizeBytes),
          },
          {
            documentType: "vehicle_insurance",
            storageKey: String(insuranceFile.storageKey),
            mimeType: "application/pdf",
            fileSizeBytes: Number(insuranceFile.fileSizeBytes),
          },
        ],
      },
      applicant.token,
    );

    expect(submitRes.status).toBe(HTTP_OK);
    const submitData = await payload(submitRes);
    const applicationId = String(submitData.id);

    // Verify both uploaded files were automatically linked to the created application item (status='linked', expiresAt=null)
    const linkedListRes = await rpcCall(
      ["media", "listFiles"],
      { linkedEntityType: "application", linkedEntityId: applicationId },
      applicant.token,
    );
    expect(linkedListRes.status).toBe(HTTP_OK);
    const linkedFiles = (await payload(linkedListRes)).files as Array<Record<string, unknown>>;
    expect(linkedFiles.length).toBe(2);
    expect(
      linkedFiles.every(
        (f) =>
          f.status === "linked" &&
          f.linkedEntityType === "application" &&
          f.linkedEntityId === applicationId &&
          f.expiresAt === null,
      ),
    ).toBe(true);

    // Now test item UPDATE: admin requests changes, applicant uploads a new document and calls resubmitApplication
    const reqChangesRes = await rpcCall(
      ["onboarding", "requestApplicationChanges"],
      {
        applicationId,
        decisionReasonCode: "blurry_insurance",
        decisionNotes: "Please upload updated insurance PDF.",
        checklist: [{ field: "vehicle_insurance", instruction: "Upload updated scan" }],
      },
      opsAdmin.token,
    );
    expect(reqChangesRes.status).toBe(HTTP_OK);

    const updatedInsuranceFile = await uploadDoc("insurance", "insurance-renewed.pdf");
    expect(updatedInsuranceFile.status).toBe("pending");

    const resubmitRes = await rpcCall(
      ["onboarding", "resubmitApplication"],
      {
        applicationId,
        updatedPayload: { vehicleMakeModel: "Toyota HiAce 2024" },
        documents: [
          {
            documentType: "vehicle_insurance",
            storageKey: String(updatedInsuranceFile.storageKey),
            mimeType: "application/pdf",
            fileSizeBytes: Number(updatedInsuranceFile.fileSizeBytes),
          },
        ],
      },
      applicant.token,
    );
    expect(resubmitRes.status).toBe(HTTP_OK);

    // Verify the newly uploaded file is now linked to the application with expiresAt=null
    const newInsGet = await rpcCall(
      ["media", "getFile"],
      { fileId: updatedInsuranceFile.id },
      applicant.token,
    );
    const newInsState = (await payload(newInsGet)).file as Record<string, unknown>;
    expect(newInsState.status).toBe("linked");
    expect(newInsState.linkedEntityId).toBe(applicationId);
    expect(newInsState.expiresAt).toBeNull();
  });

  test("4. automatically links organization logo on organization.updateOrganizationSettings and detaches replaced logo", async () => {
    const tenantId = randomUUID();
    const orgOwner = await createTestUser("organization_owner", tenantId);

    await db.insert(schema.organizations).values({
      id: tenantId,
      ownerAccountId: orgOwner.accountId,
      legalEntityName: "Red Sea Adventures SAE",
      displayNameEn: "Red Sea Adventures",
      displayNameAr: "مغامرات البحر الأحمر",
      commercialRegNumberEncrypted: encryptField("CR-9988"),
      taxNumberEncrypted: encryptField("TX-9988"),
      tourismLicenseNumberEncrypted: encryptField("TL-9988"),
      tourismLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      countryCode: "EG",
      headquartersAddress: "Hurghada Marina",
      signatoryFullName: "Omar Reda",
      signatoryNationalIdEncrypted: encryptField("28501010101234"),
      signatoryRoleTitle: "CEO",
      payoutMethod: "bank_transfer",
      payoutIbanEncrypted: encryptField("EG380019000500000000263180002"),
      planTier: "enterprise",
      status: "active",
    });
    createdOrganizationIds.push(tenantId);

    // Upload logo 1
    const logo1Res = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "logo-v1.png",
        mimeType: "image/png",
        contentBase64: Buffer.from("png-logo-v1").toString("base64"),
        purpose: "organization_logo",
      },
      orgOwner.token,
    );
    expect(logo1Res.status).toBe(HTTP_OK);
    const logo1 = (await payload(logo1Res)).file as Record<string, unknown>;
    expect(logo1.status).toBe("pending");

    // Save organization settings with logo1.url -> automatically links logo1 to organization
    const update1Res = await rpcCall(
      ["organization", "updateOrganizationSettings"],
      {
        displayNameAr: "مغامرات البحر الأحمر",
        displayNameEn: "Red Sea Adventures",
        customBrandingEnabled: true,
        logoUrl: String(logo1.url),
      },
      orgOwner.token,
    );
    expect(update1Res.status).toBe(HTTP_OK);

    const logo1AfterSave = (
      await payload(await rpcCall(["media", "getFile"], { fileId: logo1.id }, orgOwner.token))
    ).file as Record<string, unknown>;
    expect(logo1AfterSave.status).toBe("linked");
    expect(logo1AfterSave.linkedEntityType).toBe("organization");
    expect(logo1AfterSave.linkedEntityId).toBe(tenantId);
    expect(logo1AfterSave.expiresAt).toBeNull();

    // Upload logo 2 and update settings -> logo2 becomes 'linked' and logo1 reverts to 'pending' (12h cleanup window)
    const logo2Res = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "logo-v2.webp",
        mimeType: "image/webp",
        contentBase64: Buffer.from("webp-logo-v2").toString("base64"),
        purpose: "organization_logo",
      },
      orgOwner.token,
    );
    const logo2 = (await payload(logo2Res)).file as Record<string, unknown>;

    const update2Res = await rpcCall(
      ["organization", "updateOrganizationSettings"],
      {
        displayNameAr: "مغامرات البحر الأحمر",
        displayNameEn: "Red Sea Adventures",
        customBrandingEnabled: true,
        logoUrl: String(logo2.url),
      },
      orgOwner.token,
    );
    expect(update2Res.status).toBe(HTTP_OK);

    const logo2AfterUpdate = (
      await payload(await rpcCall(["media", "getFile"], { fileId: logo2.id }, orgOwner.token))
    ).file as Record<string, unknown>;
    expect(logo2AfterUpdate.status).toBe("linked");
    expect(logo2AfterUpdate.linkedEntityId).toBe(tenantId);

    const logo1AfterReplace = (
      await payload(await rpcCall(["media", "getFile"], { fileId: logo1.id }, orgOwner.token))
    ).file as Record<string, unknown>;
    expect(logo1AfterReplace.status).toBe("pending");
    expect(logo1AfterReplace.linkedEntityId).toBeNull();
    expect(logo1AfterReplace.expiresAt).toBeString();
  });

  test("5. 12-hour cleanup purges ONLY unlinked files older than 12h (via storagekit deleteMany) and preserves linked or fresh files", async () => {
    const uploadA = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "abandoned-upload.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("abandoned-12h-content").toString("base64"),
        purpose: "kyc",
      },
      user.token,
    );
    const uploadB = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "linked-upload.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("linked-12h-content").toString("base64"),
        purpose: "kyc",
      },
      user.token,
    );
    const uploadC = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "recent-unlinked.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("recent-unlinked-content").toString("base64"),
        purpose: "kyc",
      },
      user.token,
    );

    const fileA = (await payload(uploadA)).file as Record<string, unknown>;
    const fileB = (await payload(uploadB)).file as Record<string, unknown>;
    const fileC = (await payload(uploadC)).file as Record<string, unknown>;

    const thirteenHoursAgo = new Date(Date.now() - 13 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

    // Backdate fileA as unlinked and expired 1h ago
    await db
      .update(schema.uploadedFiles)
      .set({
        createdAt: thirteenHoursAgo,
        expiresAt: oneHourAgo,
      })
      .where(eq(schema.uploadedFiles.id, fileA.id as string));

    // Mark fileB as linked to an application and backdate to 13h ago
    await db
      .update(schema.uploadedFiles)
      .set({
        status: "linked",
        linkedEntityType: "application",
        linkedEntityId: randomUUID(),
        linkedAt: thirteenHoursAgo,
        expiresAt: null,
        createdAt: thirteenHoursAgo,
      })
      .where(eq(schema.uploadedFiles.id, fileB.id as string));

    expect(await existsOnDisk("documents", fileA.storageKey as string)).toBe(true);
    expect(await existsOnDisk("documents", fileB.storageKey as string)).toBe(true);
    expect(await existsOnDisk("documents", fileC.storageKey as string)).toBe(true);

    // Run 12h cleanup endpoint as operations admin
    const cleanupRes = await rpcCall(
      ["media", "cleanupExpiredFiles"],
      { olderThanHours: 12, limit: 100 },
      opsAdmin.token,
    );
    expect(cleanupRes.status).toBe(HTTP_OK);
    const cleanupSummary = await payload(cleanupRes);

    expect(cleanupSummary.deletedCount).toBeGreaterThanOrEqual(1);
    expect(cleanupSummary.expiredFileIds as string[]).toContain(fileA.id as string);
    expect(cleanupSummary.expiredFileIds as string[]).not.toContain(fileB.id as string);
    expect(cleanupSummary.expiredFileIds as string[]).not.toContain(fileC.id as string);

    // Verify physical storage: fileA was deleted via storagekit deleteMany, while fileB and fileC remain intact
    expect(await existsOnDisk("documents", fileA.storageKey as string)).toBe(false);
    expect(await existsOnDisk("documents", fileB.storageKey as string)).toBe(true);
    expect(await existsOnDisk("documents", fileC.storageKey as string)).toBe(true);

    const [rowA] = await db
      .select()
      .from(schema.uploadedFiles)
      .where(eq(schema.uploadedFiles.id, fileA.id as string));
    expect(rowA?.status).toBe("expired");
    expect(rowA?.deletedAt).toBeInstanceOf(Date);
  });

  test("6. background queue worker & deleteFile endpoint work end-to-end", async () => {
    const worker = await startUnlinkedMediaCleanupWorker(60_000);
    const directSummary = await runUnlinkedMediaCleanup({ olderThanHours: 12, limit: 25 });
    expect(directSummary.failedCount).toBe(0);
    await worker.stop();

    const uploadRes = await rpcCall(
      ["media", "uploadFile"],
      {
        originalFilename: "to-delete.png",
        mimeType: "image/png",
        contentBase64: Buffer.from("delete-me-bytes").toString("base64"),
        purpose: "profile_avatar",
      },
      user.token,
    );
    const uploaded = (await payload(uploadRes)).file as Record<string, unknown>;
    expect(await existsOnDisk("uploads", uploaded.storageKey as string)).toBe(true);

    const delRes = await rpcCall(["media", "deleteFile"], { fileId: uploaded.id }, user.token);
    expect(delRes.status).toBe(HTTP_OK);
    const deleted = (await payload(delRes)).file as Record<string, unknown>;
    expect(deleted.status).toBe("deleted");
    expect(deleted.deletedAt).toBeString();
    expect(await existsOnDisk("uploads", uploaded.storageKey as string)).toBe(false);
  });
});
