import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { MediaServiceError, mapMediaError } from "../src/errors";
import {
  buildStorageKey,
  computeUnlinkedExpiresAt,
  isUnlinkedFileExpired,
  resolveDiskForPurpose,
  UNLINKED_FILE_TTL_HOURS,
  UNLINKED_FILE_TTL_MS,
  UPLOAD_PURPOSE_POLICIES,
  validateFileForPurpose,
} from "../src/model";
import {
  cleanupExpiredFilesSchema,
  confirmUploadIntentSchema,
  createUploadIntentSchema,
  deleteFileSchema,
  getFileSchema,
  getUploadPurposesSchema,
  listFilesSchema,
  uploadFileSchema,
} from "../src/schemas/validation";

describe("Unit: media validation schemas, purpose policies, model invariants & errors (@trips-app/service-media)", () => {
  describe("uploadFileSchema & purpose-based validation", () => {
    test("accepts valid file upload payload matching purpose policy (e.g. kyc + pdf)", () => {
      const input = {
        originalFilename: "passport-scan.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("sample pdf content").toString("base64"),
        purpose: "kyc",
      };

      const parsed = uploadFileSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });

    test("accepts valid image upload for avatar/trip_cover and video/mp4 for trip_gallery", () => {
      expect(
        uploadFileSchema.safeParse({
          originalFilename: "avatar.webp",
          mimeType: "image/webp",
          contentBase64: Buffer.from("webp bytes").toString("base64"),
          purpose: "avatar",
        }).success,
      ).toBe(true);

      expect(
        uploadFileSchema.safeParse({
          originalFilename: "promo.mp4",
          mimeType: "video/mp4",
          contentBase64: Buffer.from("mp4 bytes").toString("base64"),
          purpose: "trip_gallery",
        }).success,
      ).toBe(true);
    });

    test("rejects file when MIME type or extension is not permitted for the given purpose", () => {
      // PDF is not allowed for avatar / organization_logo / trip_cover
      const pdfForAvatar = uploadFileSchema.safeParse({
        originalFilename: "avatar.pdf",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("pdf bytes").toString("base64"),
        purpose: "avatar",
      });
      expect(pdfForAvatar.success).toBe(false);

      // MP4 video is not allowed for national_id or contract
      const videoForKyc = uploadFileSchema.safeParse({
        originalFilename: "id-video.mp4",
        mimeType: "video/mp4",
        contentBase64: Buffer.from("video bytes").toString("base64"),
        purpose: "national_id",
      });
      expect(videoForKyc.success).toBe(false);

      // Image is not allowed for contract (which requires application/pdf)
      const pngForContract = uploadFileSchema.safeParse({
        originalFilename: "contract.png",
        mimeType: "image/png",
        contentBase64: Buffer.from("png bytes").toString("base64"),
        purpose: "contract",
      });
      expect(pngForContract.success).toBe(false);

      // Extension does not match MIME type (.pdf filename with image/png mimeType)
      const mismatchedExt = uploadFileSchema.safeParse({
        originalFilename: "disguised.pdf",
        mimeType: "image/png",
        contentBase64: Buffer.from("png bytes").toString("base64"),
        purpose: "kyc",
      });
      expect(mismatchedExt.success).toBe(false);

      expect(uploadFileSchema.safeParse(null).success).toBe(false);
      expect(uploadFileSchema.safeParse("not-an-object").success).toBe(false);
    });
  });

  describe("createUploadIntentSchema, confirmUploadIntentSchema & getUploadPurposesSchema", () => {
    test("validates createUploadIntent against purpose policy (MIME type, extension, and maxSizeBytes)", () => {
      // Valid intent for driver_license
      expect(
        createUploadIntentSchema.safeParse({
          originalFilename: "license-front.jpg",
          mimeType: "image/jpeg",
          fileSizeBytes: 1024 * 500,
          purpose: "driver_license",
        }).success,
      ).toBe(true);

      // Rejects oversized avatar (> 5 MB)
      expect(
        createUploadIntentSchema.safeParse({
          originalFilename: "huge-avatar.png",
          mimeType: "image/png",
          fileSizeBytes: 6 * 1024 * 1024,
          purpose: "avatar",
        }).success,
      ).toBe(false);

      // Rejects PDF for organization_logo
      expect(
        createUploadIntentSchema.safeParse({
          originalFilename: "logo.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 10_000,
          purpose: "organization_logo",
        }).success,
      ).toBe(false);
    });

    test("validates confirmUploadIntentSchema and getUploadPurposesSchema", () => {
      expect(confirmUploadIntentSchema.safeParse({ fileId: randomUUID() }).success).toBe(true);
      expect(confirmUploadIntentSchema.safeParse({ fileId: "bad-id" }).success).toBe(false);

      expect(getUploadPurposesSchema.safeParse({}).success).toBe(true);
      expect(getUploadPurposesSchema.safeParse({ purpose: "kyc" }).success).toBe(true);
    });

    test("validateFileForPurpose returns detailed check results", () => {
      const valid = validateFileForPurpose({
        purpose: "organization_logo",
        originalFilename: "brand.png",
        mimeType: "image/png",
        fileSizeBytes: 250_000,
      });
      expect(valid.valid).toBe(true);
      expect(valid.policy.disk).toBe("uploads");

      const invalid = validateFileForPurpose({
        purpose: "organization_logo",
        originalFilename: "brand.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 250_000,
      });
      expect(invalid.valid).toBe(false);
      if (!invalid.valid) {
        expect(invalid.reason).toContain('not allowed for purpose "organization_logo"');
      }
      expect(Object.keys(UPLOAD_PURPOSE_POLICIES).length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("getFileSchema, listFilesSchema, deleteFileSchema, cleanupExpiredFilesSchema", () => {
    test("validates boundary inputs and applies defaults", () => {
      const getRes = getFileSchema.safeParse({ fileId: randomUUID() });
      expect(getRes.success).toBe(true);
      if (getRes.success) {
        expect(getRes.data.expiresInSeconds).toBe(3600);
      }

      const listRes = listFilesSchema.safeParse({ status: "pending" });
      expect(listRes.success).toBe(true);
      if (listRes.success) {
        expect(listRes.data.limit).toBe(50);
      }

      expect(deleteFileSchema.safeParse({ fileId: randomUUID() }).success).toBe(true);
      expect(deleteFileSchema.safeParse({ fileId: "not-a-uuid" }).success).toBe(false);

      const cleanupRes = cleanupExpiredFilesSchema.safeParse({});
      expect(cleanupRes.success).toBe(true);
      if (cleanupRes.success) {
        expect(cleanupRes.data.olderThanHours).toBe(UNLINKED_FILE_TTL_HOURS);
        expect(cleanupRes.data.limit).toBe(100);
      }
    });
  });

  describe("12-hour unlinked file expiration & storagekit key generation invariants", () => {
    test("computes 12-hour expiration window and evaluates unlinked expiration accurately", () => {
      const uploadedAt = new Date("2026-10-17T08:00:00.000Z");
      const expiresAt = computeUnlinkedExpiresAt(uploadedAt);

      expect(expiresAt.getTime() - uploadedAt.getTime()).toBe(UNLINKED_FILE_TTL_MS);
      expect(expiresAt.toISOString()).toBe("2026-10-17T20:00:00.000Z");

      const ElevenHoursLater = new Date("2026-10-17T19:00:00.000Z");
      const TwelveHoursLater = new Date("2026-10-17T20:00:00.000Z");

      expect(
        isUnlinkedFileExpired(
          { status: "pending", linkedEntityId: null, expiresAt },
          ElevenHoursLater,
        ),
      ).toBe(false);

      expect(
        isUnlinkedFileExpired(
          { status: "pending", linkedEntityId: null, expiresAt },
          TwelveHoursLater,
        ),
      ).toBe(true);

      // Linked files never expire even after 12h
      expect(
        isUnlinkedFileExpired(
          { status: "linked", linkedEntityId: "trip-123", expiresAt: null },
          TwelveHoursLater,
        ),
      ).toBe(false);
    });

    test("resolves storage disk by purpose and builds sanitized storage keys via storagekit randomKey", () => {
      expect(resolveDiskForPurpose("kyc")).toBe("documents");
      expect(resolveDiskForPurpose("trip_cover")).toBe("uploads");
      expect(resolveDiskForPurpose("temp")).toBe("temp");
      expect(resolveDiskForPurpose("trip_cover", "temp")).toBe("temp");

      const key = buildStorageKey({
        accountId: "acc-1",
        purpose: "National_ID",
        originalFilename: "../my id scan (front).pdf",
        now: new Date("2026-10-17T10:00:00.000Z"),
      });
      expect(key.startsWith("national_id/2026/10/17/acc-1/")).toBe(true);
      expect(key.endsWith(".pdf")).toBe(true);
    });

    test("maps MediaServiceError codes to canonical shared error codes", () => {
      const err = new MediaServiceError("RESOURCE_NOT_FOUND", "File missing");
      const mapped = mapMediaError(err);
      expect(err.code).toBe("RESOURCE_NOT_FOUND");
      expect(mapped.code).toBe("RESOURCE_NOT_FOUND");
    });
  });
});
