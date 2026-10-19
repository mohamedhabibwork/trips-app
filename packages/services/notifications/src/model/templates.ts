// Bilingual (ar/en) message templates for auth notifications. Pure: no I/O (WF-NTF-04).
import type { AuthNotificationEvent, NotificationLocale, RenderedMessage } from "../types";

export const DEFAULT_LOCALE: NotificationLocale = "en";

interface Copy {
  subject: string;
  heading: string;
  lines: readonly string[];
  /** Short single-sentence form for SMS. Omitted for email-only events. */
  sms?: string;
  code?: string;
  action?: { label: string; url: string };
}

type CopyBuilder<E extends AuthNotificationEvent> = (event: E, recipientName: string) => Copy;
type Catalog = {
  [K in AuthNotificationEvent["type"]]: Record<
    NotificationLocale,
    CopyBuilder<Extract<AuthNotificationEvent, { type: K }>>
  >;
};

const OTP_PURPOSE_EN: Record<string, string> = {
  registration: "verify your account",
  sign_in: "sign in",
  password_reset: "reset your password",
  contact_change: "confirm your new contact detail",
  staff_2fa: "finish signing in",
};
const OTP_PURPOSE_AR: Record<string, string> = {
  registration: "توثيق حسابك",
  sign_in: "تسجيل الدخول",
  password_reset: "إعادة تعيين كلمة المرور",
  contact_change: "تأكيد وسيلة التواصل الجديدة",
  staff_2fa: "إتمام تسجيل الدخول",
};

