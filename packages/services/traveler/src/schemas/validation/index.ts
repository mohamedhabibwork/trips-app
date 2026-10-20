// Zod schemas that validate input at the boundary.
import {
  insertAccountsSchema,
  insertNotificationPreferencesSchema,
  insertPrivacyRequestsSchema,
  selectAccountsSchema,
  selectNotificationPreferencesSchema,
  selectPrivacyRequestsSchema,
  updateAccountsSchema,
  updateNotificationPreferencesSchema,
  updatePrivacyRequestsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { PRIVACY_REQUEST_TYPES, SUPPORTED_COUNTRIES, SUPPORTED_LOCALES } from "../../model";

export const accountSelectSchema = selectAccountsSchema;
export const accountInsertSchema = insertAccountsSchema;
export const accountUpdateSchema = updateAccountsSchema;

export const notificationPreferencesSelectSchema = selectNotificationPreferencesSchema;
export const notificationPreferencesInsertSchema = insertNotificationPreferencesSchema;
export const notificationPreferencesUpdateSchema = updateNotificationPreferencesSchema;

export const privacyRequestSelectSchema = selectPrivacyRequestsSchema;
export const privacyRequestInsertSchema = insertPrivacyRequestsSchema
  .pick({
    requestType: true,
    reason: true,
  })
  .extend({
    requestType: z.enum(PRIVACY_REQUEST_TYPES),
    reason: z.string().trim().max(500).optional(),
  });
export const privacyRequestUpdateSchema = updatePrivacyRequestsSchema;

export const travelerAccountUpdateSchema = updateAccountsSchema
  .pick({
    fullName: true,
    countryCode: true,
    preferredLanguage: true,
    avatarUrl: true,
  })
  .extend({
    fullName: z.string().trim().min(1).max(200),
    countryCode: z.enum(SUPPORTED_COUNTRIES),
    preferredLanguage: z.enum(SUPPORTED_LOCALES),
    avatarUrl: z.string().trim().max(2048).nullable().optional(),
  });

export const updateNotificationPreferencesInputSchema = updateNotificationPreferencesSchema.omit({
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

export const requestPrivacyActionInputSchema = privacyRequestInsertSchema
  .pick({
    requestType: true,
    reason: true,
  })
  .extend({
    confirmedUnderstood: z.boolean().optional(),
  });
