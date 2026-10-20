// Integration: the auth service sends the right message for each flow (WF-ID-*, WF-NTF-01).
// Runs against the real local Postgres with an injected recording notifier, so no mail or SMS leaves
// the machine. Every account uses a `qa+<uuid>@trips-enjoy.com` address; `afterAll` removes them again.
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createDb,
  demoAccountId,
  type DemoSeedSummary,
  schema,
  seedDemoData,
  sql,
} from "@trips-app/db";
import { createAuthService } from "@trips-app/service-auth";
import type {
  AuthNotificationEvent,
  AuthNotifier,
  DeliveryOutcome,
  NotificationRecipient,
} from "@trips-app/service-notifications";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const PASSWORD = "DemoPassword123!";
const NEW_PASSWORD = "AnotherPassword456!";
const CODE_PATTERN = /^\d{6}$/;

function resolveTestDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(import.meta.dir, "../../../apps/server/.env");
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.+)$/m);
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return "postgresql://postgres:postgres@localhost:5432/trips";
}

interface RecordedCall {
  recipient: NotificationRecipient;
  event: AuthNotificationEvent;
  maxRetries: number | undefined;
}

type Outcome = DeliveryOutcome["status"];

function recordingNotifier(status: Outcome = "sent") {
  const calls: RecordedCall[] = [];
  const notifier: AuthNotifier = {
    notify: async (recipient, event, options) => {
      calls.push({ recipient, event, maxRetries: options?.maxRetries });
      const channel = event.type === "otp" ? event.channel : "email";
      return [{ channel, status, attempts: 1 }];
    },
  };
  return { calls, notifier };
}

function eventsOf<T extends AuthNotificationEvent["type"]>(calls: RecordedCall[], type: T) {
  return calls.filter((call) => call.event.type === type) as Array<
    RecordedCall & { event: Extract<AuthNotificationEvent, { type: T }> }
  >;
}

function identity() {
  const id = randomUUID();
  const digits = id.replace(/\D/g, "").padEnd(8, "0").slice(0, 8);
  return { email: `qa+${id}@trips-enjoy.com`, phone: `+2015${digits}` };
}

