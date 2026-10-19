import type {
  BookingPassenger,
  BookingStatus,
  CurrencyCode,
  DisputeResolutionStatus,
  LedgerEntryDirection,
  LedgerEntryStatus,
  LedgerEntryType,
  PaymentGatewayCode,
  PaymentPurpose,
  PaymentTransactionStatus,
  SubscriptionBillingCycle,
  SubscriptionRecordStatus,
} from "@trips-app/domain";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { accounts, organizations } from "./auth";
import { vehicles } from "./fleet";
import { coupons } from "./operations";
import { planCatalog } from "./settings-and-roles";
import { trips } from "./trips";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingReference: text("booking_reference").notNull(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "restrict" })
      .notNull(),
    travelerAccountId: uuid("traveler_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    passengersCount: integer("passengers_count").notNull(),
    passengers: jsonb("passengers").$type<BookingPassenger[]>().default([]).notNull(),
    selectedProgramIds: jsonb("selected_program_ids").$type<string[]>().default([]).notNull(),
    seatLabels: jsonb("seat_labels").$type<string[]>().default([]).notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    couponCode: text("coupon_code"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    programsTotalMinor: integer("programs_total_minor").default(0).notNull(),
    discountMinor: integer("discount_minor").default(0).notNull(),
    totalAmountMinor: integer("total_amount_minor").notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    status: text("status").$type<BookingStatus>().default("pending_payment").notNull(),
    paymentGateway: text("payment_gateway").$type<PaymentGatewayCode | null>(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    refundAmountMinor: integer("refund_amount_minor").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bookings_reference_uidx").on(table.bookingReference),
    index("bookings_tenant_idx").on(table.tenantId),
    index("bookings_trip_idx").on(table.tripId),
    index("bookings_traveler_idx").on(table.travelerAccountId),
    index("bookings_vehicle_idx").on(table.vehicleId),
    index("bookings_coupon_idx").on(table.couponId),
    index("bookings_status_idx").on(table.status),
  ],
);

export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    payerAccountId: uuid("payer_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    purpose: text("purpose").$type<PaymentPurpose>().default("trip_booking").notNull(),
    gateway: text("gateway").$type<PaymentGatewayCode>().notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    status: text("status").$type<PaymentTransactionStatus>().default("pending").notNull(),
    providerReference: text("provider_reference").notNull(),
    fawryReferenceCode: text("fawry_reference_code"),
    fawryExpiresAt: timestamp("fawry_expires_at", { withTimezone: true }),
    disputeReason: text("dispute_reason"),
    disputeStatus: text("dispute_status").$type<DisputeResolutionStatus | null>(),
    refundedAmountMinor: integer("refunded_amount_minor").default(0).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("payment_transactions_provider_ref_uidx").on(table.providerReference),
    index("payment_transactions_tenant_idx").on(table.tenantId),
    index("payment_transactions_booking_idx").on(table.bookingId),
    index("payment_transactions_payer_idx").on(table.payerAccountId),
    index("payment_transactions_status_idx").on(table.status),
  ],
);

export const subscriptionRecords = pgTable(
  "subscription_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope: text("scope").$type<"account" | "organization">().notNull(),
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "cascade",
    }),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    planId: text("plan_id")
      .references(() => planCatalog.id, { onDelete: "restrict" })
      .notNull(),
    role: text("role")
      .$type<"traveler" | "organization" | "platform_driver" | "platform_photographer">()
      .notNull(),
    tier: text("tier").notNull(),
    billingCycle: text("billing_cycle")
      .$type<SubscriptionBillingCycle>()
      .default("monthly")
      .notNull(),
    priceMinor: integer("price_minor").notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    status: text("status").$type<SubscriptionRecordStatus>().default("active").notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
    overrideNote: text("override_note"),
    updatedByAccountId: uuid("updated_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("subscription_records_account_idx").on(table.accountId),
    index("subscription_records_tenant_idx").on(table.tenantId),
    index("subscription_records_plan_idx").on(table.planId),
    index("subscription_records_updated_by_idx").on(table.updatedByAccountId),
    index("subscription_records_status_idx").on(table.status),
  ],
);

export const accountingLedgerEntries = pgTable(
  "accounting_ledger_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    entryType: text("entry_type").$type<LedgerEntryType>().notNull(),
    direction: text("direction").$type<LedgerEntryDirection>().notNull(),
    grossAmountMinor: integer("gross_amount_minor").notNull(),
    commissionAmountMinor: integer("commission_amount_minor").default(0).notNull(),
    netAmountMinor: integer("net_amount_minor").notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    status: text("status").$type<LedgerEntryStatus>().default("posted").notNull(),
    invoiceNumber: text("invoice_number"),
    description: text("description").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("accounting_ledger_tenant_idx").on(table.tenantId),
    index("accounting_ledger_trip_idx").on(table.tripId),
    index("accounting_ledger_booking_idx").on(table.bookingId),
    index("accounting_ledger_status_idx").on(table.status),
  ],
);
