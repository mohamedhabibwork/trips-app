// Shared TypeScript types, ids and enums. No I/O.
import type { OtpPurpose, SupportedLocale } from "@trips-app/domain";
import type { z } from "zod/v4";
import type { notificationMessageDtoSchema } from "../schemas";
import type { markNotificationReadSchema, sendNotificationSchema } from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  NotificationCategory,
  NotificationDeliveryChannel,
  SharedErrorCode,
  SharedErrorCode as NotificationsErrorCode,
} from "@trips-app/domain";

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type NotificationMessageDto = z.infer<typeof notificationMessageDtoSchema>;

/** Twilio-compatible SMS gateway credentials. Structurally equal to `@trips-app/rpc` `SmsGatewaySettings`. */
export interface SmsGatewaySettings {
  accountSid: string;
  authToken: string;
  from: string;
  baseUrl?: string;
}

export type NotificationLocale = SupportedLocale;
export type NotificationChannel = "email" | "sms";

/** Who receives a message. Channels with no address on the recipient are skipped. */
export interface NotificationRecipient {
  accountId?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  locale?: NotificationLocale;
}

/** Business events raised by the auth service (WF-ID-*, WF-NTF-01). */
export type AuthNotificationEvent =
  | {
      type: "otp";
      purpose: OtpPurpose;
      channel: NotificationChannel;
      code: string;
      expiresInMinutes: number;
    }
  | {
      type: "admin_invite";
      subRole: string;
      inviteUrl: string;
      expiresInHours: number;
    }
  | {
      type: "employee_invite";
      organizationName: string;
      roleTitle: string;
      inviteUrl: string;
      expiresInDays: number;
    }
  | { type: "new_device_sign_in"; device: string; ipAddress: string; occurredAt: string }
  | { type: "password_changed" }
  | { type: "contact_changed"; changedChannel: NotificationChannel; maskedValue: string }
  | { type: "account_locked"; lockedUntil: string }
  | { type: "account_suspended"; reason: string }
  | { type: "account_reinstated" }
  | { type: "deletion_requested"; graceDays: number; purgeScheduledAt: string }
  | { type: "account_restored" }
  | { type: "totp_reset" };

export type AuthNotificationType = AuthNotificationEvent["type"];

export type DeliveryStatus = "sent" | "failed" | "skipped";

/** What happened on one channel. `skipped` means no provider is configured or no address exists. */
export interface DeliveryOutcome {
  channel: NotificationChannel;
  status: DeliveryStatus;
  provider?: string;
  attempts: number;
  reason?: string;
}

export interface NotifyOptions {
  /** Extra attempts after the first failure (WF-NTF-06 default is 3). */
  maxRetries?: number;
}

/**
 * Port the auth service depends on. `notify` never rejects: delivery problems come back as
 * `failed` outcomes so a notification fault can never abort a sign-in or a reset.
 */
export interface AuthNotifier {
  notify(
    recipient: NotificationRecipient,
    event: AuthNotificationEvent,
    options?: NotifyOptions,
  ): Promise<readonly DeliveryOutcome[]>;
}

export interface RenderedMessage {
  subject: string;
  text: string;
  html: string;
  /** Short SMS body, or null when the event is email-only. */
  sms: string | null;
}
