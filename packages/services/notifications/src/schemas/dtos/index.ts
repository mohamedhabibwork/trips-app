import { selectNotificationMessagesSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const notificationMessageDtoSchema = selectNotificationMessagesSchema;

export const markAllReadResultDtoSchema = z.object({
  updatedCount: z.number().int(),
});
