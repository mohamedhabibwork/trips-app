// Shared TypeScript types, ids and enums. No I/O.
import type { z } from "zod";

import type {
  approveApplicationSchema,
  decideAppealSchema,
  getApplicationDetailSchema,
  getApplicationStatusSchema,
  listReviewQueueSchema,
  onboardOrganizationSupplierSchema,
  rejectApplicationSchema,
  requestApplicationChangesSchema,
  requestChangesExtensionSchema,
  resubmitApplicationSchema,
  submitAppealSchema,
  submitDriverApplicationSchema,
  submitOrganizationApplicationSchema,
  submitPhotographerApplicationSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as OnboardingErrorCode,
} from "@trips-app/domain";

export interface OnboardingRequestMeta {
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type SubmitOrganizationApplicationInput = z.infer<
  typeof submitOrganizationApplicationSchema
>;
export type SubmitDriverApplicationInput = z.infer<typeof submitDriverApplicationSchema>;
export type SubmitPhotographerApplicationInput = z.infer<
  typeof submitPhotographerApplicationSchema
>;
export type GetApplicationStatusInput = z.infer<typeof getApplicationStatusSchema>;
export type RequestChangesExtensionInput = z.infer<typeof requestChangesExtensionSchema>;
export type ResubmitApplicationInput = z.infer<typeof resubmitApplicationSchema>;
export type SubmitAppealInput = z.infer<typeof submitAppealSchema>;
export type OnboardOrganizationSupplierInput = z.infer<typeof onboardOrganizationSupplierSchema>;
export type ListReviewQueueInput = z.infer<typeof listReviewQueueSchema>;
export type GetApplicationDetailInput = z.infer<typeof getApplicationDetailSchema>;
export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type RequestApplicationChangesInput = z.infer<typeof requestApplicationChangesSchema>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
export type DecideAppealInput = z.infer<typeof decideAppealSchema>;
