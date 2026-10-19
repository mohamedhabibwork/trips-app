import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapTrackingError, TrackingServiceError } from "../src/errors";
import {
  getTripLiveTrackingSchema,
  recordChildSafetyEventSchema,
  recordGpsPingSchema,
} from "../src/schemas";

describe("Unit: tracking validation schemas & error mapping (@trips-app/service-tracking)", () => {
  test("tracking Zod schemas and error mapper validate inputs", () => {
    expect(
      recordGpsPingSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        coordinates: {
          latitude: 30.0444,
          longitude: 31.2357,
          speedKmh: 75,
          headingDeg: 180,
        },
      }).success,
    ).toBe(true);
    expect(
      recordChildSafetyEventSchema.safeParse({
        tripId: randomUUID(),
        childPassengerId: "pax-child-1",
        eventType: "child_boarded",
      }).success,
    ).toBe(true);
    expect(getTripLiveTrackingSchema.safeParse({ tripId: randomUUID() }).success).toBe(true);

    const err = new TrackingServiceError("FORBIDDEN_TRACKING_ACCESS", "Cross-tenant");
    expect(mapTrackingError(err).code).toBe("FORBIDDEN");
  });
});
