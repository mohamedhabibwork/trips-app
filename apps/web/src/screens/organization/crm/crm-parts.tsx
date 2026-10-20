// Shared pieces of the CRM pages (SCR-ORG-48 to 56): the section tabs, the CRM-provider connect
// badge from the organization settings, and the customers derived from the bookings list. The CRM
// store itself (campaigns, leads, segments, reviews) has no backend procedures yet, so those pages
// render their structure and say so instead of inventing rows.
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgNavTabs } from "../common/org-form";
import { orgHref, type OrgSlug } from "../common/org-routes";
import { OrgBadge, type OrgTone } from "../common/org-ui";

export const CRM_PARTS_K = "screen.organization.crm.crmParts";

/** The CRM pages, in the artboards' tab order; the inbox is the section's daily page. */
const CRM_TABS = [
  { id: "crm-inbox", labelKey: `${CRM_PARTS_K}.tabInbox` },
  { id: "crm-customers", labelKey: `${CRM_PARTS_K}.tabCustomers` },
  { id: "crm-leads", labelKey: `${CRM_PARTS_K}.tabLeads` },
  { id: "crm-campaigns", labelKey: `${CRM_PARTS_K}.tabCampaigns` },
  { id: "crm-segments", labelKey: `${CRM_PARTS_K}.tabSegments` },
  { id: "crm-reviews", labelKey: `${CRM_PARTS_K}.tabReviews` },
] as const;

export function CrmTabs({ activeSlug }: { activeSlug: string }): ReactNode {
  return (
    <OrgNavTabs
      label={t(`${CRM_PARTS_K}.tabsLabel`)}
      tabs={CRM_TABS.map((tab) => ({
        id: tab.id,
        label: t(tab.labelKey),
        href: orgHref(tab.id as OrgSlug),
      }))}
      activeId={activeSlug}
    />
  );
}

/** Badge that shows whether a CRM provider is connected in the organization settings. */
export function CrmConnectBadge(): ReactNode {
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);
  const settingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      {
        input: {},
      },
    ),
    enabled,
  });
  const provider = settingsQuery.data?.settings.crmProvider;
  return provider ? (
    <OrgBadge tone="ok">{t(`${CRM_PARTS_K}.connectedAs`, { provider })}</OrgBadge>
  ) : (
    <OrgBadge tone="neu" icon="offline">
      {t(`${CRM_PARTS_K}.notConnected`)}
    </OrgBadge>
  );
}

/** The booking fields the CRM pages read (booking.listOrganizationBookings rows). */
export interface CrmBookingRow {
  id: string;
  bookingReference: string;
  tripId: string;
  travelerAccountId: string | null;
  passengers: readonly { id?: string; fullName?: string; isChild?: boolean }[];
  passengersCount: number;
  selectedProgramIds: readonly string[];
  couponId: string | null;
  couponCode: string | null;
  discountMinor: number;
  totalAmountMinor: number;
  currencyCode: string;
  status: string;
  refundAmountMinor: number;
  createdAt: string | Date;
}

/** Rows of the bookings query narrowed to the fields the CRM pages read. */
export function toCrmBookings(data: unknown): readonly CrmBookingRow[] {
  return Array.isArray(data) ? (data as CrmBookingRow[]) : [];
}

/** Bookings the traveler paid for; cancelled ones still show as history but carry their refund. */
export const CRM_PAID_STATES: readonly string[] = ["confirmed", "checked_in", "completed"];

export interface CustomerRecord {
  /** The traveler account the bookings belong to; bookings without one fall back on the name. */
  id: string;
  name: string;
  type: "traveler" | "family";
  tripCount: number;
  /** Bookings this customer booked, newest first. */
  bookings: readonly CrmBookingRow[];
  lifetimeMinor: number;
  lifetimeCurrency: string;
  lastTripAt: string | Date | null;
  coupons: readonly string[];
  programIds: readonly string[];
}

function customerTypeOf(bookings: readonly CrmBookingRow[]): "traveler" | "family" {
  return bookings.some((booking) =>
    (booking.passengers ?? []).some((passenger) => passenger.isChild === true),
  )
    ? "family"
    : "traveler";
}

/**
 * Customers derived from the bookings list: one record per traveler account, named after the
 * booker's first passenger. City, plan and marketing consent are not recorded on bookings, so the
 * pages show them as unknown instead of guessing.
 */
export function deriveCustomers(bookings: readonly CrmBookingRow[]): readonly CustomerRecord[] {
  const byAccount = new Map<string, CrmBookingRow[]>();
  for (const booking of bookings) {
    const key = booking.travelerAccountId ?? `name:${firstPassengerName(booking)}`;
    const list = byAccount.get(key) ?? [];
    list.push(booking);
    byAccount.set(key, list);
  }
  const customers: CustomerRecord[] = [];
  for (const [id, rows] of byAccount) {
    const sorted = [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latest = sorted[0];
    if (!latest) continue;
    const coupons = [
      ...new Set(
        sorted.map((booking) => booking.couponCode).filter((code): code is string => Boolean(code)),
      ),
    ];
    const programIds = [
      ...new Set(sorted.flatMap((booking) => [...(booking.selectedProgramIds ?? [])])),
    ];
    customers.push({
      id,
      name: firstPassengerName(latest) || id,
      type: customerTypeOf(sorted),
      tripCount: sorted.length,
      bookings: sorted,
      lifetimeMinor: sorted.reduce((sum, booking) => sum + booking.totalAmountMinor, 0),
      lifetimeCurrency: latest.currencyCode,
      lastTripAt: latest.createdAt,
      coupons,
      programIds,
    });
  }
  return customers.sort((a, b) => b.lifetimeMinor - a.lifetimeMinor);
}

function firstPassengerName(booking: CrmBookingRow): string {
  return booking.passengers?.[0]?.fullName ?? "";
}

const BOOKING_STATUS_TONE: Record<string, OrgTone> = {
  pending_payment: "warn",
  confirmed: "ok",
  checked_in: "neu",
  completed: "neu",
  cancelled: "err",
  refunded: "neu",
};

const BOOKING_STATUS_KEY: Record<string, string> = {
  pending_payment: "status.pendingPayment",
  confirmed: "status.confirmed",
  checked_in: "status.checkedIn",
  completed: "status.completed",
  cancelled: "status.cancelled",
  refunded: "status.refunded",
};

/** Badge of a booking row's raw status, in CRM vocabulary. */
export function CrmBookingStatusBadge({ status }: { status: string }): ReactNode {
  const key = BOOKING_STATUS_KEY[status];
  if (!key)
    return (
      <OrgBadge tone="neu" icon={false}>
        {status}
      </OrgBadge>
    );
  return (
    <OrgBadge tone={BOOKING_STATUS_TONE[status] ?? "neu"}>{t(`${CRM_PARTS_K}.${key}`)}</OrgBadge>
  );
}
