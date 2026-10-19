import { z } from "zod/v4";

export const recordBoardingCheckInSchema = z.object({
  checkInRecordId: z.uuid(),
  status: z.enum(["checked_in", "no_show"]).default("checked_in"),
  notes: z.string().trim().max(400).optional(),
});

export const recordHeadcountSchema = z.object({
  countedPassengers: z.number().int().min(0).max(200),
  notes: z.string().trim().max(400).optional(),
});

export const raiseSafetyAlertSchema = z.object({
  severity: z.enum(["warning", "critical"]).default("warning"),
  messageAr: z.string().trim().min(3).max(500),
  messageEn: z.string().trim().min(3).max(500),
});