describe("Integration: auth notifications", () => {
  const db = createDb({ DATABASE_URL: resolveTestDatabaseUrl() });
  let seed: DemoSeedSummary;

  beforeAll(async () => {
    seed = await seedDemoData(db);
  });

  afterAll(async () => {
    // Best-effort cleanup: no assertion depends on row counts.
    try {
      const pattern = "qa+%";
      await db
        .delete(schema.employeeMemberships)
        .where(sql`${schema.employeeMemberships.invitedEmail} like ${pattern}`);
      await db
        .delete(schema.adminInvites)
        .where(sql`${schema.adminInvites.emailNormalized} like ${pattern}`);
      await db
        .delete(schema.accounts)
        .where(sql`${schema.accounts.emailNormalized} like ${pattern}`);
    } catch {
      // Intentionally ignored.
    }
  });

  function superAdmin() {
    return {
      accountId: demoAccountId(seed, "superadmin@trips-enjoy.com"),
      activeRole: "admin" as const,
      adminSubRole: "super_admin" as const,
    };
  }

  async function register(notifier: AuthNotifier, withPhone = true) {
    const { email, phone } = identity();
    const service = createAuthService(db, { notifier });
    const result = await service.registerTraveler({
      fullName: "QA Notify",
      email,
      phone: withPhone ? phone : undefined,
      password: PASSWORD,
      preferredLanguage: "ar",
      surface: "web",
    });
    return { service, email, phone, result };
  }

  test("registration sends each OTP on its own channel with the code that verifies", async () => {
    // Arrange
    const { calls, notifier } = recordingNotifier();

    // Act
    const { service, email, result } = await register(notifier);

    // Assert
    const otps = eventsOf(calls, "otp");
    expect(otps.map((c) => c.event.channel).sort()).toEqual(["email", "sms"]);
    const emailOtp = otps.find((c) => c.event.channel === "email");
    expect(emailOtp?.recipient.email).toBe(email);
    expect(emailOtp?.recipient.locale).toBe("ar");
    expect(emailOtp?.event.code).toMatch(CODE_PATTERN);
    expect(emailOtp?.event.purpose).toBe("registration");

    const emailDispatch = result.otpDispatches.find((d) => d.channel === "email");
    expect(emailDispatch?.deliveryStatus).toBe("sent");
    // The code in the message is the code that verifies the account.
    const verified = await service.verifyOtp({
      targetIdentifier: email,
      purpose: "registration",
      code: emailOtp?.event.code as string,
      surface: "web",
    });
    expect(verified.session).not.toBeNull();
  });

  test("OTP delivery uses the configured retry budget from auth settings", async () => {
    const { calls, notifier } = recordingNotifier();

    await register(notifier);

    const settings = await createAuthService(db).getAuthSettings();
    expect(eventsOf(calls, "otp")[0]?.maxRetries).toBe(settings.otpDeliveryMaxRetries);
  });

  test("a failed delivery is reported as failed_fallback_available and stored on the OTP row", async () => {
    const { notifier } = recordingNotifier("failed");

    const { email, result } = await register(notifier, false);

    const dispatch = result.otpDispatches.find((d) => d.channel === "email");
    expect(dispatch?.deliveryStatus).toBe("failed_fallback_available");
    const [row] = await db
      .select({ deliveryStatus: schema.otpVerifications.deliveryStatus })
      .from(schema.otpVerifications)
      .where(sql`${schema.otpVerifications.targetIdentifier} = ${email}`);
    expect(row?.deliveryStatus).toBe("failed_fallback_available");
  });

  test("a skipped delivery counts as sent outside production so QA can use devCodePreview", async () => {
    const { notifier } = recordingNotifier("skipped");

    const { result } = await register(notifier, false);

    expect(result.otpDispatches[0]?.deliveryStatus).toBe("sent");
    expect(result.otpDispatches[0]?.devCodePreview).toMatch(CODE_PATTERN);
  });

  test("password reset sends a code only for a known account, then a password-changed notice", async () => {
    // Arrange
    const { calls, notifier } = recordingNotifier();
    const { service, email } = await register(notifier, false);
    calls.length = 0;

    // Act and assert: an unknown identifier gets nothing
    await service.requestPasswordReset({ identifier: `qa+${randomUUID()}@trips-enjoy.com` });
    expect(calls).toHaveLength(0);

    // Act and assert: a known identifier gets a code, then a notice after the change
    await service.requestPasswordReset({ identifier: email });
    const reset = eventsOf(calls, "otp");
    expect(reset).toHaveLength(1);
    expect(reset[0]?.event.purpose).toBe("password_reset");

    await service.confirmPasswordReset({
      identifier: email,
      otpCode: reset[0]?.event.code as string,
      newPassword: NEW_PASSWORD,
    });
    const changed = eventsOf(calls, "password_changed");
    expect(changed).toHaveLength(1);
    expect(changed[0]?.recipient.email).toBe(email);
  });

  test("five wrong passwords send one account-locked notice", async () => {
    const { calls, notifier } = recordingNotifier();
    const { service, email } = await register(notifier, false);
    calls.length = 0;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await service
        .signIn({
          identifier: email,
          method: "password",
          password: `WrongPassword${attempt}!`,
          surface: "web",
        })
        .catch(() => undefined);
    }

    const locked = eventsOf(calls, "account_locked");
    expect(locked).toHaveLength(1);
    expect(locked[0]?.recipient.email).toBe(email);
  });

  test("suspending then reinstating an account notifies the account holder both times", async () => {
    const { calls, notifier } = recordingNotifier();
    const { service, email, result } = await register(notifier, false);
    calls.length = 0;

    await service.suspendAccount(superAdmin(), {
      targetAccountId: result.accountId,
      reason: "Policy test",
    });
    await service.reinstateAccount(superAdmin(), {
      targetAccountId: result.accountId,
      reason: "Cleared",
    });

    const suspended = eventsOf(calls, "account_suspended");
    expect(suspended).toHaveLength(1);
    expect(suspended[0]?.event.reason).toBe("Policy test");
    expect(suspended[0]?.recipient.email).toBe(email);
    expect(eventsOf(calls, "account_reinstated")).toHaveLength(1);
  });

  test("requesting account deletion notifies with the grace period, and restoring notifies again", async () => {
    const { calls, notifier } = recordingNotifier();
    const { service, email, result } = await register(notifier, false);
    calls.length = 0;

    const deletion = await service.requestAccountDeletion(
      { accountId: result.accountId, activeRole: "traveler" },
      {},
    );
    await service.restoreAccountFromDeletion({ identifier: email });

    const requested = eventsOf(calls, "deletion_requested");
    expect(requested).toHaveLength(1);
    expect(requested[0]?.event.graceDays).toBe(deletion.gracePeriodDays);
    expect(eventsOf(calls, "account_restored")).toHaveLength(1);
  });

  test("an admin invite emails the invitee a link with the invite token and reports delivery", async () => {
    const { calls, notifier } = recordingNotifier();
    const service = createAuthService(db, { notifier, webBaseUrl: "https://app.example.com/" });
    const { email } = identity();

    const invite = await service.adminInviteStaff(superAdmin(), {
      email,
      fullName: "QA Invitee",
      subRole: "operations",
    });

    const sent = eventsOf(calls, "admin_invite");
    expect(sent).toHaveLength(1);
    expect(sent[0]?.recipient.email).toBe(email);
    expect(sent[0]?.event.inviteUrl).toBe(
      `https://app.example.com/admin/accept-invite?token=${encodeURIComponent(invite.inviteToken)}`,
    );
    expect(invite.delivery).toBe("sent");
  });

  test("an employee invite reports failed delivery without failing the invite", async () => {
    const { calls, notifier } = recordingNotifier("failed");
    const service = createAuthService(db, { notifier });
    const { email } = identity();

    const invite = await service.inviteEmployee(
      {
        accountId: demoAccountId(seed, "owner@nilehorizon.eg"),
        activeRole: "organization_owner",
        activeTenantId: seed.ids.organizations.nileHorizonEnterprise,
      },
      { email, roleTitle: "Coordinator", preset: "trip_coordinator" },
    );

    const sent = eventsOf(calls, "employee_invite");
    expect(sent).toHaveLength(1);
    expect(sent[0]?.event.inviteUrl).toContain("/business/accept-invite?token=");
    expect(invite.delivery).toBe("failed");
    expect(invite.inviteToken.length).toBeGreaterThan(0);
  });

  test("a notifier that throws still registers the account and offers the fallback channel", async () => {
    const throwing: AuthNotifier = {
      notify: async () => {
        throw new Error("provider exploded");
      },
    };

    const { result } = await register(throwing, false);

    expect(result.accountId).toBeTruthy();
    expect(result.otpDispatches[0]?.deliveryStatus).toBe("failed_fallback_available");
  });

  test("a notifier that throws never fails the security action it reports on", async () => {
    const throwing: AuthNotifier = {
      notify: async () => {
        throw new Error("provider exploded");
      },
    };
    const { result } = await register(recordingNotifier().notifier, false);
    const service = createAuthService(db, { notifier: throwing });

    const suspension = await service.suspendAccount(superAdmin(), {
      targetAccountId: result.accountId,
      reason: "Throwing notifier",
    });

    expect(suspension.suspended).toBe(true);
  });
});
