import type { z } from "zod/v4";
import type {
  moderatorAssignmentDtoSchema,
  moderatorManifestItemDtoSchema,
  moderatorTrackingEventDtoSchema,
} from "../schemas";
import type {
  raiseSafetyAlertSchema,
  recordBoardingCheckInSchema,
  recordHeadcountSchema,
} from "../schemas/validation";

export type RecordBoardingCheckInInput = z.infer<typeof recordBoardingCheckInSchema>;
export type RecordHeadcountInput = z.infer<typeof recordHeadcountSchema>;
export type RaiseSafetyAlertInput = z.infer<typeof raiseSafetyAlertSchema>;
export type ModeratorAssignmentDto = z.infer<typeof moderatorAssignmentDtoSchema>;
export type ModeratorManifestItemDto = z.infer<typeof moderatorManifestItemDtoSchema>;
export type ModeratorTrackingEventDto = z.infer<typeof moderatorTrackingEventDtoSchema>;
