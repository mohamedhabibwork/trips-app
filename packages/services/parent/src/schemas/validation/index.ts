import { z } from "zod/v4";

export const linkChildToParentSchema = z.object({
  bookingId: z.string().uuid(),
  childPassengerId: z.string().trim().min(1).max(80),
  childFullName: z.string().trim().min(2).max(200),
  relationship: z.string().trim().min(2).max(60).default("guardian"),
});

export const revokeChildLinkSchema = z.object({
  linkId: z.string().uuid(),
});

export const getChildTripLiveStatusSchema = z.object({
  linkId: z.string().uuid(),
});
