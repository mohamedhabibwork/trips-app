// SCR-ORG-21 Find a platform supplier: search suppliers for the selected vehicle and send a proposal.
import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { useOrgNavigate } from "../common/org-link";
import {
  getSelectedTripId,
  getSelectedVehicleId,
  isoDay,
  setSelectedTripId,
  setSelectedNegotiationId,
  tripTitle,
} from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { InlineDetail, platformRoleLabel, routeText, type PlatformRole } from "./staffing-parts";

type Currency = "EGP" | "SAR" | "AED";
const CURRENCIES: readonly Currency[] = ["EGP", "SAR", "AED"];
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_OFFER_MINOR = 100;

interface SupplierCandidate {
  accountId: string;
  fullName: string;
  role: PlatformRole;
}

interface SupplierCardProps {
  supplier: SupplierCandidate;
  date: string;
  enabled: boolean;
  selected: boolean;
  onSelect: () => void;
}

function SupplierCard({ supplier, date, enabled, selected, onSelect }: SupplierCardProps) {
  const start = date ? new Date(`${date}T00:00:00.000Z`) : null;
  const validDate = start !== null && !Number.isNaN(start.getTime());
  const availabilityQuery = useQuery({
    ...orpc.availability.checkSupplierAvailability.queryOptions({
      input: {
        supplierAccountId: supplier.accountId,
        startsAt: validDate ? start.toISOString() : "",
        endsAt: validDate ? new Date(start.getTime() + DAY_MS).toISOString() : "",
      },
    }),
    enabled: enabled && validDate,
  });
  const available = availabilityQuery.data?.isAvailable;
  const shownDate = date || NO_VALUE;

  return (
    <section
      aria-label={supplier.fullName}
      className={`flex flex-col gap-4 rounded-xl border bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)] ${
        selected ? "border-2 border-[var(--te-primary)]" : "border-[var(--te-hairline)]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm leading-5 font-semibold">{supplier.fullName}</span>
          <span className="te-caption text-[var(--te-ink-muted)]">
            {platformRoleLabel(supplier.role)}
          </span>
        </div>
        <OrgBadge tone="ok">
          {t("screen.organization.staffing.platformSupplierSearchAndDealStart.verified")}
        </OrgBadge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {available === false ? (
          <OrgBadge tone="err">
            {t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.unavailableOnDate",
              { date: shownDate },
            )}
          </OrgBadge>
        ) : (
          <OrgBadge tone={available ? "ok" : "neu"}>
            {available
              ? t(
                  "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate",
                  { date: shownDate },
                )
              : t(
                  "screen.organization.staffing.platformSupplierSearchAndDealStart.availabilityUnknown",
                )}
          </OrgBadge>
        )}
        {available === false ? null : (
          <OrgButton variant="secondary" aria-pressed={selected} onClick={onSelect}>
            {selected
              ? t("screen.organization.staffing.platformSupplierSearchAndDealStart.selected")
              : t("screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplier")}
          </OrgButton>
        )}
      </div>
    </section>
  );
}

export function PlatformSupplierSearchAndDealStart() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor, locale } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<PlatformRole>("platform_driver");
  const [dateInput, setDateInput] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [price, setPrice] = useState("150.00");
  const [currency, setCurrency] = useState<Currency>("SAR");
  const [sendFailed, setSendFailed] = useState(false);
  const sendHintId = useId();

  const suppliersQuery = useQuery({
    ...orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
    enabled,
  });
  const negotiationsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled,
  });
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled,
  });

  const trips = tripsQuery.data?.items ?? [];
  const tripId = getSelectedTripId() ?? trips[0]?.id ?? null;
  const trip = trips.find((item) => item.id === tripId);
  const vehicleId = getSelectedVehicleId();
  const plate = trip?.vehicles.find((vehicle) => vehicle.vehicleId === vehicleId)?.plateNumber;
  const date = dateInput ?? isoDay(trip?.startsAt) ?? "";
  const tripName = trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE;

  const candidates: SupplierCandidate[] = [];
  for (const supplier of suppliersQuery.data?.suppliers ?? []) {
    candidates.push({
      accountId: supplier.supplierAccountId,
      fullName: supplier.fullName,
      role:
        supplier.supplierRole === "org_photographer" ? "platform_photographer" : "platform_driver",
    });
  }
  for (const deal of negotiationsQuery.data?.items ?? []) {
    if (candidates.some((candidate) => candidate.accountId === deal.supplierAccountId)) continue;
    candidates.push({
      accountId: deal.supplierAccountId,
      fullName: `${platformRoleLabel(deal.supplierRole)} ${deal.supplierAccountId.slice(0, 8)}`,
      role: deal.supplierRole,
    });
  }
  const normalizedQuery = query.trim().toLowerCase();
  const visible = candidates.filter(
    (candidate) =>
      candidate.role === roleFilter && candidate.fullName.toLowerCase().includes(normalizedQuery),
  );
  const selected = candidates.find((candidate) => candidate.accountId === selectedId);

  const createOfferMutation = useMutation(
    orpc.negotiation.createOffer.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
      },
    }),
  );

  async function handleSendProposal() {
    if (!selected || !tripId) return;
    setSendFailed(false);
    try {
      setSelectedTripId(tripId);
      const created = await createOfferMutation.mutateAsync({
        tripId,
        vehicleId,
        supplierAccountId: selected.accountId,
        supplierRole: selected.role,
        offerAmountMinor: Math.max(
          MIN_OFFER_MINOR,
          Math.round((Number.parseFloat(price) || 0) * 100),
        ),
        currencyCode: currency,
      });
      setSelectedNegotiationId(created.id);
      void goTo("deal-detail-and-negotiation", { dealId: created.id });
    } catch {
      setSendFailed(true);
    }
  }

  const loading = suppliersQuery.isLoading || negotiationsQuery.isLoading;
  const failed = suppliersQuery.isError || negotiationsQuery.isError;
  const canSend = enabled && Boolean(selected && tripId) && !createOfferMutation.isPending;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.staffing.platformSupplierSearchAndDealStart.title")}
        caption={t("screen.organization.staffing.platformSupplierSearchAndDealStart.caption", {
          trip: tripName,
          plate: plate ?? NO_VALUE,
        })}
      />
      <OrgRow align="start">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-[3]">
          <div className="grid gap-4 md:grid-cols-4 md:items-end">
            <OrgInput
              label={t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers",
              )}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              fieldClassName="md:col-span-2"
            />
            <OrgSelect
              label={t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierType",
              )}
              options={[
                { value: "platform_driver", label: platformRoleLabel("platform_driver") },
                {
                  value: "platform_photographer",
                  label: platformRoleLabel("platform_photographer"),
                },
              ]}
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(
                  value === "platform_photographer" ? "platform_photographer" : "platform_driver",
                )
              }
            />
            <OrgInput
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.date")}
              type="date"
              value={date}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </div>
          {failed ? (
            <OrgError
              onRetry={() => {
                void suppliersQuery.refetch();
                void negotiationsQuery.refetch();
              }}
            />
          ) : null}
          {loading ? <OrgLoading /> : null}
          {!loading && !failed && visible.length === 0 ? (
            <OrgEmpty
              title={t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.emptyTitle",
              )}
            >
              {t("screen.organization.staffing.platformSupplierSearchAndDealStart.emptyBody")}
            </OrgEmpty>
          ) : null}
          {visible.map((supplier) => (
            <SupplierCard
              key={supplier.accountId}
              supplier={supplier}
              date={date}
              enabled={enabled}
              selected={supplier.accountId === selectedId}
              onSelect={() => setSelectedId(supplier.accountId)}
            />
          ))}
        </div>
        <OrgCard
          title={t("screen.organization.staffing.platformSupplierSearchAndDealStart.startADeal")}
          className="lg:flex-[2]"
        >
          <div className="flex flex-col gap-2">
            <InlineDetail
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.trip")}
            >
              {tripName}
            </InlineDetail>
            <InlineDetail
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.route")}
            >
              {routeText(trip, locale)}
            </InlineDetail>
            <InlineDetail
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.date")}
            >
              {date || NO_VALUE}
            </InlineDetail>
            <InlineDetail
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.supplier")}
            >
              {selected?.fullName ?? NO_VALUE}
            </InlineDetail>
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <OrgInput
              label={t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.proposedPay",
              )}
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <OrgSelect
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.currency")}
              options={CURRENCIES.map((code) => ({ value: code, label: code }))}
              value={currency}
              onValueChange={(value) =>
                setCurrency(CURRENCIES.find((code) => code === value) ?? "SAR")
              }
            />
          </div>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierSeesDetails",
            )}
          </p>
          {sendFailed ? (
            <OrgAlert
              tone="err"
              title={t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.sendFailed",
              )}
            />
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {selected ? null : (
              <span id={sendHintId} className="te-caption text-[var(--te-ink-muted)]">
                {t(
                  "screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplierFirst",
                )}
              </span>
            )}
            <OrgButton
              disabled={!canSend}
              aria-describedby={selected ? undefined : sendHintId}
              onClick={() => void handleSendProposal()}
            >
              {t("screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal")}
            </OrgButton>
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
