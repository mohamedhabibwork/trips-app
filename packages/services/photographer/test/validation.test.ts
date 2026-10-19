import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapPhotographerError, PhotographerServiceError } from "../src/errors";
import {
  createTripAlbumSchema,
  listTripAlbumsSchema,
  publishTripAlbumSchema,
  updatePhotographerProfileSchema,
  uploadPhotosToAlbumSchema,
} from "../src/schemas";

describe("Unit: photographer validation schemas & error mapping (@trips-app/service-photographer)", () => {
  test("photographer Zod schemas and error mapper validate inputs", () => {
    expect(
      updatePhotographerProfileSchema.safeParse({
        yearsOfExperience: 6,
        cameraBodies: ["Sony A7 IV"],
        hasDroneLicense: true,
      }).success,
    ).toBe(true);
    expect(
      createTripAlbumSchema.safeParse({
        tripId: randomUUID(),
        titleAr: "ألبوم الرحلة",
        titleEn: "Trip Highlights Album",
        watermarked: true,
      }).success,
    ).toBe(true);
    expect(
      uploadPhotosToAlbumSchema.safeParse({
        albumId: randomUUID(),
        photoUrls: ["https://cdn.trips.eg/photos/1.jpg"],
      }).success,
    ).toBe(true);
    expect(publishTripAlbumSchema.safeParse({ albumId: randomUUID() }).success).toBe(true);
    expect(listTripAlbumsSchema.safeParse(undefined).success).toBe(true);

    const err = new PhotographerServiceError("FORBIDDEN_ALBUM_ACCESS", "Not album owner");
    expect(mapPhotographerError(err).code).toBe("FORBIDDEN");
  });
});
