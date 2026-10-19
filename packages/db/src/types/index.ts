// Shared TypeScript interfaces and types for @trips-app/db.
import type {
  AdminSubRole,
  PrimarySignInMethod,
  SupportedLocale,
  UserRole,
} from "@trips-app/domain";

import type { accounts, lookups, lookupTypes } from "../schema";

import type { createDb } from "../index";

// Row and insert types inferred from the tables, so they cannot drift from the schema.
export type AccountRow = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;
export type LookupTypeRow = typeof lookupTypes.$inferSelect;
export type LookupTypeInsert = typeof lookupTypes.$inferInsert;
export type LookupRow = typeof lookups.$inferSelect;
export type LookupInsert = typeof lookups.$inferInsert;

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@trips-app/domain";
export type { CoercedEnvSchema, EnvSchemaAsStrings, PublicCoercedEnvSchema } from "../env";

export type DatabaseConfig = {
  DATABASE_URL: string;
  /** Prints SQL text (never parameters) for each query. Off unless set. */
  logQueries?: boolean;
};

export type Database = ReturnType<typeof createDb>;

export interface LookupSeedSummary {
  lookupTypesSeeded: number;
  lookupsSeeded: number;
  /**
   * Size of the registered catalog (`LOOKUP_TYPE_CODES.length`). A deployment whose
   * `lookupTypesSeeded` is below this value is silently missing types (LK-07).
   */
  expectedTypeCount: number;
  typeIdsByCode: Record<string, number>;
  lookupIdsByKey: Record<string, number>;
}

/** Result of `verifyLookupSeed`: proves every registered type code has a row (LK-07). */
export interface LookupSeedVerification {
  ok: boolean;
  seededTypes: number;
  expectedTypes: number;
  /** Registered type codes with no `lookup_types` row, sorted for stable output. */
  missing: string[];
}

export interface DefaultSeedSummary {
  mode: "default";
  systemSettingsSeeded: boolean;
  authSettingsSeeded: boolean;
  rolesSeeded: number;
  permissionsSeeded: number;
  plansSeeded: number;
  lookupTypesSeeded: number;
  lookupsSeeded: number;
  bootstrapSuperAdmin: {
    id: string;
    email: string;
    phone: string;
    defaultPassword: string;
    totpSecret: string;
    subRole: "super_admin";
  };
}

export interface SeedDefaultOptions {
  superAdminEmail?: string;
  superAdminPhone?: string;
  superAdminPassword?: string;
  superAdminTotpSecret?: string;
  now?: Date;
}

export interface DemoAccountCredential {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  roles: UserRole[];
  adminSubRole?: AdminSubRole | null;
  tenantName?: string;
  planTier?: string | null;
  status: string;
  password: string;
  secondFactorNote?: string;
}

/** Stable lookup keys for the three organizations created by the demo seeder. */
export type DemoOrgKey = "nileHorizonEnterprise" | "redSeaGrowth" | "sinaiStarter";

/**
 * Identifiers generated at seed time. They are never hardcoded: the seeder reuses an existing row's
 * id when it finds one by natural key, otherwise it generates a fresh UUID. Consumers must read the
 * ids from the returned summary instead of assuming a literal value.
 */
export interface DemoSeedIds {
  organizations: Record<DemoOrgKey, string>;
  /** Keyed by the account email exactly as declared in the seed spec. */
  accounts: Record<string, string>;
  /** Keyed by the applicant email that owns the application. */
  applications: Record<string, string>;
  tripId: string;
  vehicleId: string;
}

export interface DemoSeedSummary {
  mode: "demo";
  defaultSummary: DefaultSeedSummary;
  organizationsSeeded: number;
  accountsSeeded: number;
  applicationsSeeded: number;
  credentials: DemoAccountCredential[];
  ids: DemoSeedIds;
}

export interface AccountSeedSpec {
  email: string;
  phone: string;
  fullName: string;
  locale: SupportedLocale;
  preferredSignInMethod: PrimarySignInMethod;
  status: "pending_verification" | "active" | "suspended" | "deletion_requested" | "deleted";
  emailVerified: boolean;
  phoneVerified: boolean;
  totpEnabled?: boolean;
  staffSecondFactorMethod?: "sms" | "totp" | null;
  failedSignInAttempts?: number;
  lockedUntil?: Date | null;
  suspendedReason?: string | null;
  deletionRequestedAt?: Date | null;
  roles: {
    role: UserRole;
    adminSubRole?: AdminSubRole | null;
    tenantKey?: DemoOrgKey | null;
    planTier?: string | null;
    status?: "pending_approval" | "active" | "paused" | "suspended" | "revoked";
    pauseReason?: string | null;
  }[];
  secondFactorNote?: string;
  tenantName?: string;
}
