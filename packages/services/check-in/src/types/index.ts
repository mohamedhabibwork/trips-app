import type { z } from "zod/v4";
import type { checkInRecordDtoSchema } from "../schemas";
import type {
  listTripManifestSchema,
  manualCheckInOverrideSchema,
  verifyAndCheckInByQrSchema,
} from "../schemas/validation";

export type ListTripManifestInput = z.infer<typeof listTripManifestSchema>;
export type VerifyAndCheckInByQrInput = z.infer<typeof verifyAndCheckInByQrSchema>;
export type ManualCheckInOverrideInput = z.infer<typeof manualCheckInOverrideSchema>;
export type CheckInRecordDto = z.infer<typeof checkInRecordDtoSchema>;
