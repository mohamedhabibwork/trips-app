// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertParentChildLinksSchema,
  selectParentChildLinksSchema,
  updateParentChildLinksSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const parentChildLinkSelectSchema = selectParentChildLinksSchema;
export const parentChildLinkInsertSchema = insertParentChildLinksSchema;
export const parentChildLinkUpdateSchema = updateParentChildLinksSchema;

export const linkChildToParentSchema = insertParentChildLinksSchema
  .pick({
    bookingId: true,
  })
  .extend({
    childPassengerId: z.string().trim().min(1).max(80),
    childFullName: z.string().trim().min(2).max(200),
    relationship: z.string().trim().min(2).max(60).default("guardian"),
  });

export const revokeChildLinkSchema = z.object({
  linkId: z.uuid(),
});

export const getChildTripLiveStatusSchema = z.object({
  linkId: z.uuid(),
});
