import { randomUUID } from "node:crypto";

import {
  addWorkingDays,
  type ApplicationState,
  computeBlindIndex,
  createDefaultOrganizationSettings,
  EMPLOYEE_ROLE_PRESETS,
  encryptField,
  hashPassword,
  hashSha256,
  normalizeEmail,
  normalizePhoneE164,
  type OrgPermissionMatrix,
  type SupplierApplicationType,
} from "@trips-app/domain";
import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "../index";
import { createLookupsRepository } from "../lookups";
import {
  accountRoles,
  accounts,
  adminInvites,
  applicationDocuments,
  applications,
  consentRecords,
  driverProfiles,
  employeeMemberships,
  moderatorAssignments,
  notificationPreferences,
  organizationSettings,
  coupons,
  organizations,
  otpVerifications,
  photographerProfiles,
  tripPhotoAlbums,
  tripPrograms,
  tripSeatInventory,
  tripVehicles,
  trips,
  vehicleTypes,
  vehicles,
} from "../schema";
import type {
  AccountSeedSpec,
  DemoAccountCredential,
  DemoOrgKey,
  DemoSeedSummary,
  SeedDefaultOptions,
} from "../types";
import { seedDefaultData } from "./default";

export type {
  AccountSeedSpec,
  DemoAccountCredential,
  DemoOrgKey,
  DemoSeedIds,
  DemoSeedSummary,
} from "../types";

export const DEMO_DEFAULT_PASSWORD = "DemoPassword123!";
export const DEMO_SHARED_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
export const DEMO_MODERATOR_STAFF_CODE = "849201";
export const DEMO_UNVERIFIED_OTP_CODE = "123456";

/**
 * Resolves the id of an existing row so re-seeding updates instead of duplicating. When no row
 * matches the natural key a fresh identifier is generated at runtime.
 */
async function resolveId(query: PromiseLike<{ id: string }[]>): Promise<string> {
  const [existing] = await query;
  return existing?.id ?? randomUUID();
}

/** Reads a seeded account id by email. Throws instead of returning an unusable placeholder. */
export function demoAccountId(summary: DemoSeedSummary, email: string): string {
  const id = summary.ids.accounts[email];
  if (!id) {
    throw new Error(`Demo seeder did not create an account for "${email}".`);
  }
  return id;
}

/** Reads a seeded application id by the applicant email that owns it. */
export function demoApplicationId(summary: DemoSeedSummary, applicantEmail: string): string {
  const id = summary.ids.applications[applicantEmail];
  if (!id) {
    throw new Error(`Demo seeder did not create an application for "${applicantEmail}".`);
  }
  return id;
}