const CATALOG: Catalog = {
  otp: {
    en: (e) => ({
      subject: `${e.code} is your Trips verification code`,
      heading: "Your verification code",
      lines: [
        `Use this code to ${OTP_PURPOSE_EN[e.purpose] ?? "continue"}. It expires in ${e.expiresInMinutes} minutes.`,
        "Never share this code. Trips staff will never ask for it.",
      ],
      code: e.code,
      sms: `Trips: ${e.code} is your code to ${OTP_PURPOSE_EN[e.purpose] ?? "continue"}. Expires in ${e.expiresInMinutes} min. Do not share it.`,
    }),
    ar: (e) => ({
      subject: `${e.code} هو رمز التحقق الخاص بك في Trips`,
      heading: "رمز التحقق الخاص بك",
      lines: [
        `استخدم هذا الرمز لـ ${OTP_PURPOSE_AR[e.purpose] ?? "المتابعة"}. تنتهي صلاحيته خلال ${e.expiresInMinutes} دقيقة.`,
        "لا تشارك هذا الرمز مع أحد. لن يطلبه منك فريق Trips أبدًا.",
      ],
      code: e.code,
      sms: `Trips: ${e.code} هو رمزك لـ ${OTP_PURPOSE_AR[e.purpose] ?? "المتابعة"}. صالح ${e.expiresInMinutes} دقيقة. لا تشاركه.`,
    }),
  },
  admin_invite: {
    en: (e, name) => ({
      subject: "You are invited to the Trips admin console",
      heading: `Welcome, ${name}`,
      lines: [
        `You have been invited as ${e.subRole.replaceAll("_", " ")}.`,
        `This invitation expires in ${e.expiresInHours} hours.`,
      ],
      action: { label: "Accept invitation", url: e.inviteUrl },
    }),
    ar: (e, name) => ({
      subject: "تمت دعوتك إلى لوحة إدارة Trips",
      heading: `مرحبًا ${name}`,
      lines: [
        `تمت دعوتك بصفة ${e.subRole.replaceAll("_", " ")}.`,
        `تنتهي صلاحية الدعوة خلال ${e.expiresInHours} ساعة.`,
      ],
      action: { label: "قبول الدعوة", url: e.inviteUrl },
    }),
  },
  employee_invite: {
    en: (e, name) => ({
      subject: `${e.organizationName} invited you to join on Trips`,
      heading: `Hello ${name}`,
      lines: [
        `${e.organizationName} invited you to join as ${e.roleTitle}.`,
        `This invitation expires in ${e.expiresInDays} days.`,
      ],
      action: { label: "Accept invitation", url: e.inviteUrl },
    }),
    ar: (e, name) => ({
      subject: `دعتك ${e.organizationName} للانضمام عبر Trips`,
      heading: `مرحبًا ${name}`,
      lines: [
        `دعتك ${e.organizationName} للانضمام بصفة ${e.roleTitle}.`,
        `تنتهي صلاحية الدعوة خلال ${e.expiresInDays} أيام.`,
      ],
      action: { label: "قبول الدعوة", url: e.inviteUrl },
    }),
  },
  new_device_sign_in: {
    en: (e) => ({
      subject: "New sign-in to your Trips account",
      heading: "New device sign-in",
      lines: [
        `Device: ${e.device}`,
        `IP address: ${e.ipAddress}`,
        `Time: ${e.occurredAt}`,
        "If this was not you, reset your password now and contact support.",
      ],
      sms: `Trips: new sign-in from ${e.device}. If this was not you, reset your password now.`,
    }),
    ar: (e) => ({
      subject: "تسجيل دخول جديد إلى حسابك في Trips",
      heading: "تسجيل دخول من جهاز جديد",
      lines: [
        `الجهاز: ${e.device}`,
        `عنوان IP: ${e.ipAddress}`,
        `الوقت: ${e.occurredAt}`,
        "إذا لم تكن أنت، أعد تعيين كلمة المرور فورًا وتواصل مع الدعم.",
      ],
      sms: `Trips: تسجيل دخول جديد من ${e.device}. إذا لم تكن أنت، أعد تعيين كلمة المرور فورًا.`,
    }),
  },
  password_changed: {
    en: () => ({
      subject: "Your Trips password was changed",
      heading: "Password changed",
      lines: [
        "Your password was changed and all your sessions were signed out.",
        "If this was not you, contact support immediately.",
      ],
      sms: "Trips: your password was changed. If this was not you, contact support now.",
    }),
    ar: () => ({
      subject: "تم تغيير كلمة مرور حسابك في Trips",
      heading: "تم تغيير كلمة المرور",
      lines: [
        "تم تغيير كلمة المرور وتسجيل خروجك من جميع الجلسات.",
        "إذا لم تكن أنت، تواصل مع الدعم فورًا.",
      ],
      sms: "Trips: تم تغيير كلمة مرورك. إذا لم تكن أنت، تواصل مع الدعم فورًا.",
    }),
  },
  contact_changed: {
    en: (e) => ({
      subject: `Your Trips ${e.changedChannel === "email" ? "email" : "phone number"} was changed`,
      heading: "Contact detail changed",
      lines: [
        `Your ${e.changedChannel === "email" ? "email address" : "phone number"} is now ${e.maskedValue}.`,
        "If this was not you, contact support immediately.",
      ],
      sms: `Trips: your ${e.changedChannel === "email" ? "email" : "phone"} was changed to ${e.maskedValue}. Not you? Contact support.`,
    }),
    ar: (e) => ({
      subject: `تم تغيير ${e.changedChannel === "email" ? "بريدك الإلكتروني" : "رقم هاتفك"} في Trips`,
      heading: "تم تغيير وسيلة التواصل",
      lines: [
        `أصبح ${e.changedChannel === "email" ? "بريدك الإلكتروني" : "رقم هاتفك"} الآن ${e.maskedValue}.`,
        "إذا لم تكن أنت، تواصل مع الدعم فورًا.",
      ],
      sms: `Trips: تم تغيير ${e.changedChannel === "email" ? "بريدك" : "هاتفك"} إلى ${e.maskedValue}. لست أنت؟ تواصل مع الدعم.`,
    }),
  },
  account_locked: {
    en: (e) => ({
      subject: "Your Trips account is temporarily locked",
      heading: "Account temporarily locked",
      lines: [
        "There were too many failed sign-in attempts.",
        `You can try again after ${e.lockedUntil}.`,
        "If this was not you, reset your password.",
      ],
      sms: `Trips: too many failed sign-ins. Your account is locked until ${e.lockedUntil}.`,
    }),
    ar: (e) => ({
      subject: "تم قفل حسابك في Trips مؤقتًا",
      heading: "تم قفل الحساب مؤقتًا",
      lines: [
        "تعددت محاولات تسجيل الدخول الفاشلة.",
        `يمكنك المحاولة مجددًا بعد ${e.lockedUntil}.`,
        "إذا لم تكن أنت، أعد تعيين كلمة المرور.",
      ],
      sms: `Trips: محاولات دخول فاشلة كثيرة. الحساب مقفل حتى ${e.lockedUntil}.`,
    }),
  },
  account_suspended: {
    en: (e) => ({
      subject: "Your Trips account was suspended",
      heading: "Account suspended",
      lines: [`Reason: ${e.reason}`, "Contact support if you believe this is a mistake."],
      sms: "Trips: your account was suspended. Contact support for details.",
    }),
    ar: (e) => ({
      subject: "تم تعليق حسابك في Trips",
      heading: "تم تعليق الحساب",
      lines: [`السبب: ${e.reason}`, "تواصل مع الدعم إذا كنت تعتقد أن ذلك خطأ."],
      sms: "Trips: تم تعليق حسابك. تواصل مع الدعم لمعرفة التفاصيل.",
    }),
  },
  account_reinstated: {
    en: () => ({
      subject: "Your Trips account is active again",
      heading: "Account reinstated",
      lines: ["Your account was reinstated. You can sign in again."],
      sms: "Trips: your account was reinstated. You can sign in again.",
    }),
    ar: () => ({
      subject: "تمت إعادة تفعيل حسابك في Trips",
      heading: "تمت إعادة تفعيل الحساب",
      lines: ["تمت إعادة تفعيل حسابك. يمكنك تسجيل الدخول مجددًا."],
      sms: "Trips: تمت إعادة تفعيل حسابك. يمكنك تسجيل الدخول مجددًا.",
    }),
  },
  deletion_requested: {
    en: (e) => ({
      subject: "Your Trips account is scheduled for deletion",
      heading: "Account deletion requested",
      lines: [
        `Your account will be permanently deleted on ${e.purgeScheduledAt}.`,
        `Sign in within ${e.graceDays} days to cancel the deletion.`,
      ],
      sms: `Trips: account deletion scheduled for ${e.purgeScheduledAt}. Sign in to cancel.`,
    }),
    ar: (e) => ({
      subject: "تمت جدولة حذف حسابك في Trips",
      heading: "تم طلب حذف الحساب",
      lines: [
        `سيتم حذف حسابك نهائيًا في ${e.purgeScheduledAt}.`,
        `سجّل الدخول خلال ${e.graceDays} يومًا لإلغاء الحذف.`,
      ],
      sms: `Trips: تمت جدولة حذف حسابك في ${e.purgeScheduledAt}. سجّل الدخول للإلغاء.`,
    }),
  },
  account_restored: {
    en: () => ({
      subject: "Your Trips account was restored",
      heading: "Account restored",
      lines: ["The deletion was cancelled and your account is active."],
      sms: "Trips: your account deletion was cancelled.",
    }),
    ar: () => ({
      subject: "تمت استعادة حسابك في Trips",
      heading: "تمت استعادة الحساب",
      lines: ["تم إلغاء الحذف وحسابك نشط."],
      sms: "Trips: تم إلغاء حذف حسابك.",
    }),
  },
  totp_reset: {
    en: () => ({
      subject: "Your authenticator was reset",
      heading: "Authenticator reset",
      lines: [
        "A Super Admin reset your authenticator app.",
        "You must enrol a new one at your next sign-in. All sessions were signed out.",
      ],
    }),
    ar: () => ({
      subject: "تمت إعادة تعيين تطبيق المصادقة الخاص بك",
      heading: "إعادة تعيين تطبيق المصادقة",
      lines: [
        "قام مدير النظام بإعادة تعيين تطبيق المصادقة.",
        "يجب تسجيل تطبيق جديد عند تسجيل الدخول التالي. تم تسجيل خروجك من جميع الجلسات.",
      ],
    }),
  },
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function buildHtml(copy: Copy, locale: NotificationLocale): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "right" : "left";
  const paragraphs = copy.lines
    .map((line) => `<p style="margin:0 0 12px;line-height:1.6">${escapeHtml(line)}</p>`)
    .join("");
  const code = copy.code
    ? `<p dir="ltr" style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0;text-align:center">${escapeHtml(copy.code)}</p>`
    : "";
  const action =
    copy.action && isHttpUrl(copy.action.url)
      ? `<p style="margin:20px 0"><a href="${escapeHtml(copy.action.url)}" style="background:#0f766e;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(copy.action.label)}</a></p>`
      : "";
  return (
    `<!doctype html><html lang="${locale}" dir="${dir}"><body style="margin:0;padding:24px;font-family:Arial,sans-serif;color:#111;text-align:${align}">` +
    `<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(copy.heading)}</h1>${paragraphs}${code}${action}` +
    `<p style="margin:24px 0 0;color:#666;font-size:12px">Trips Enjoy</p></body></html>`
  );
}

function buildText(copy: Copy): string {
  const parts = [copy.heading, ...copy.lines];
  if (copy.code) parts.push(copy.code);
  if (copy.action) parts.push(`${copy.action.label}: ${copy.action.url}`);
  return parts.join("\n\n");
}

function greetingName(name: string | null | undefined, locale: NotificationLocale): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return locale === "ar" ? "عميلنا" : "there";
}

/**
 * Renders one event in one language. An unknown locale falls back to English (D-182).
 * Arabic HTML gets `dir="rtl"` (WF-NTF-04.2).
 */
export function renderAuthMessage(
  event: AuthNotificationEvent,
  options: { locale?: NotificationLocale; recipientName?: string | null } = {},
): RenderedMessage {
  const locale: NotificationLocale = options.locale === "ar" ? "ar" : DEFAULT_LOCALE;
  const builders = CATALOG[event.type] as Record<NotificationLocale, CopyBuilder<typeof event>>;
  const copy = builders[locale](event, greetingName(options.recipientName, locale));
  return {
    subject: copy.subject,
    text: buildText(copy),
    html: buildHtml(copy, locale),
    sms: copy.sms ?? null,
  };
}
