import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapParentError, ParentServiceError } from "../src/errors";
import {
  getChildTripLiveStatusSchema,
  linkChildToParentSchema,
  revokeChildLinkSchema,
} from "../src/schemas";

describe("Unit: parent validation schemas & error mapping (@trips-app/service-parent)", () => {
  test("parent Zod schemas and error mapper validate inputs", () => {
    expect(
      linkChildToParentSchema.safeParse({
        bookingId: randomUUID(),
        childPassengerId: "pax-child-1",
        childFullName: "Youssef Ahmed",
        relationship: "parent",
      }).success,
    ).toBe(true);
    expect(revokeChildLinkSchema.safeParse({ linkId: randomUUID() }).success).toBe(true);
    expect(getChildTripLiveStatusSchema.safeParse({ linkId: randomUUID() }).success).toBe(true);

    const err = new ParentServiceError("FORBIDDEN_PARENT_ACCESS", "Not guardian");
    expect(mapParentError(err).code).toBe("FORBIDDEN");
  });
});