export async function seedDemoData(
  db: Database,
  options?: SeedDefaultOptions,
): Promise<DemoSeedSummary> {
  const now = options?.now ?? new Date();
  const defaultSummary = await seedDefaultData(db, { ...options, now });
  const bootstrapSuperAdminId = defaultSummary.bootstrapSuperAdmin.id;
  const sharedPasswordHash = await hashPassword(DEMO_DEFAULT_PASSWORD);

  const in15Min = new Date(now.getTime() + 15 * 60 * 1000);
  const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in9Months = new Date(now.getTime() + 270 * 24 * 60 * 60 * 1000);
  const in2Years = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const demoAccountSpecs: AccountSeedSpec[] = [
    // 1. Platform Admins (D-49)
    {
      email: "superadmin@trips-enjoy.com",
      phone: "+201000000002",
      fullName: "Karim Mansour (Super Admin)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      roles: [
        {
          role: "admin",
          adminSubRole: "super_admin",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },
    {
      email: "ops.admin@trips-enjoy.com",
      phone: "+201000000003",
      fullName: "Nour El-Din (Operations Admin)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      roles: [
        {
          role: "admin",
          adminSubRole: "operations",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },
    {
      email: "finance.admin@trips-enjoy.com",
      phone: "+201000000004",
      fullName: "Salma Hassan (Finance Admin)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      roles: [
        {
          role: "admin",
          adminSubRole: "finance",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },
    {
      email: "new.admin@trips-enjoy.com",
      phone: "+201000000005",
      fullName: "Tariq Adel (First-Sign-In Admin)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: false,
      roles: [
        {
          role: "admin",
          adminSubRole: "operations",
        },
      ],
      secondFactorNote: "Requires TOTP Enrollment on first sign-in (SCR-PUB-10)",
    },

    // 2. Organization Owners (3 Tiers: Enterprise, Growth, Starter)
    {
      email: "owner@nilehorizon.eg",
      phone: "+201000000011",
      fullName: "Hossam El-Shazly (Nile Horizon Owner)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      tenantName: "Nile Horizon Tours (Enterprise)",
      roles: [
        {
          role: "organization_owner",
          tenantKey: "nileHorizonEnterprise",
          planTier: "enterprise",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET}) or SMS OTP`,
    },
    {
      email: "owner@redsea.eg",
      phone: "+201000000012",
      fullName: "Mona Zaki (Red Sea Explorers Owner)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "sms",
      tenantName: "Red Sea Explorers (Growth)",
      roles: [
        {
          role: "organization_owner",
          tenantKey: "redSeaGrowth",
          planTier: "growth",
        },
      ],
      secondFactorNote: "SMS OTP or TOTP",
    },
    {
      email: "owner@sinaitrails.eg",
      phone: "+201000000013",
      fullName: "Youssef Salem (Sinai Trails Owner)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      tenantName: "Sinai Trails (Starter)",
      roles: [
        {
          role: "organization_owner",
          tenantKey: "sinaiStarter",
          planTier: "starter",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },

    // 3. Organization Employees (incl. Multi-Org Employee)
    {
      email: "trips.emp@nilehorizon.eg",
      phone: "+201000000021",
      fullName: "Amira Fathy (Trips & Bookings Coordinator)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      tenantName: "Nile Horizon Tours",
      roles: [
        {
          role: "organization_employee",
          tenantKey: "nileHorizonEnterprise",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },
    {
      email: "finance.emp@nilehorizon.eg",
      phone: "+201000000022",
      fullName: "Sherif Kamel (Organization Accountant)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      tenantName: "Nile Horizon Tours",
      roles: [
        {
          role: "organization_employee",
          tenantKey: "nileHorizonEnterprise",
        },
      ],
      secondFactorNote: `TOTP (${DEMO_SHARED_TOTP_SECRET})`,
    },
    {
      email: "multi.emp@trips-enjoy.com",
      phone: "+201000000023",
      fullName: "Rania Nabil (Multi-Org Operations Employee)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      tenantName: "Nile Horizon + Red Sea Explorers",
      roles: [
        {
          role: "organization_employee",
          tenantKey: "nileHorizonEnterprise",
        },
        {
          role: "organization_employee",
          tenantKey: "redSeaGrowth",
        },
      ],
      secondFactorNote: "Multi-Org Switcher (FR-AUTH-07)",
    },
    {
      email: "firstlogin.emp@redsea.eg",
      phone: "+201000000024",
      fullName: "Wael Gamal (First-Sign-In Employee)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: false,
      staffSecondFactorMethod: null,
      tenantName: "Red Sea Explorers",
      roles: [
        {
          role: "organization_employee",
          tenantKey: "redSeaGrowth",
        },
      ],
      secondFactorNote: "Awaiting first-sign-in 2FA setup (SCR-PUB-12)",
    },

    // 4. Travelers, Parent & Multi-Role User
    {
      email: "traveler.free@example.com",
      phone: "+201000000031",
      fullName: "Omar Khaled (Free Traveler)",
      locale: "ar",
      preferredSignInMethod: "otp",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "traveler",
          planTier: "free",
        },
      ],
    },
    {
      email: "traveler.explorer@example.com",
      phone: "+201000000032",
      fullName: "Layla Ibrahim (Explorer Traveler)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "traveler",
          planTier: "explorer",
        },
      ],
    },
    {
      email: "traveler.vip@example.com",
      phone: "+201000000033",
      fullName: "Ziad Mahmoud (VIP Traveler)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "traveler",
          planTier: "vip",
        },
      ],
    },
    {
      email: "parent.guardian@example.com",
      phone: "+201000000034",
      fullName: "Dina Mostafa (Parent / Guardian)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "traveler",
          planTier: "explorer",
        },
        {
          role: "parent",
          planTier: "explorer",
        },
      ],
    },
    {
      email: "multirole@example.com",
      phone: "+201000000035",
      fullName: "Hassan Samir (Traveler + Studio Photographer)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "traveler",
          planTier: "free",
        },
        {
          role: "platform_photographer",
          planTier: "studio",
        },
      ],
      secondFactorNote: "Role Switcher account (FR-AUTH-06, BRL-06)",
    },

    // 5. Drivers (Platform & Org-Owned)
    {
      email: "driver.basic@example.com",
      phone: "+201000000041",
      fullName: "Mahmoud Said (Basic Platform Driver w/ Vehicle)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_driver",
          planTier: "basic",
        },
        {
          role: "traveler",
          planTier: "free",
        },
      ],
    },
    {
      email: "driver.pro@example.com",
      phone: "+201000000042",
      fullName: "Ibrahim Naguib (Professional Platform Driver, No Vehicle)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_driver",
          planTier: "professional",
        },
      ],
    },
    {
      email: "driver.labpause@example.com",
      phone: "+201000000043",
      fullName: "Ashraf Tolba (Lab-Test Paused Platform Driver)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_driver",
          planTier: "basic",
          status: "paused",
          pauseReason: "random_lab_test_pending",
        },
      ],
      secondFactorNote: "Paused pending random lab test result (FR-DRV-03)",
    },
    {
      email: "org.driver@nilehorizon.eg",
      phone: "+201000000044",
      fullName: "Sayed Metwally (Nile Horizon Org Driver)",
      locale: "ar",
      preferredSignInMethod: "otp",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      tenantName: "Nile Horizon Tours",
      roles: [
        {
          role: "org_driver",
          tenantKey: "nileHorizonEnterprise",
        },
      ],
    },

    // 6. Photographers (Platform & Org-Owned)
    {
      email: "photo.basic@example.com",
      phone: "+201000000051",
      fullName: "Farida Lotfy (Basic Platform Photographer)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_photographer",
          planTier: "basic",
        },
      ],
    },
    {
      email: "photo.pro@example.com",
      phone: "+201000000052",
      fullName: "Tamer Hosny (Pro Platform Photographer)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_photographer",
          planTier: "pro",
        },
      ],
    },
    {
      email: "org.photo@nilehorizon.eg",
      phone: "+201000000053",
      fullName: "Mariam Amin (Nile Horizon Org Photographer)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      tenantName: "Nile Horizon Tours",
      roles: [
        {
          role: "org_photographer",
          tenantKey: "nileHorizonEnterprise",
        },
      ],
    },

    // 7. Vehicle Moderator (D-107)
    {
      email: "moderator.bus1@nilehorizon.eg",
      phone: "+201000000061",
      fullName: "Khaled Soliman (Vehicle Moderator Bus #1)",
      locale: "ar",
      preferredSignInMethod: "staff_code",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      tenantName: "Nile Horizon Tours",
      roles: [
        {
          role: "moderator",
          tenantKey: "nileHorizonEnterprise",
        },
      ],
      secondFactorNote: `Staff Code: ${DEMO_MODERATOR_STAFF_CODE} (valid until 24h post-trip)`,
    },

    // 8. Special Auth State Accounts (Edge Cases)
    {
      email: "unverified@example.com",
      phone: "+201000000071",
      fullName: "Hanaa Adel (Pending OTP Verification)",
      locale: "ar",
      preferredSignInMethod: "otp",
      status: "pending_verification",
      emailVerified: false,
      phoneVerified: false,
      roles: [
        {
          role: "traveler",
          planTier: "free",
        },
      ],
      secondFactorNote: `Active OTP Code: ${DEMO_UNVERIFIED_OTP_CODE}`,
    },
    {
      email: "otppaused@example.com",
      phone: "+201000000072",
      fullName: "Bassem Youssef (OTP Paused 15m)",
      locale: "ar",
      preferredSignInMethod: "otp",
      status: "pending_verification",
      emailVerified: false,
      phoneVerified: false,
      roles: [
        {
          role: "traveler",
          planTier: "free",
        },
      ],
      secondFactorNote: "5 wrong OTP entries -> paused 15 minutes (BRL-20)",
    },
    {
      email: "locked@example.com",
      phone: "+201000000073",
      fullName: "Nader Fergany (Locked Out 15m)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      failedSignInAttempts: 5,
      lockedUntil: in15Min,
      roles: [
        {
          role: "traveler",
          planTier: "free",
        },
      ],
      secondFactorNote: "5 failed sign-ins -> locked 15 minutes (BRL-21)",
    },
    {
      email: "suspended@example.com",
      phone: "+201000000074",
      fullName: "Gamal Reda (Suspended Account)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "suspended",
      emailVerified: true,
      phoneVerified: true,
      suspendedReason: "policy_breach: Repeated fraudulent voucher holds",
      roles: [
        {
          role: "traveler",
          planTier: "free",
          status: "suspended",
        },
      ],
      secondFactorNote: "Suspended account notice (SCR-PUB-15)",
    },
    {
      email: "deleting@example.com",
      phone: "+201000000075",
      fullName: "Salma Rashwan (30-Day Deletion Grace)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "deletion_requested",
      emailVerified: true,
      phoneVerified: true,
      deletionRequestedAt: tenDaysAgo,
      roles: [
        {
          role: "traveler",
          planTier: "explorer",
        },
      ],
      secondFactorNote: "20 days left in 30-day deletion grace (SCR-PUB-16)",
    },

    // 9. Applicant Accounts for the Onboarding Review Queue (SRS 7.5)
    {
      email: "applicant.submitted@luxortours.eg",
      phone: "+201000000081",
      fullName: "Adel Imam (Submitted Org Applicant)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "totp",
      roles: [
        {
          role: "organization_owner",
          status: "pending_approval",
        },
      ],
    },
    {
      email: "applicant.pending@aswanbus.eg",
      phone: "+201000000082",
      fullName: "Hazem El-Beblawi (Pending Review Driver Applicant)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_driver",
          status: "pending_approval",
        },
      ],
    },
    {
      email: "applicant.overdue@oasisphoto.eg",
      phone: "+201000000083",
      fullName: "Yasmin Sabri (Overdue SLA Photographer Applicant)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_photographer",
          status: "pending_approval",
        },
      ],
    },
    {
      email: "applicant.changes@dahabtrips.eg",
      phone: "+201000000084",
      fullName: "Fadyerges (Changes Requested Org Applicant)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      totpEnabled: true,
      staffSecondFactorMethod: "sms",
      roles: [
        {
          role: "organization_owner",
          status: "pending_approval",
        },
      ],
    },
    {
      email: "applicant.rejected@desertdriver.eg",
      phone: "+201000000085",
      fullName: "Magdy Abdelghany (Rejected Driver Applicant)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_driver",
          status: "revoked",
        },
      ],
    },
    {
      email: "applicant.appealed@alexandriaphoto.eg",
      phone: "+201000000086",
      fullName: "Nelly Karim (Appealed Photographer Applicant)",
      locale: "en",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "platform_photographer",
          status: "pending_approval",
        },
      ],
    },
    {
      email: "applicant.closed@oldtrips.eg",
      phone: "+201000000087",
      fullName: "Sameh Hussein (Closed Application Applicant)",
      locale: "ar",
      preferredSignInMethod: "password",
      status: "active",
      emailVerified: true,
      phoneVerified: true,
      roles: [
        {
          role: "organization_owner",
          status: "revoked",
        },
      ],
    },
  ];

  // Upsert all accounts first (without tenantId FK on accountRoles yet so organizations can reference ownerAccountId).
  // Ids are resolved by email so a re-seed updates the existing rows instead of creating duplicates.
  const accountIds = new Map<string, string>();

  for (const spec of demoAccountSpecs) {
    const emailNorm = normalizeEmail(spec.email);
    const phoneNorm = normalizePhoneE164(spec.phone);
    const accountId = await resolveId(
      db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.emailNormalized, emailNorm))
        .limit(1),
    );
    accountIds.set(spec.email, accountId);

    await db
      .insert(accounts)
      .values({
        id: accountId,
        emailNormalized: emailNorm,
        emailBlindIndex: computeBlindIndex(emailNorm),
        emailEncrypted: encryptField(emailNorm),
        phoneE164: phoneNorm,
        phoneBlindIndex: computeBlindIndex(phoneNorm),
        phoneEncrypted: encryptField(phoneNorm),
        emailVerifiedAt: spec.emailVerified ? now : null,
        phoneVerifiedAt: spec.phoneVerified ? now : null,
        passwordHash: sharedPasswordHash,
        passwordChangedAt: now,
        preferredSignInMethod: spec.preferredSignInMethod,
        totpSecretEncrypted: spec.totpEnabled ? encryptField(DEMO_SHARED_TOTP_SECRET) : null,
        totpEnabledAt: spec.totpEnabled ? now : null,
        staffSecondFactorMethod: spec.staffSecondFactorMethod ?? null,
        fullName: spec.fullName,
        preferredLanguage: spec.locale,
        status: spec.status,
        failedSignInAttempts: spec.failedSignInAttempts ?? 0,
        lockedUntil: spec.lockedUntil ?? null,
        suspendedAt: spec.status === "suspended" ? now : null,
        suspendedReason: spec.suspendedReason ?? null,
        deletionRequestedAt: spec.deletionRequestedAt ?? null,
        knownDeviceFingerprints: ["demo-trusted-device"],
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          emailNormalized: emailNorm,
          emailBlindIndex: computeBlindIndex(emailNorm),
          emailEncrypted: encryptField(emailNorm),
          phoneE164: phoneNorm,
          phoneBlindIndex: computeBlindIndex(phoneNorm),
          phoneEncrypted: encryptField(phoneNorm),
          emailVerifiedAt: spec.emailVerified ? now : null,
          phoneVerifiedAt: spec.phoneVerified ? now : null,
          passwordHash: sharedPasswordHash,
          preferredSignInMethod: spec.preferredSignInMethod,
          totpSecretEncrypted: spec.totpEnabled ? encryptField(DEMO_SHARED_TOTP_SECRET) : null,
          totpEnabledAt: spec.totpEnabled ? now : null,
          staffSecondFactorMethod: spec.staffSecondFactorMethod ?? null,
          fullName: spec.fullName,
          preferredLanguage: spec.locale,
          status: spec.status,
          failedSignInAttempts: spec.failedSignInAttempts ?? 0,
          lockedUntil: spec.lockedUntil ?? null,
          suspendedAt: spec.status === "suspended" ? now : null,
          suspendedReason: spec.suspendedReason ?? null,
          deletionRequestedAt: spec.deletionRequestedAt ?? null,
          updatedAt: now,
        },
      });

    await db
      .insert(notificationPreferences)
      .values({ accountId, updatedAt: now })
      .onConflictDoUpdate({
        target: notificationPreferences.accountId,
        set: { updatedAt: now },
      });
  }

  const accountIdFor = (email: string): string => {
    const id = accountIds.get(email);
    if (!id) {
      throw new Error(`Demo seeder has no account spec for "${email}".`);
    }
    return id;
  };

  // Upsert the 3 Demo Organizations (Enterprise, Growth, Starter) + organization_settings
  const orgDefs = [
    {
      key: "nileHorizonEnterprise" as const,
      ownerEmail: "owner@nilehorizon.eg",
      legalEntityName: "Nile Horizon Tourism SAE",
      displayNameEn: "Nile Horizon Tours",
      displayNameAr: "آفاق النيل للسياحة",
      commercialReg: "CR-EG-100291",
      taxNumber: "TX-EG-998120",
      tourismLicense: "TL-EG-2026-01",
      address: "14 Corniche El Nil, Zamalek, Cairo, Egypt",
      signatoryName: "Hossam El-Shazly",
      signatoryNatId: "28501010101234",
      iban: "EG380019000500000000263180001",
      planTier: "enterprise" as const,
      childSafetyOptIn: true,
      seatSelfSelectionEnabled: true,
      childTrackingEnabledByDefault: true,
      customBrandingEnabled: true,
      primaryColorHex: "#0F766E",
      secondaryColorHex: "#F59E0B",
      webhookEndpoints: [
        {
          id: "wh-nile-1",
          url: "https://crm.nilehorizon.eg/webhooks/trips",
          secretHash: hashSha256("whsec_demo_nile_horizon_secret"),
          events: ["booking.confirmed", "trip.completed", "invoice.issued"],
          enabled: true,
        },
      ],
    },
    {
      key: "redSeaGrowth" as const,
      ownerEmail: "owner@redsea.eg",
      legalEntityName: "Red Sea Explorers Travel LLC",
      displayNameEn: "Red Sea Explorers",
      displayNameAr: "مستكشفو البحر الأحمر",
      commercialReg: "CR-EG-204918",
      taxNumber: "TX-EG-773190",
      tourismLicense: "TL-EG-2026-02",
      address: "Sheraton Road, Hurghada, Red Sea, Egypt",
      signatoryName: "Mona Zaki",
      signatoryNatId: "28805050105678",
      iban: "EG380019000500000000263180002",
      planTier: "growth" as const,
      childSafetyOptIn: true,
      seatSelfSelectionEnabled: true,
      childTrackingEnabledByDefault: true,
      customBrandingEnabled: false,
      primaryColorHex: null,
      secondaryColorHex: null,
      webhookEndpoints: [],
    },
    {
      key: "sinaiStarter" as const,
      ownerEmail: "owner@sinaitrails.eg",
      legalEntityName: "Sinai Trails Eco Adventures Co.",
      displayNameEn: "Sinai Trails",
      displayNameAr: "دروب سيناء",
      commercialReg: "CR-EG-309182",
      taxNumber: "TX-EG-551209",
      tourismLicense: "TL-EG-2026-03",
      address: "El Mashraba Promenade, Dahab, South Sinai, Egypt",
      signatoryName: "Youssef Salem",
      signatoryNatId: "29009090109012",
      iban: "EG380019000500000000263180003",
      planTier: "starter" as const,
      childSafetyOptIn: false,
      seatSelfSelectionEnabled: false,
      childTrackingEnabledByDefault: false,
      customBrandingEnabled: false,
      primaryColorHex: null,
      secondaryColorHex: null,
      webhookEndpoints: [],
    },
  ];

  const orgIds: Record<DemoOrgKey, string> = {
    nileHorizonEnterprise: "",
    redSeaGrowth: "",
    sinaiStarter: "",
  };

  for (const org of orgDefs) {
    const ownerAccountId = accountIdFor(org.ownerEmail);
    const orgId = await resolveId(
      db
        .select({ id: organizations.id })
        .from(organizations)
        .where(
          and(
            eq(organizations.ownerAccountId, ownerAccountId),
            eq(organizations.legalEntityName, org.legalEntityName),
          ),
        )
        .limit(1),
    );
    orgIds[org.key] = orgId;

    await db
      .insert(organizations)
      .values({
        id: orgId,
        ownerAccountId,
        legalEntityName: org.legalEntityName,
        displayNameEn: org.displayNameEn,
        displayNameAr: org.displayNameAr,
        commercialRegNumberEncrypted: encryptField(org.commercialReg),
        taxNumberEncrypted: encryptField(org.taxNumber),
        tourismLicenseNumberEncrypted: encryptField(org.tourismLicense),
        tourismLicenseExpiry: in2Years,
        countryCode: "EG",
        headquartersAddress: org.address,
        signatoryFullName: org.signatoryName,
        signatoryNationalIdEncrypted: encryptField(org.signatoryNatId),
        signatoryRoleTitle: "Managing Director",
        payoutMethod: "bank_transfer",
        payoutIbanEncrypted: encryptField(org.iban),
        planTier: org.planTier,
        status: "active",
        childSafetyOptIn: org.childSafetyOptIn,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: organizations.id,
        set: {
          planTier: org.planTier,
          status: "active",
          childSafetyOptIn: org.childSafetyOptIn,
          updatedAt: now,
        },
      });

    const baseSettings = createDefaultOrganizationSettings({
      tenantId: orgId,
      countryCode: "EG",
      planTier: org.planTier,
      billingContactName: org.signatoryName,
      billingContactEmail: `billing@${org.displayNameEn.toLowerCase().replace(/\s+/g, "")}.eg`,
      billingContactPhone: "+201000000099",
      billingAddress: org.address,
      taxNumber: org.taxNumber,
      safetyLeadName: org.childSafetyOptIn ? org.signatoryName : null,
      safetyHotlinePhone: org.childSafetyOptIn ? "+201000000911" : null,
    });

    await db
      .insert(organizationSettings)
      .values({
        ...baseSettings,
        seatSelfSelectionEnabled: org.seatSelfSelectionEnabled,
        childTrackingEnabledByDefault: org.childTrackingEnabledByDefault,
        customBrandingEnabled: org.customBrandingEnabled,
        primaryColorHex: org.primaryColorHex,
        secondaryColorHex: org.secondaryColorHex,
        webhookEndpoints: org.webhookEndpoints,
        updatedByAccountId: ownerAccountId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: organizationSettings.tenantId,
        set: {
          seatSelfSelectionEnabled: org.seatSelfSelectionEnabled,
          childTrackingEnabledByDefault: org.childTrackingEnabledByDefault,
          customBrandingEnabled: org.customBrandingEnabled,
          primaryColorHex: org.primaryColorHex,
          secondaryColorHex: org.secondaryColorHex,
          webhookEndpoints: org.webhookEndpoints,
          updatedAt: now,
        },
      });
  }

  // Upsert account_roles for all demo accounts
  for (const spec of demoAccountSpecs) {
    const accountId = accountIdFor(spec.email);
    for (const r of spec.roles) {
      const tenantId = r.tenantKey ? orgIds[r.tenantKey] : null;
      const roleId = await resolveId(
        db
          .select({ id: accountRoles.id })
          .from(accountRoles)
          .where(
            and(
              eq(accountRoles.accountId, accountId),
              eq(accountRoles.role, r.role),
              tenantId === null
                ? isNull(accountRoles.tenantId)
                : eq(accountRoles.tenantId, tenantId),
            ),
          )
          .limit(1),
      );

      await db
        .insert(accountRoles)
        .values({
          id: roleId,
          accountId,
          role: r.role,
          adminSubRole: r.adminSubRole ?? null,
          tenantId,
          planTier: r.planTier ?? null,
          status: r.status ?? "active",
          pauseReason: r.pauseReason ?? null,
          approvedAt: (r.status ?? "active") === "active" ? now : null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: accountRoles.id,
          set: {
            role: r.role,
            adminSubRole: r.adminSubRole ?? null,
            tenantId,
            planTier: r.planTier ?? null,
            status: r.status ?? "active",
            pauseReason: r.pauseReason ?? null,
            updatedAt: now,
          },
        });
    }
  }

  // Upsert employee_memberships (4 active/first-login + 1 pending 7-day invite)
  const employeeMembershipRows: {
    tenantKey: DemoOrgKey;
    accountEmail: string | null;
    invitedEmail: string;
    invitedPhone: string;
    roleTitle: string;
    permissions: OrgPermissionMatrix;
    inviteToken: string;
    status: "invited" | "active";
    firstSignInCompletedAt: Date | null;
    invitedByEmail: string;
  }[] = [
    {
      tenantKey: "nileHorizonEnterprise",
      accountEmail: "trips.emp@nilehorizon.eg",
      invitedEmail: "trips.emp@nilehorizon.eg",
      invitedPhone: "+201000000021",
      roleTitle: "Trip Coordinator",
      permissions: EMPLOYEE_ROLE_PRESETS.trip_coordinator!,
      inviteToken: "demo-emp-invite-token-1",
      status: "active",
      firstSignInCompletedAt: now,
      invitedByEmail: "owner@nilehorizon.eg",
    },
    {
      tenantKey: "nileHorizonEnterprise",
      accountEmail: "finance.emp@nilehorizon.eg",
      invitedEmail: "finance.emp@nilehorizon.eg",
      invitedPhone: "+201000000022",
      roleTitle: "Senior Accountant",
      permissions: EMPLOYEE_ROLE_PRESETS.accountant!,
      inviteToken: "demo-emp-invite-token-2",
      status: "active",
      firstSignInCompletedAt: now,
      invitedByEmail: "owner@nilehorizon.eg",
    },
    {
      tenantKey: "nileHorizonEnterprise",
      accountEmail: "multi.emp@trips-enjoy.com",
      invitedEmail: "multi.emp@trips-enjoy.com",
      invitedPhone: "+201000000023",
      roleTitle: "Operations Manager (Nile Horizon)",
      permissions: EMPLOYEE_ROLE_PRESETS.operations_manager!,
      inviteToken: "demo-emp-invite-token-3a",
      status: "active",
      firstSignInCompletedAt: now,
      invitedByEmail: "owner@nilehorizon.eg",
    },
    {
      tenantKey: "redSeaGrowth",
      accountEmail: "multi.emp@trips-enjoy.com",
      invitedEmail: "multi.emp@trips-enjoy.com",
      invitedPhone: "+201000000023",
      roleTitle: "Fleet Supervisor (Red Sea)",
      permissions: EMPLOYEE_ROLE_PRESETS.fleet_supervisor!,
      inviteToken: "demo-emp-invite-token-3b",
      status: "active",
      firstSignInCompletedAt: now,
      invitedByEmail: "owner@redsea.eg",
    },
    {
      tenantKey: "redSeaGrowth",
      accountEmail: "firstlogin.emp@redsea.eg",
      invitedEmail: "firstlogin.emp@redsea.eg",
      invitedPhone: "+201000000024",
      roleTitle: "Support Agent",
      permissions: EMPLOYEE_ROLE_PRESETS.support_agent!,
      inviteToken: "demo-emp-invite-token-4",
      status: "active",
      firstSignInCompletedAt: null,
      invitedByEmail: "owner@redsea.eg",
    },
    {
      tenantKey: "sinaiStarter",
      accountEmail: null,
      invitedEmail: "invited.emp@sinaitrails.eg",
      invitedPhone: "+201000000025",
      roleTitle: "Trip Coordinator",
      permissions: EMPLOYEE_ROLE_PRESETS.trip_coordinator!,
      inviteToken: "demo-emp-pending-invite-token",
      status: "invited",
      firstSignInCompletedAt: null,
      invitedByEmail: "owner@sinaitrails.eg",
    },
  ];

  for (const emp of employeeMembershipRows) {
    const tenantId = orgIds[emp.tenantKey];
    const membershipId = await resolveId(
      db
        .select({ id: employeeMemberships.id })
        .from(employeeMemberships)
        .where(
          and(
            eq(employeeMemberships.tenantId, tenantId),
            eq(employeeMemberships.invitedEmail, emp.invitedEmail),
          ),
        )
        .limit(1),
    );

    await db
      .insert(employeeMemberships)
      .values({
        id: membershipId,
        tenantId,
        accountId: emp.accountEmail ? accountIdFor(emp.accountEmail) : null,
        invitedEmail: emp.invitedEmail,
        invitedPhone: emp.invitedPhone,
        roleTitle: emp.roleTitle,
        permissions: emp.permissions,
        inviteTokenHash: hashSha256(emp.inviteToken),
        inviteExpiresAt: in7Days,
        status: emp.status,
        firstSignInCompletedAt: emp.firstSignInCompletedAt,
        invitedByAccountId: accountIdFor(emp.invitedByEmail),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: employeeMemberships.id,
        set: {
          permissions: emp.permissions,
          status: emp.status,
          firstSignInCompletedAt: emp.firstSignInCompletedAt,
          updatedAt: now,
        },
      });
  }

  // Upsert pending 72h Admin Invite (D-50)
  const invitedAdminEmail = "invited.admin@trips-enjoy.com";
  const adminInviteId = await resolveId(
    db
      .select({ id: adminInvites.id })
      .from(adminInvites)
      .where(eq(adminInvites.emailNormalized, invitedAdminEmail))
      .limit(1),
  );

  await db
    .insert(adminInvites)
    .values({
      id: adminInviteId,
      emailNormalized: invitedAdminEmail,
      fullName: "HebaTawfik (Invited Operations Admin)",
      subRole: "operations",
      inviteTokenHash: hashSha256("demo-admin-invite-token-72h"),
      expiresAt: in72Hours,
      invitedByAccountId: bootstrapSuperAdminId,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: adminInvites.id,
      set: { expiresAt: in72Hours },
    });

  // Upsert Vehicle Moderator Assignment (D-107).
  // Trips and vehicles live in a separate module, so the demo assignment reuses the ids it already
  // references when present and generates fresh ones otherwise.
  const moderatorTenantId = orgIds.nileHorizonEnterprise;
  const moderatorAccountId = accountIdFor("moderator.bus1@nilehorizon.eg");
  const [existingModeratorAssignment] = await db
    .select({
      id: moderatorAssignments.id,
      tripId: moderatorAssignments.tripId,
      vehicleId: moderatorAssignments.vehicleId,
    })
    .from(moderatorAssignments)
    .where(
      and(
        eq(moderatorAssignments.tenantId, moderatorTenantId),
        eq(moderatorAssignments.accountId, moderatorAccountId),
      ),
    )
    .limit(1);

  const demoTripId = existingModeratorAssignment?.tripId ?? randomUUID();
  const demoVehicleId = existingModeratorAssignment?.vehicleId ?? randomUUID();

  await db
    .insert(moderatorAssignments)
    .values({
      id: existingModeratorAssignment?.id ?? randomUUID(),
      tenantId: moderatorTenantId,
      accountId: moderatorAccountId,
      tripId: demoTripId,
      vehicleId: demoVehicleId,
      staffCodeHash: hashSha256(DEMO_MODERATOR_STAFF_CODE),
      validFrom: now,
      validUntil: in24Hours,
      status: "assigned",
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: moderatorAssignments.id,
      set: {
        staffCodeHash: hashSha256(DEMO_MODERATOR_STAFF_CODE),
        validUntil: in24Hours,
        status: "assigned",
      },
    });

  // Upsert OTP records for unverified@example.com and otppaused@example.com
  const unverifiedOtpId = await resolveId(
    db
      .select({ id: otpVerifications.id })
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.accountId, accountIdFor("unverified@example.com")),
          eq(otpVerifications.purpose, "registration"),
        ),
      )
      .limit(1),
  );

  await db
    .insert(otpVerifications)
    .values({
      id: unverifiedOtpId,
      accountId: accountIdFor("unverified@example.com"),
      targetIdentifier: "+201000000071",
      channel: "sms",
      purpose: "registration",
      codeHash: hashSha256(DEMO_UNVERIFIED_OTP_CODE),
      wrongAttempts: 0,
      pausedUntil: null,
      resendCount: 0,
      lastSentAt: now,
      deliveryStatus: "sent",
      expiresAt: in5Min,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: otpVerifications.id,
      set: {
        codeHash: hashSha256(DEMO_UNVERIFIED_OTP_CODE),
        wrongAttempts: 0,
        pausedUntil: null,
        expiresAt: in5Min,
        consumedAt: null,
      },
    });

  const pausedOtpId = await resolveId(
    db
      .select({ id: otpVerifications.id })
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.accountId, accountIdFor("otppaused@example.com")),
          eq(otpVerifications.purpose, "registration"),
        ),
      )
      .limit(1),
  );

  await db
    .insert(otpVerifications)
    .values({
      id: pausedOtpId,
      accountId: accountIdFor("otppaused@example.com"),
      targetIdentifier: "+201000000072",
      channel: "sms",
      purpose: "registration",
      codeHash: hashSha256("654321"),
      wrongAttempts: 5,
      pausedUntil: in15Min,
      resendCount: 1,
      lastSentAt: now,
      deliveryStatus: "sent",
      expiresAt: in5Min,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: otpVerifications.id,
      set: {
        wrongAttempts: 5,
        pausedUntil: in15Min,
        expiresAt: in5Min,
      },
    });

  // Load seeded lookup lists from lookup_types / lookups by code to generate demo profile & application lists
  const lookupsRepo = createLookupsRepository(db);
  const seededLookupsByType = await lookupsRepo.getLookupsByTypeCodes(
    [
      "DRIVER_LICENSE_CATEGORY",
      "SERVICE_REGION",
      "VEHICLE_TYPE",
      "CAMERA_BODY",
      "CAMERA_LENS",
      "PHOTOGRAPHER_SPECIALTY",
      "APPLICATION_DECISION_REASON",
      "DOCUMENT_TYPE",
    ],
    { includePrivate: true },
  );

  const lookupValue = (typeCode: string, code: string): string => {
    const item = seededLookupsByType[typeCode]?.items.find((i) => i.code === code);
    if (!item) {
      throw new Error(`Missing seeded lookup "${code}" in lookup_type "${typeCode}".`);
    }
    return item.value;
  };

  const lookupValues = (typeCode: string, codes: readonly string[]): string[] =>
    codes.map((code) => lookupValue(typeCode, code));

  // Upsert Driver Consent & Driver Profiles
  const driverConsentAccountId = accountIdFor("driver.basic@example.com");
  const driverConsentId = await resolveId(
    db
      .select({ id: consentRecords.id })
      .from(consentRecords)
      .where(
        and(
          eq(consentRecords.accountId, driverConsentAccountId),
          eq(consentRecords.consentType, "driver_lab_test"),
        ),
      )
      .limit(1),
  );

  await db
    .insert(consentRecords)
    .values({
      id: driverConsentId,
      accountId: driverConsentAccountId,
      consentType: "driver_lab_test",
      documentVersion: "1.0",
      ipAddress: "127.0.0.1",
      signedAt: now,
    })
    .onConflictDoUpdate({
      target: consentRecords.id,
      set: { signedAt: now },
    });

  const driverProfileRows = [
    {
      accountEmail: "driver.basic@example.com",
      scope: "platform" as const,
      tenantKey: null,
      licenseCat: lookupValue("DRIVER_LICENSE_CATEGORY", "FIRST_DEGREE_BUS"),
      years: 9,
      areas: lookupValues("SERVICE_REGION", ["CAIRO", "GIZA", "ALEXANDRIA", "SOUTH_SINAI"]),
      hasOwnVehicle: true,
      makeModel: lookupValue("VEHICLE_TYPE", "LUXURY_COACH_49"),
      year: 2024,
      plate: "أ ب ج 1234",
      seats: 49,
      insurancePolicy: "INS-EG-2026-8891",
      insuranceExpiry: in9Months,
      planTier: "basic" as const,
      status: "active" as const,
      activeLabPauseReason: null,
    },
    {
      accountEmail: "driver.pro@example.com",
      scope: "platform" as const,
      tenantKey: null,
      licenseCat: lookupValue("DRIVER_LICENSE_CATEGORY", "FIRST_DEGREE_HEAVY_BUS"),
      years: 12,
      areas: lookupValues("SERVICE_REGION", ["CAIRO", "RED_SEA", "LUXOR", "ASWAN"]),
      hasOwnVehicle: false,
      makeModel: null,
      year: null,
      plate: null,
      seats: null,
      insurancePolicy: null,
      insuranceExpiry: null,
      planTier: "professional" as const,
      status: "active" as const,
      activeLabPauseReason: null,
    },
    {
      accountEmail: "driver.labpause@example.com",
      scope: "platform" as const,
      tenantKey: null,
      licenseCat: lookupValue("DRIVER_LICENSE_CATEGORY", "SECOND_DEGREE_COASTER"),
      years: 5,
      areas: lookupValues("SERVICE_REGION", ["CAIRO", "AIN_SOKHNA"]),
      hasOwnVehicle: false,
      makeModel: null,
      year: null,
      plate: null,
      seats: null,
      insurancePolicy: null,
      insuranceExpiry: null,
      planTier: "basic" as const,
      status: "paused_lab_test" as const,
      activeLabPauseReason: "Random drug & safety lab test ordered (deadline 3 days)",
    },
    {
      accountEmail: "org.driver@nilehorizon.eg",
      scope: "organization" as const,
      tenantKey: "nileHorizonEnterprise" as DemoOrgKey,
      licenseCat: lookupValue("DRIVER_LICENSE_CATEGORY", "FIRST_DEGREE_BUS"),
      years: 7,
      areas: lookupValues("SERVICE_REGION", ["CAIRO", "LUXOR"]),
      hasOwnVehicle: false,
      makeModel: null,
      year: null,
      plate: null,
      seats: null,
      insurancePolicy: null,
      insuranceExpiry: null,
      planTier: null,
      status: "active" as const,
      activeLabPauseReason: null,
    },
  ];

  for (const dp of driverProfileRows) {
    await db
      .insert(driverProfiles)
      .values({
        accountId: accountIdFor(dp.accountEmail),
        scope: dp.scope,
        owningTenantId: dp.tenantKey ? orgIds[dp.tenantKey] : null,
        nationalIdEncrypted: encryptField("28701010109999"),
        licenseNumberEncrypted: encryptField("LIC-EG-998811"),
        licenseCategory: dp.licenseCat,
        licenseExpiry: in2Years,
        yearsOfExperience: dp.years,
        serviceAreas: dp.areas,
        hasOwnVehicle: dp.hasOwnVehicle,
        vehicleMakeModel: dp.makeModel,
        vehicleYear: dp.year,
        vehiclePlateNumber: dp.plate,
        vehicleSeatCapacity: dp.seats,
        insurancePolicyNumber: dp.insurancePolicy,
        insuranceExpiry: dp.insuranceExpiry,
        labTestConsentId: driverConsentId,
        lastLabResultValidUntil: in9Months,
        activeLabPauseReason: dp.activeLabPauseReason,
        planTier: dp.planTier,
        status: dp.status,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: driverProfiles.accountId,
        set: {
          status: dp.status,
          activeLabPauseReason: dp.activeLabPauseReason,
          planTier: dp.planTier,
          updatedAt: now,
        },
      });
  }

  // Upsert Photographer Profiles
  const photoProfileRows = [
    {
      accountEmail: "multirole@example.com",
      scope: "platform" as const,
      tenantKey: null,
      years: 6,
      bodies: lookupValues("CAMERA_BODY", ["SONY_A7_IV", "SONY_A7R_V"]),
      lenses: lookupValues("CAMERA_LENS", ["LENS_24_70_F28_GM_II", "LENS_70_200_F28_GM_II"]),
      drone: true,
      regions: lookupValues("SERVICE_REGION", ["CAIRO", "RED_SEA", "SOUTH_SINAI"]),
      specialties: lookupValues("PHOTOGRAPHER_SPECIALTY", [
        "DESERT_SAFARIS",
        "MARINE_DIVING",
        "FAMILY_PORTRAITS",
      ]),
      photoCount: 16,
      planTier: "studio" as const,
    },
    {
      accountEmail: "photo.basic@example.com",
      scope: "platform" as const,
      tenantKey: null,
      years: 3,
      bodies: lookupValues("CAMERA_BODY", ["CANON_EOS_R6_MARK_II"]),
      lenses: lookupValues("CAMERA_LENS", ["LENS_24_105_F4L", "LENS_50_F18"]),
      drone: false,
      regions: lookupValues("SERVICE_REGION", ["CAIRO", "ALEXANDRIA"]),
      specialties: lookupValues("PHOTOGRAPHER_SPECIALTY", ["CULTURAL_HERITAGE", "DAY_TRIPS"]),
      photoCount: 8,
      planTier: "basic" as const,
    },
    {
      accountEmail: "photo.pro@example.com",
      scope: "platform" as const,
      tenantKey: null,
      years: 10,
      bodies: lookupValues("CAMERA_BODY", ["NIKON_Z8", "NIKON_Z9"]),
      lenses: lookupValues("CAMERA_LENS", ["LENS_14_24_F28", "LENS_24_70_F28", "LENS_70_200_F28"]),
      drone: true,
      regions: lookupValues("SERVICE_REGION", ["CAIRO", "LUXOR", "ASWAN", "RED_SEA", "SIWA"]),
      specialties: lookupValues("PHOTOGRAPHER_SPECIALTY", [
        "LUXURY_CRUISES",
        "AERIAL_LANDSCAPES",
        "EVENTS",
      ]),
      photoCount: 24,
      planTier: "pro" as const,
    },
    {
      accountEmail: "org.photo@nilehorizon.eg",
      scope: "organization" as const,
      tenantKey: "nileHorizonEnterprise" as DemoOrgKey,
      years: 4,
      bodies: lookupValues("CAMERA_BODY", ["SONY_A7C_II"]),
      lenses: lookupValues("CAMERA_LENS", ["LENS_35_F14_GM", "LENS_85_F18"]),
      drone: false,
      regions: lookupValues("SERVICE_REGION", ["CAIRO", "LUXOR", "ASWAN"]),
      specialties: lookupValues("PHOTOGRAPHER_SPECIALTY", ["GROUP_TRIPS", "KIDS_SCHOOL_TRIPS"]),
      photoCount: 10,
      planTier: null,
    },
  ];

  for (const pp of photoProfileRows) {
    await db
      .insert(photographerProfiles)
      .values({
        accountId: accountIdFor(pp.accountEmail),
        scope: pp.scope,
        owningTenantId: pp.tenantKey ? orgIds[pp.tenantKey] : null,
        nationalIdEncrypted: encryptField("29203030104444"),
        yearsOfExperience: pp.years,
        cameraBodies: pp.bodies,
        lenses: pp.lenses,
        hasDroneLicense: pp.drone,
        serviceRegions: pp.regions,
        specialties: pp.specialties,
        portfolioPhotoCount: pp.photoCount,
        sampleAlbums: [
          { title: "Siwa Oasis Sunset Expedition", photoCount: 4 },
          { title: "Red Sea Coral Reef Cruise", photoCount: 4 },
        ],
        planTier: pp.planTier,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: photographerProfiles.accountId,
        set: {
          portfolioPhotoCount: pp.photoCount,
          planTier: pp.planTier,
          updatedAt: now,
        },
      });
  }

  // Upsert 8 Onboarding Applications covering all 7 SRS 7.5 states
  const appSeedRows: {
    applicantEmail: string;
    applicationType: SupplierApplicationType;
    state: ApplicationState;
    slaDueAt: Date;
    payload: Record<string, unknown>;
    decisionReasonCode?: string;
    decisionNotes?: string;
    changesChecklist?: { field: string; instruction: string; resolved?: boolean }[];
    changesDueAt?: Date;
    rejectedAt?: Date;
    reapplyBlockedUntil?: Date;
    appealStatement?: string;
    appealedAt?: Date;
    provisionedOrganizationKey?: DemoOrgKey;
  }[] = [
    {
      applicantEmail: "applicant.submitted@luxortours.eg",
      applicationType: "organization",
      state: "Submitted",
      slaDueAt: addWorkingDays(now, 2),
      payload: {
        legalEntityName: "Luxor Royal Nile Cruises SAE",
        commercialRegNumber: "CR-LUX-501",
        taxNumber: "TX-LUX-501",
        tourismLicenseNumber: "TL-LUX-2026",
        countryCode: "EG",
      },
    },
    {
      applicantEmail: "applicant.pending@aswanbus.eg",
      applicationType: "platform_driver",
      state: "Pending Review",
      slaDueAt: addWorkingDays(now, 2),
      payload: {
        licenseCategory: lookupValue("DRIVER_LICENSE_CATEGORY", "FIRST_DEGREE_BUS"),
        yearsOfExperience: 6,
        hasOwnVehicle: true,
        vehicleMakeModel: lookupValue("VEHICLE_TYPE", "COASTER_MINIBUS_28"),
        portfolioOrLabStatus: "Lab test dated 5 days ago, insurance valid 11 months",
      },
    },
    {
      applicantEmail: "applicant.overdue@oasisphoto.eg",
      applicationType: "platform_photographer",
      state: "Pending Review",
      slaDueAt: fiveDaysAgo, // Overdue > 2 working days (FR-ONB-03)
      payload: {
        yearsOfExperience: 5,
        cameraBodies: lookupValues("CAMERA_BODY", ["CANON_EOS_R5"]),
        portfolioPhotoCount: 10,
        serviceRegions: lookupValues("SERVICE_REGION", ["SIWA", "MATROUH"]),
      },
    },
    {
      applicantEmail: "applicant.changes@dahabtrips.eg",
      applicationType: "organization",
      state: "Changes Requested",
      slaDueAt: addWorkingDays(now, 2),
      payload: {
        legalEntityName: "Dahab Blue Hole Adventures LLC",
        commercialRegNumber: "CR-DHB-774",
      },
      decisionReasonCode: lookupValue("APPLICATION_DECISION_REASON", "BLURRED_DOCUMENT"),
      decisionNotes: "Please re-upload a clear scan of the Ministry of Tourism license.",
      changesChecklist: [
        {
          field: "tourismLicenseDocument",
          instruction: "Upload a high-resolution PDF/JPG showing the expiry stamp clearly.",
          resolved: false,
        },
      ],
      changesDueAt: in14Days,
    },
    {
      applicantEmail: "owner@nilehorizon.eg",
      applicationType: "organization",
      state: "Approved",
      slaDueAt: fiveDaysAgo,
      payload: {
        legalEntityName: "Nile Horizon Tourism SAE",
        commercialRegNumber: "CR-EG-100291",
      },
      decisionReasonCode: lookupValue("APPLICATION_DECISION_REASON", "VERIFIED_COMPLETE"),
      decisionNotes: "All commercial, tax, and tourism licenses verified.",
      provisionedOrganizationKey: "nileHorizonEnterprise",
    },
    {
      applicantEmail: "applicant.rejected@desertdriver.eg",
      applicationType: "platform_driver",
      state: "Rejected",
      slaDueAt: fiveDaysAgo,
      payload: {
        licenseCategory: lookupValue("DRIVER_LICENSE_CATEGORY", "PRIVATE_CAR_ONLY"),
        yearsOfExperience: 1,
      },
      decisionReasonCode: lookupValue("APPLICATION_DECISION_REASON", "INELIGIBLE_LICENSE_CLASS"),
      decisionNotes: "Commercial passenger transport license is required.",
      rejectedAt: now,
      reapplyBlockedUntil: in30Days,
    },
    {
      applicantEmail: "applicant.appealed@alexandriaphoto.eg",
      applicationType: "platform_photographer",
      state: "Appealed",
      slaDueAt: addWorkingDays(now, 2),
      payload: {
        yearsOfExperience: 4,
        portfolioPhotoCount: 9,
      },
      decisionReasonCode: lookupValue("APPLICATION_DECISION_REASON", "PORTFOLIO_QUALITY"),
      decisionNotes: "Initial portfolio lacked outdoor trip lighting examples.",
      rejectedAt: fiveDaysAgo,
      reapplyBlockedUntil: in30Days,
      appealStatement:
        "I have uploaded 6 new high-resolution outdoor excursion photos from Alexandria and Fayoum.",
      appealedAt: now,
    },
    {
      applicantEmail: "applicant.closed@oldtrips.eg",
      applicationType: "organization",
      state: "Closed",
      slaDueAt: tenDaysAgo,
      payload: {
        legalEntityName: "Old Delta Bus Tours",
      },
      decisionReasonCode: lookupValue("APPLICATION_DECISION_REASON", "CHANGES_WINDOW_EXPIRED"),
      decisionNotes: "Closed automatically after 14-day changes window expired without response.",
    },
  ];

  const reviewerAdminAccountId = accountIdFor("ops.admin@trips-enjoy.com");
  const applicationIds = new Map<string, string>();

  for (const appRow of appSeedRows) {
    const applicantAccountId = accountIdFor(appRow.applicantEmail);
    const applicationId = await resolveId(
      db
        .select({ id: applications.id })
        .from(applications)
        .where(
          and(
            eq(applications.applicantAccountId, applicantAccountId),
            eq(applications.applicationType, appRow.applicationType),
          ),
        )
        .limit(1),
    );
    applicationIds.set(appRow.applicantEmail, applicationId);

    const reviewed = appRow.state !== "Submitted" && appRow.state !== "Pending Review";

    await db
      .insert(applications)
      .values({
        id: applicationId,
        applicantAccountId,
        applicationType: appRow.applicationType,
        state: appRow.state,
        payload: appRow.payload,
        slaDueAt: appRow.slaDueAt,
        reviewedByAdminAccountId: reviewed ? reviewerAdminAccountId : null,
        reviewedAt: reviewed ? now : null,
        decisionReasonCode: appRow.decisionReasonCode ?? null,
        decisionNotes: appRow.decisionNotes ?? null,
        changesRequestedChecklist: appRow.changesChecklist ?? null,
        changesDueAt: appRow.changesDueAt ?? null,
        rejectedAt: appRow.rejectedAt ?? null,
        reapplyBlockedUntil: appRow.reapplyBlockedUntil ?? null,
        appealStatement: appRow.appealStatement ?? null,
        appealedAt: appRow.appealedAt ?? null,
        provisionedOrganizationId: appRow.provisionedOrganizationKey
          ? orgIds[appRow.provisionedOrganizationKey]
          : null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: applications.id,
        set: {
          state: appRow.state,
          payload: appRow.payload,
          slaDueAt: appRow.slaDueAt,
          decisionReasonCode: appRow.decisionReasonCode ?? null,
          decisionNotes: appRow.decisionNotes ?? null,
          changesRequestedChecklist: appRow.changesChecklist ?? null,
          changesDueAt: appRow.changesDueAt ?? null,
          changesExtensionUsed: false,
          rejectedAt: appRow.rejectedAt ?? null,
          reapplyBlockedUntil: appRow.reapplyBlockedUntil ?? null,
          appealStatement: appRow.appealStatement ?? null,
          appealedAt: appRow.appealedAt ?? null,
          updatedAt: now,
        },
      });

    const documentType = lookupValue("DOCUMENT_TYPE", "IDENTITY_AND_LICENSE_BUNDLE");
    const documentId = await resolveId(
      db
        .select({ id: applicationDocuments.id })
        .from(applicationDocuments)
        .where(
          and(
            eq(applicationDocuments.applicationId, applicationId),
            eq(applicationDocuments.documentType, documentType),
          ),
        )
        .limit(1),
    );

    await db
      .insert(applicationDocuments)
      .values({
        id: documentId,
        applicationId,
        documentType,
        storageKey: `private/applications/${applicationId}/bundle.pdf`,
        mimeType: "application/pdf",
        fileSizeBytes: 1_048_576,
        expiresAt: in2Years,
        verifiedStatus: appRow.state === "Approved" ? "verified" : "pending",
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: applicationDocuments.id,
        set: {
          verifiedStatus: appRow.state === "Approved" ? "verified" : "pending",
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Traveler-facing demo content (SCR-TRV browse/detail/booking/albums):
  // a published trip with programs + a seat map, a platform coupon, and a
  // completed trip with a published album so the album screens have data.
  // ---------------------------------------------------------------------------
  const travelerTripId = await resolveId(
    db
      .select({ id: trips.id })
      .from(trips)
      .where(eq(trips.titleEn, "Luxury Nile Sunset Cruise"))
      .limit(1),
  );
  const travelerTripStartsAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const travelerTripEndsAt = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

  await db
    .insert(trips)
    .values({
      id: travelerTripId,
      tenantId: orgIds.nileHorizonEnterprise,
      titleAr: "رحلة كروز النيل عند الغروب",
      titleEn: "Luxury Nile Sunset Cruise",
      descriptionAr: "رحلة فاخرة على النيل مع برامج اختيارية.",
      descriptionEn: "A luxury Nile cruise with optional add-on programs.",
      categoryLookupCode: "NILE_CRUISE",
      language: "ar",
      coverImageUrl: "https://cdn.trips-enjoy.com/demo/nile-cruise.jpg",
      startsAt: travelerTripStartsAt,
      endsAt: travelerTripEndsAt,
      timezone: "Africa/Cairo",
      origin: {
        nameAr: "القاهرة - كورنيش النيل",
        nameEn: "Cairo - Corniche El Nil",
        regionLookupCode: "CAIRO",
        latitude: 29.9601,
        longitude: 31.2569,
      },
      destinations: [
        {
          nameAr: "الجيزة - رصيف الضفة الغربية",
          nameEn: "Giza - West Bank Dock",
          regionLookupCode: "GIZA",
          latitude: 29.9871,
          longitude: 31.2108,
        },
      ],
      seatAssignmentMode: "traveler_choice",
      seatPriorityWindowHours: 24,
      basePriceMinor: 250_000,
      currencyCode: "EGP",
      totalCapacity: 12,
      confirmedSeatsCount: 0,
      state: "published",
      publishMode: "public",
      vipEarlyAccessUntil: null,
      hasStaffingGap: false,
      publishedAt: now,
      createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: trips.id,
      set: { state: "published", publishMode: "public", totalCapacity: 12, updatedAt: now },
    });

  const cruiseVehicleTypeId = await resolveId(
    db
      .select({ id: vehicleTypes.id })
      .from(vehicleTypes)
      .where(
        and(
          eq(vehicleTypes.nameEn, "Luxury Minibus"),
          eq(vehicleTypes.tenantId, orgIds.nileHorizonEnterprise),
        ),
      )
      .limit(1),
  );
  const cruiseSeatLayout = {
    rows: 3,
    cols: 4,
    cells: Array.from({ length: 12 }, (_, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      return {
        row,
        col,
        type: col === 2 ? ("aisle" as const) : ("seat" as const),
        seatLabel: col === 2 ? null : `${String.fromCharCode(65 + row)}${col + 1}`,
      };
    }),
  };
  await db
    .insert(vehicleTypes)
    .values({
      id: cruiseVehicleTypeId,
      tenantId: orgIds.nileHorizonEnterprise,
      scope: "organization",
      categoryLookupCode: "NILE_CRUISE",
      nameAr: "ميكروباص فاخر",
      nameEn: "Luxury Minibus",
      seatCount: 9,
      seatLayout: cruiseSeatLayout,
      status: "active",
      createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: vehicleTypes.id,
      set: { seatLayout: cruiseSeatLayout, seatCount: 9, updatedAt: now },
    });

  const cruiseVehicleId = await resolveId(
    db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.tenantId, orgIds.nileHorizonEnterprise),
          eq(vehicles.plateNumber, "ABC 1234"),
        ),
      )
      .limit(1),
  );
  await db
    .insert(vehicles)
    .values({
      id: cruiseVehicleId,
      tenantId: orgIds.nileHorizonEnterprise,
      vehicleTypeId: cruiseVehicleTypeId,
      plateNumber: "ABC 1234",
      plateNumberNormalized: "ABC1234",
      model: "Mercedes Sprinter",
      manufacturingYear: 2023,
      seatCount: 9,
      registrationStatus: "valid",
      registrationExpiry: in9Months,
      createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: vehicles.id,
      set: { seatCount: 9, updatedAt: now },
    });

  await db
    .insert(tripVehicles)
    .values({
      tenantId: orgIds.nileHorizonEnterprise,
      tripId: travelerTripId,
      vehicleId: cruiseVehicleId,
      seatCountSnapshot: 9,
      seatLayoutSnapshot: cruiseSeatLayout,
      driverSource: "org_staff",
      driverAccountId: null,
      moderatorSource: "org_staff",
      moderatorAccountId: null,
      photographerSource: "org_staff",
      photographerAccountId: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  // Materialize the seat map for the trip vehicle (traveler_choice mode).
  const existingSeatRows = await db
    .select({ seatLabel: tripSeatInventory.seatLabel })
    .from(tripSeatInventory)
    .where(
      and(
        eq(tripSeatInventory.tripId, travelerTripId),
        eq(tripSeatInventory.vehicleId, cruiseVehicleId),
      ),
    );
  const seededSeatLabels = new Set(existingSeatRows.map((r) => r.seatLabel));
  const seatRows = cruiseSeatLayout.cells
    .filter((c) => c.type === "seat" && c.seatLabel)
    .map((c) => ({
      tenantId: orgIds.nileHorizonEnterprise,
      tripId: travelerTripId,
      vehicleId: cruiseVehicleId,
      seatLabel: c.seatLabel!,
      rowIndex: c.row,
      colIndex: c.col,
      isAccessible: false,
      isPriority: c.row === 0,
      status: "available" as const,
      updatedAt: now,
    }))
    .filter((row) => !seededSeatLabels.has(row.seatLabel));
  if (seatRows.length > 0) {
    await db.insert(tripSeatInventory).values(seatRows);
  }

  // Programs: one included, one paid per-person add-on with limited capacity.
  const cruiseProgramIds = await db
    .select({ id: tripPrograms.id, titleEn: tripPrograms.titleEn })
    .from(tripPrograms)
    .where(eq(tripPrograms.tripId, travelerTripId));
  const programIdByTitle = new Map(cruiseProgramIds.map((r) => [r.titleEn, r.id]));
  const includedProgramId = programIdByTitle.get("Welcome Dinner") ?? randomUUID();
  const quadProgramId = programIdByTitle.get("Desert Quad Adventure") ?? randomUUID();
  await db
    .insert(tripPrograms)
    .values([
      {
        id: includedProgramId,
        tenantId: orgIds.nileHorizonEnterprise,
        tripId: travelerTripId,
        titleAr: "عشاء ترحيبي",
        titleEn: "Welcome Dinner",
        descriptionAr: "عشاء مضمّن في سعر الرحلة.",
        descriptionEn: "Dinner included in the base trip price.",
        dayNumber: 1,
        priceMinor: 0,
        currencyCode: "EGP",
        isIncludedInBase: true,
        capacity: null,
        bookedCount: 0,
        sortOrder: 1,
        status: "active",
        createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: quadProgramId,
        tenantId: orgIds.nileHorizonEnterprise,
        tripId: travelerTripId,
        titleAr: "مغامرة دراجات الصحراء",
        titleEn: "Desert Quad Adventure",
        descriptionAr: "جولة دراجات رباعية بسعر لكل شخص.",
        descriptionEn: "Per-person quad-bike safari add-on.",
        dayNumber: 2,
        priceMinor: 150_000,
        currencyCode: "EGP",
        isIncludedInBase: false,
        capacity: 10,
        bookedCount: 8,
        sortOrder: 2,
        status: "active",
        createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoUpdate({
      target: tripPrograms.id,
      set: { status: "active", updatedAt: now },
    });

  // Platform coupon spendable on any trip.
  const cruiseCouponId = await resolveId(
    db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, "TRAVEL10")).limit(1),
  );
  await db
    .insert(coupons)
    .values({
      id: cruiseCouponId,
      scope: "platform",
      tenantId: null,
      ownerAccountId: bootstrapSuperAdminId,
      code: "TRAVEL10",
      titleAr: "خصم 10% للمسافرين",
      titleEn: "10% off for travelers",
      discountType: "percentage",
      discountValue: 10,
      maxDiscountMinor: 50_000,
      minOrderMinor: 100_000,
      currencyCode: "EGP",
      maxRedemptions: 1000,
      redemptionsCount: 0,
      tripId: null,
      startsAt: null,
      expiresAt: in30Days,
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: coupons.id,
      set: { status: "active", expiresAt: in30Days, updatedAt: now },
    });

  // A completed trip with a published album (album screens, SCR-TRV-16/17).
  const pastTripId = await resolveId(
    db
      .select({ id: trips.id })
      .from(trips)
      .where(eq(trips.titleEn, "Red Sea Snorkel Weekend (Past)"))
      .limit(1),
  );
  await db
    .insert(trips)
    .values({
      id: pastTripId,
      tenantId: orgIds.redSeaGrowth,
      titleAr: "رحلة غوص البحر الأحمر (سابقة)",
      titleEn: "Red Sea Snorkel Weekend (Past)",
      descriptionAr: "رحلة مكتملة للصور التذكارية.",
      descriptionEn: "Completed trip with photo albums.",
      categoryLookupCode: "SNORKELING",
      language: "ar",
      startsAt: fiveDaysAgo,
      endsAt: new Date(fiveDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      timezone: "Africa/Cairo",
      seatAssignmentMode: "organization_assigned",
      basePriceMinor: 180_000,
      currencyCode: "EGP",
      totalCapacity: 20,
      confirmedSeatsCount: 20,
      state: "completed",
      publishMode: "public",
      hasStaffingGap: false,
      publishedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      createdByAccountId: accountIdFor("owner@nilehorizon.eg"),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: trips.id,
      set: { state: "completed", updatedAt: now },
    });

  const pastAlbumId = await resolveId(
    db
      .select({ id: tripPhotoAlbums.id })
      .from(tripPhotoAlbums)
      .where(
        and(eq(tripPhotoAlbums.tripId, pastTripId), eq(tripPhotoAlbums.titleEn, "Reef Day One")),
      )
      .limit(1),
  );
  await db
    .insert(tripPhotoAlbums)
    .values({
      id: pastAlbumId,
      tenantId: orgIds.redSeaGrowth,
      tripId: pastTripId,
      photographerAccountId: bootstrapSuperAdminId,
      titleAr: "اليوم الأول على الشعاب",
      titleEn: "Reef Day One",
      coverPhotoUrl: "https://cdn.trips-enjoy.com/demo/reef-day-one.jpg",
      photoUrls: [
        "https://cdn.trips-enjoy.com/demo/reef-01.jpg",
        "https://cdn.trips-enjoy.com/demo/reef-02.jpg",
      ],
      photoCount: 2,
      watermarked: true,
      audience: "public",
      audienceAccountIds: [],
      status: "published",
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: tripPhotoAlbums.id,
      set: { status: "published", audience: "public", audienceAccountIds: [], updatedAt: now },
    });

  const credentials: DemoAccountCredential[] = [
    {
      id: defaultSummary.bootstrapSuperAdmin.id,
      email: defaultSummary.bootstrapSuperAdmin.email,
      phone: defaultSummary.bootstrapSuperAdmin.phone,
      fullName: "Platform Super Admin (Bootstrap)",
      roles: ["admin"],
      adminSubRole: "super_admin",
      status: "active",
      password: defaultSummary.bootstrapSuperAdmin.defaultPassword,
      secondFactorNote: `TOTP (${defaultSummary.bootstrapSuperAdmin.totpSecret})`,
    },
    ...demoAccountSpecs.map((spec) => ({
      id: accountIdFor(spec.email),
      email: spec.email,
      phone: spec.phone,
      fullName: spec.fullName,
      roles: spec.roles.map((r) => r.role),
      adminSubRole: spec.roles[0]?.adminSubRole ?? null,
      tenantName: spec.tenantName,
      planTier: spec.roles[0]?.planTier ?? null,
      status: spec.status,
      password: DEMO_DEFAULT_PASSWORD,
      secondFactorNote: spec.secondFactorNote,
    })),
  ];

  return {
    mode: "demo",
    defaultSummary,
    organizationsSeeded: orgDefs.length,
    accountsSeeded: credentials.length,
    applicationsSeeded: appSeedRows.length,
    credentials,
    ids: {
      organizations: orgIds,
      accounts: Object.fromEntries(accountIds),
      applications: Object.fromEntries(applicationIds),
      tripId: demoTripId,
      vehicleId: demoVehicleId,
    },
  };
}
