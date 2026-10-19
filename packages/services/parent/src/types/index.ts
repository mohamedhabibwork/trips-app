import type { z } from "zod/v4";
import type { childTripLiveStatusDtoSchema, parentChildLinkDtoSchema } from "../schemas";
import type { linkChildToParentSchema, revokeChildLinkSchema } from "../schemas/validation";

export type LinkChildToParentInput = z.infer<typeof linkChildToParentSchema>;
export type RevokeChildLinkInput = z.infer<typeof revokeChildLinkSchema>;
export type ParentChildLinkDto = z.infer<typeof parentChildLinkDtoSchema>;
export type ChildTripLiveStatusDto = z.infer<typeof childTripLiveStatusDtoSchema>;
