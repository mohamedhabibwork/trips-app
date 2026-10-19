// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  assignVehicleStaffInputSchema,
  issueModeratorStaffCodeInputSchema,
  listTripStaffingInputSchema,
  revokeModeratorAssignmentInputSchema,
} from "../validation";

export type ListTripStaffingInput = z.infer<typeof listTripStaffingInputSchema>;
export type AssignVehicleStaffInput = z.infer<typeof assignVehicleStaffInputSchema>;
export type IssueModeratorStaffCodeInput = z.infer<typeof issueModeratorStaffCodeInputSchema>;
export type RevokeModeratorAssignmentInput = z.infer<typeof revokeModeratorAssignmentInputSchema>;
