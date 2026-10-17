import { afterAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { eq, schema, sql } from "@trips-app/db";
import { signAccessToken } from "@trips-app/domain";

import { app } from "../../src/index";
import { db } from "../../src/services";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;

const DEMO_PASSWORD = "DemoPassword123!";

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

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

async function payload(response: Response): Promise<Record<string, unknown>> {
  const body = await readRpcBody(response);
  return (body.json ?? {}) as Record<string, unknown>;
}

function identity(prefix = "qa+onb"): { email: string; phone: string } {
  const compact = randomUUID().replace(/-/g, "");
  return {
    email: `${prefix}+${compact.slice(0, 12)}@example.com`,
    phone: `+2015${compact.slice(12, 21)}`,
  };
}

interface OtpDispatch {
  channel: string;
  targetIdentifier: string;
  devCodePreview?: string;
}

/**
 * Registers a supplier account and verifies BOTH email and SMS OTPs, returning the accountId and session token.
 */
async function registerAndVerifySupplier(
  role: "organization_owner" | "platform_driver" | "platform_photographer",
): Promise<{
  accountId: string;
  email: string;
  phone: string;
  accessToken: string;
}> {
  const { email, phone } = identity();
  const regRes = await rpcCall(["auth", "registerSupplierAccount"], {
    role,
    fullName: `QA ${role}`,
    email,
    phone,
    password: DEMO_PASSWORD,
    preferredLanguage: "en",
    surface: "web",
  });
  expect(regRes.status).toBe(HTTP_OK);
  const regData = await payload(regRes);
  const dispatches = (regData.otpDispatches ?? []) as OtpDispatch[];
  expect(dispatches.length).toBe(2);

  let latestSession: Record<string, unknown> | null = null;
  for (const dispatch of dispatches) {
    const verifyRes = await rpcCall(["auth", "verifyOtp"], {
      targetIdentifier: dispatch.targetIdentifier,
      purpose: "registration",
      code: dispatch.devCodePreview!,
      surface: "web",
    });
    expect(verifyRes.status).toBe(HTTP_OK);
    const verifyData = await payload(verifyRes);
    if (verifyData.session) {
      latestSession = verifyData.session as Record<string, unknown>;
    }
  }

  expect(latestSession).not.toBeNull();
  return {
    accountId: regData.accountId as string,
    email,
    phone,
    accessToken: latestSession!.accessToken as string,
  };
}

function adminToken(subRole: "super_admin" | "operations" = "operations"): string {
  return signAccessToken({
    sub: randomUUID(),
    sid: randomUUID(),
    role: "admin",
    adminSubRole: subRole,
  } as Parameters<typeof signAccessToken>[0]);
}

describe("E2E onboarding: organization application, duplicate hold, changes cycle, and approval", () => {
  test("submits organization application, detects duplicate CR/tax hold (T-ONB-14), runs changes cycle, and provisions tenant on approval", async () => {
    // Arrange
    const org1 = await registerAndVerifySupplier("organization_owner");
    const org2 = await registerAndVerifySupplier("organization_owner");
    const opsToken = adminToken("operations");
    const sharedCr = `CR-DUP-${randomUUID().slice(0, 8).toUpperCase()}`;
    const sharedTax = `TX-DUP-${randomUUID().slice(0, 8).toUpperCase()}`;
    const futureExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const baseOrgPayload = {
      legalEntityName: "QA Horizon Tours SAE",
      displayNameEn: "QA Horizon",
      displayNameAr: "آفاق الجودة",
      commercialRegNumber: sharedCr,
      taxNumber: sharedTax,
      tourismLicenseNumber: `TL-${randomUUID().slice(0, 8)}`,
      tourismLicenseExpiry: futureExpiry,
      countryCode: "EG",
      headquartersAddress: "15 Tahrir Square, Cairo, Egypt",
      signatoryFullName: "Khaled Ibrahim",
      signatoryNationalId: "28101010101234",
      signatoryRoleTitle: "Managing Director",
      payoutMethod: "bank_transfer",
      payoutIbanOrWallet: "EG380019000500000000263180002",
      billingContactName: "Mona Ibrahim",
      billingContactEmail: org1.email,
      billingContactPhone: org1.phone,
      billingAddress: "15 Tahrir Square, Cairo, Egypt",
      invoiceLanguage: "ar",
      childSafetyProgramOptIn: true,
      safetyLeadName: "Heba Safety",
      safetyHotlinePhone: "+201022223333",
      emergencyEscalationAcknowledged: true,
      documents: [
        {
          documentType: "commercial_registration",
          storageKey: `org/${org1.accountId}/cr.pdf`,
          mimeType: "application/pdf",
          fileSizeBytes: 245000,
        },
      ],
    };

    // Act 1: First organization submits application
    const submit1Res = await rpcCall(
      ["onboarding", "submitOrganizationApplication"],
      baseOrgPayload,
      org1.accessToken,
    );
    expect(submit1Res.status).toBe(HTTP_OK);
    const app1 = await payload(submit1Res);
    const app1Id = app1.id as string;
    expect(app1.state).toBe("Pending Review");
    expect((app1.payload as Record<string, unknown>).duplicateHold).toBe(false);

    // Act 2: Second organization submits with the SAME commercialRegNumber -> flagged with duplicateHold (not auto-rejected)
    const submit2Res = await rpcCall(
      ["onboarding", "submitOrganizationApplication"],
      {
        ...baseOrgPayload,
        legalEntityName: "QA Duplicate Org",
        billingContactEmail: org2.email,
        billingContactPhone: org2.phone,
      },
      org2.accessToken,
    );
    expect(submit2Res.status).toBe(HTTP_OK);
    const app2 = await payload(submit2Res);
    expect(app2.state).toBe("Pending Review");
    expect((app2.payload as Record<string, unknown>).duplicateHold).toBe(true);

    // Act 3: Admin lists review queue with duplicateHoldOnly filter
    const queueRes = await rpcCall(
      ["onboarding", "listReviewQueue"],
      { duplicateHoldOnly: true },
      opsToken,
    );
    expect(queueRes.status).toBe(HTTP_OK);
    const queueItems = (await readRpcBody(queueRes)).json as unknown as Array<
      Record<string, unknown>
    >;
    expect(queueItems.some((item) => item.id === app2.id && item.duplicateHold === true)).toBe(
      true,
    );

    // Act 4: Admin inspects application detail, opens document (audit logged), and verifies document
    const detailRes = await rpcCall(
      ["onboarding", "getApplicationDetail"],
      { applicationId: app1Id },
      opsToken,
    );
    expect(detailRes.status).toBe(HTTP_OK);
    const detail = await payload(detailRes);
    const docs = (detail.documents ?? []) as Array<Record<string, unknown>>;
    expect(docs.length).toBe(1);
    const docId = docs[0]!.id as string;

    const openDocRes = await rpcCall(
      ["onboarding", "openApplicationDocument"],
      {
        applicationId: app1Id,
        documentId: docId,
        reason: "Inspect commercial registration certificate",
      },
      opsToken,
    );
    expect(openDocRes.status).toBe(HTTP_OK);
    const openDocData = await payload(openDocRes);
    expect(typeof openDocData.signedAccessUrl).toBe("string");

    const verifyDocRes = await rpcCall(
      ["onboarding", "verifyApplicationDocument"],
      {
        applicationId: app1Id,
        documentId: docId,
        verifiedStatus: "verified",
      },
      opsToken,
    );
    expect(verifyDocRes.status).toBe(HTTP_OK);
    expect((await payload(verifyDocRes)).verifiedStatus).toBe("verified");

    // Act 5: Admin requests changes -> Applicant requests +7d extension -> Resubmits -> Admin approves
    const reqChangesRes = await rpcCall(
      ["onboarding", "requestApplicationChanges"],
      {
        applicationId: app1Id,
        decisionReasonCode: "blurry_tax_card",
        decisionNotes: "Please upload a clearer tax card scan.",
        checklist: [{ field: "taxCard", instruction: "Upload 300 DPI PDF scan" }],
      },
      opsToken,
    );
    expect(reqChangesRes.status).toBe(HTTP_OK);
    expect((await payload(reqChangesRes)).state).toBe("Changes Requested");

    const extRes = await rpcCall(
      ["onboarding", "requestChangesExtension"],
      { applicationId: app1Id, reason: "Awaiting stamped copy from tax authority" },
      org1.accessToken,
    );
    expect(extRes.status).toBe(HTTP_OK);
    expect((await payload(extRes)).changesExtensionUsed).toBe(true);

    const resubmitRes = await rpcCall(
      ["onboarding", "resubmitApplication"],
      {
        applicationId: app1Id,
        updatedPayload: { headquartersAddress: "20 Corniche El Nil, Cairo, Egypt" },
        documents: [
          {
            documentType: "tax_card",
            storageKey: `org/${org1.accountId}/tax-clear.pdf`,
            mimeType: "application/pdf",
            fileSizeBytes: 180000,
          },
        ],
      },
      org1.accessToken,
    );
    expect(resubmitRes.status).toBe(HTTP_OK);
    expect((await payload(resubmitRes)).state).toBe("Pending Review");

    const approveRes = await rpcCall(
      ["onboarding", "approveApplication"],
      {
        applicationId: app1Id,
        decisionReasonCode: "verified_complete",
        decisionNotes: "All organization credentials verified.",
      },
      opsToken,
    );
    expect(approveRes.status).toBe(HTTP_OK);
    const approvedApp = await payload(approveRes);
    expect(approvedApp.state).toBe("Approved");
    expect(typeof approvedApp.provisionedOrganizationId).toBe("string");

    // Act 6: Provisioned organization owner onboards, lists, and removes an org_driver (SCR-ORG-20)
    const orgOwnerToken = signAccessToken({
      sub: org1.accountId,
      sid: randomUUID(),
      role: "organization_owner",
      tenantId: approvedApp.provisionedOrganizationId as string,
      planTier: "starter",
    } as Parameters<typeof signAccessToken>[0]);

    const supplierPhone = identity("qa+orgdrv").phone;
    const onboardSupRes = await rpcCall(
      ["onboarding", "onboardOrganizationSupplier"],
      {
        supplierRole: "org_driver",
        fullName: "QA Org Driver",
        phone: supplierPhone,
        nationalId: "28701010104455",
        licenseNumber: "ORG-LIC-8811",
        licenseCategory: "First Degree Bus",
        labTestConsentSigned: true,
      },
      orgOwnerToken,
    );
    expect(onboardSupRes.status).toBe(HTTP_OK);
    const onboardedSup = await payload(onboardSupRes);
    const supplierAccountId = onboardedSup.supplierAccountId as string;

    const listSupRes = await rpcCall(
      ["onboarding", "listOrganizationSuppliers"],
      { supplierRole: "org_driver" },
      orgOwnerToken,
    );
    expect(listSupRes.status).toBe(HTTP_OK);
    const listSupData = await payload(listSupRes);
    const suppliers = (listSupData.suppliers ?? []) as Array<Record<string, unknown>>;
    expect(suppliers.some((s) => s.supplierAccountId === supplierAccountId)).toBe(true);

    const removeSupRes = await rpcCall(
      ["onboarding", "removeOrganizationSupplier"],
      {
        supplierAccountId,
        supplierRole: "org_driver",
        reason: "Seasonal contract completed",
      },
      orgOwnerToken,
    );
    expect(removeSupRes.status).toBe(HTTP_OK);
    expect((await payload(removeSupRes)).removed).toBe(true);
  });
});

describe("E2E onboarding: platform driver (3-month insurance + consents) and photographer rejection/appeal", () => {
  test("validates driver 3-month insurance and records both lab and background check consents (T-ONB-03, T-ONB-11)", async () => {
    // Arrange
    const driver = await registerAndVerifySupplier("platform_driver");
    const now = Date.now();
    const licenseExpiry = new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();
    const labResultDate = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    const tooShortInsurance = new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString(); // < 3 months
    const validFourMonthInsurance = new Date(now + 125 * 24 * 60 * 60 * 1000).toISOString(); // >= 3 months

    // Act 1: Insurance < 3 months is rejected with 400 VALIDATION_ERROR
    const invalidRes = await rpcCall(
      ["onboarding", "submitDriverApplication"],
      {
        nationalId: "28602020101234",
        licenseNumber: "DRV-LIC-100",
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
        insuranceExpiry: tooShortInsurance,
        labTestConsentSigned: true,
        backgroundCheckConsentSigned: true,
        labResultSubmittedAt: labResultDate,
        documents: [
          {
            documentType: "commercial_license",
            storageKey: `driver/${driver.accountId}/lic.pdf`,
            mimeType: "application/pdf",
            fileSizeBytes: 110000,
          },
        ],
      },
      driver.accessToken,
    );
    expect(invalidRes.status).toBe(HTTP_BAD_REQUEST);

    // Act 2: Insurance >= 3 months succeeds and records both consents
    const validRes = await rpcCall(
      ["onboarding", "submitDriverApplication"],
      {
        nationalId: "28602020101234",
        licenseNumber: "DRV-LIC-100",
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
            storageKey: `driver/${driver.accountId}/lic.pdf`,
            mimeType: "application/pdf",
            fileSizeBytes: 110000,
          },
        ],
      },
      driver.accessToken,
    );
    expect(validRes.status).toBe(HTTP_OK);
    const driverApp = await payload(validRes);

    // Verify both consent records are returned in getApplicationDetail
    const detailRes = await rpcCall(
      ["onboarding", "getApplicationDetail"],
      { applicationId: driverApp.id },
      adminToken("operations"),
    );
    expect(detailRes.status).toBe(HTTP_OK);
    const detailData = await payload(detailRes);
    const consents = (detailData.consents ?? []) as Array<{ consentType: string }>;
    expect(consents.some((c) => c.consentType === "driver_lab_test")).toBe(true);
    expect(consents.some((c) => c.consentType === "driver_background_check")).toBe(true);
  });

  test("enforces 30-day reapply block after rejection and allows one-time appeal decision (FR-ONB-05, WF-APP-06)", async () => {
    // Arrange
    const photographer = await registerAndVerifySupplier("platform_photographer");
    const opsToken = adminToken("operations");

    const photoPayload = {
      nationalId: "29104040101234",
      yearsOfExperience: 4,
      cameraBodies: ["Sony A7 IV"],
      lenses: ["24-70mm f/2.8"],
      hasDroneLicense: false,
      serviceRegions: ["Cairo", "Luxor"],
      specialties: ["Cultural Heritage"],
      portfolioPhotoCount: 9,
      sampleAlbums: [{ title: "Karnak Temple", photoCount: 9 }],
      documents: [
        {
          documentType: "national_id",
          storageKey: `photo/${photographer.accountId}/id.jpg`,
          mimeType: "image/jpeg",
          fileSizeBytes: 105000,
        },
      ],
    };

    // Act 1: Submit photographer application
    const subRes = await rpcCall(
      ["onboarding", "submitPhotographerApplication"],
      photoPayload,
      photographer.accessToken,
    );
    expect(subRes.status).toBe(HTTP_OK);
    const appData = await payload(subRes);
    const appId = appData.id as string;

    // Act 2: Admin rejects application
    const rejRes = await rpcCall(
      ["onboarding", "rejectApplication"],
      {
        applicationId: appId,
        decisionReasonCode: "portfolio_quality",
        decisionNotes: "Portfolio images did not meet minimum resolution requirements.",
      },
      opsToken,
    );
    expect(rejRes.status).toBe(HTTP_OK);
    expect((await payload(rejRes)).state).toBe("Rejected");

    // Act 3: Immediate re-application is blocked for 30 days (403 FORBIDDEN)
    const blockedRes = await rpcCall(
      ["onboarding", "submitPhotographerApplication"],
      photoPayload,
      photographer.accessToken,
    );
    expect(blockedRes.status).toBe(HTTP_FORBIDDEN);

    // Act 4: Applicant submits one-time appeal -> Admin approves appeal
    const appealRes = await rpcCall(
      ["onboarding", "submitAppeal"],
      {
        applicationId: appId,
        appealStatement:
          "Uploaded full-resolution uncompressed RAW exports and verified camera serials.",
        documents: [
          {
            documentType: "portfolio_highres",
            storageKey: `photo/${photographer.accountId}/highres.jpg`,
            mimeType: "image/jpeg",
            fileSizeBytes: 4200000,
          },
        ],
      },
      photographer.accessToken,
    );
    expect(appealRes.status).toBe(HTTP_OK);
    expect((await payload(appealRes)).state).toBe("Appealed");

    const decideRes = await rpcCall(
      ["onboarding", "decideAppeal"],
      {
        applicationId: appId,
        decision: "approve",
        decisionReasonCode: "appeal_verified",
        decisionNotes: "High-resolution portfolio verified.",
      },
      opsToken,
    );
    expect(decideRes.status).toBe(HTTP_OK);
    expect((await payload(decideRes)).state).toBe("Approved");

    // Act 5: Applicant checks status
    const statusRes = await rpcCall(
      ["onboarding", "getApplicationStatus"],
      { applicationId: appId },
      photographer.accessToken,
    );
    expect(statusRes.status).toBe(HTTP_OK);
    const statusData = await payload(statusRes);
    expect((statusData.application as Record<string, unknown>).state).toBe("Approved");
  });
});

afterAll(async () => {
  try {
    const emailPattern = "qa+onb+%";
    const orgDrvPhonePattern = "+2015%";
    const qaAccounts = await db
      .select({ id: schema.accounts.id })
      .from(schema.accounts)
      .where(sql`${schema.accounts.emailNormalized} like ${emailPattern}`);
    for (const acc of qaAccounts) {
      await db.delete(schema.organizations).where(eq(schema.organizations.ownerAccountId, acc.id));
      await db.delete(schema.accounts).where(eq(schema.accounts.id, acc.id));
    }
    await db
      .delete(schema.accounts)
      .where(
        sql`${schema.accounts.fullName} = 'QA Org Driver' and ${schema.accounts.phoneE164} like ${orgDrvPhonePattern}`,
      );
  } catch {
    // Best-effort cleanup
  }
});
