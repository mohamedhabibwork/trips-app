// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions (see .claude/rules/drizzle-zod-schemas.md).
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  schema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { PRIVACY_REQUEST_TYPES, SUPPORTED_COUNTRIES, SUPPORTED_LOCALES } from "../../model";

export const travelerAccountUpdateSchema = createUpdateSchema(schema.accounts, {
  fullName: (column) => column.trim().min(1).max(200),
  countryCode: () => z.enum(SUPPORTED_COUNTRIES),
  preferredLanguage: () => z.enum(SUPPORTED_LOCALES),
  avatarUrl: (column) => column.trim().max(2048),
});

export const notificationPreferencesSelectSchema = createSelectSchema(
  schema.notificationPreferences,
);

export const updateNotificationPreferencesInputSchema = createUpdateSchema(
  schema.notificationPreferences,
).omit({
  accountId: true,
  updatedAt: true,
});

export const updateProfileInputSchema = travelerAccountUpdateSchema
  .pick({
    fullName: true,
    countryCode: true,
    preferredLanguage: true,
    avatarUrl: true,
  })
  .required({
    fullName: true,
    countryCode: true,
  })
  .extend({
    email: z.string().trim().email().max(320).nullable().optional(),
    phoneE164: z.string().trim().min(7).max(24).nullable().optional(),
    avatarFileId: z.uuid().nullable().optional(),
    fileIds: z.array(z.uuid()).optional(),
    notificationPreferences: updateNotificationPreferencesInputSchema.optional(),
  });

export const privacyRequestInsertSchema = createInsertSchema(schema.privacyRequests, {
  requestType: () => z.enum(PRIVACY_REQUEST_TYPES),
  reason: (column) => column.trim().max(500),
});

export const requestPrivacyActionInputSchema = privacyRequestInsertSchema
  .pick({
    requestType: true,
    reason: true,
  })
  .extend({
    confirmedUnderstood: z.boolean().optional(),
  });
