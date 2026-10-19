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
  setSelectedVehicleId,
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
const MIN_OFFER_MINOR = 100;
const AMOUNT_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

interface SupplierCandidate {
  accountId: string;
  fullName: string;
  role: PlatformRole;
}

interface SupplierCardProps {
  supplier: SupplierCandidate;
  /** The trip's start and end; availability is checked for that window. */
  window: { startsAt: string; endsAt: string } | null;
  date: string;
  enabled: boolean;
  selected: boolean;
  onSelect: () => void;
}

function SupplierCard({ supplier, window, date, enabled, selected, onSelect }: SupplierCardProps) {
  const availabilityQuery = useQuery({
    ...orpc.availability.checkSupplierAvailability.queryOptions({
      input: {
        supplierAccountId: supplier.accountId,
        startsAt: window?.startsAt ?? "",
        endsAt: window?.endsAt ?? "",
      },
    }),
    enabled: enabled && Boolean(window),
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chosenTripId, setChosenTripId] = useState<string | null>(() => getSelectedTripId());
  const [chosenVehicleId, setChosenVehicleId] = useState<string | null>(() =>
    getSelectedVehicleId(),
  );
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<Currency>("EGP");
  const [sendFailed, setSendFailed] = useState(false);
  const sendHintId = useId();

  const negotiationsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled,
  });
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled,
  });

  const trips = tripsQuery.data?.items ?? [];
  // The trip and vehicle are chosen here; nothing is picked for the user.
  const trip = trips.find((item) => item.id === chosenTripId);
  const tripId = trip?.id ?? null;
  const vehicle = trip?.vehicles.find((item) => item.vehicleId === chosenVehicleId);
  const vehicleId = vehicle?.vehicleId ?? null;
  const date = isoDay(trip?.startsAt) ?? "";
  const tripName = trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE;
  const window =
    trip?.startsAt && trip.endsAt
      ? {
          startsAt: new Date(trip.startsAt).toISOString(),
          endsAt: new Date(trip.endsAt).toISOString(),
        }
      : null;

  // No procedure searches the platform's suppliers yet, so the only candidates are the platform
  // suppliers this organization has already dealt with. Their names are not shared with it.
  const candidates: SupplierCandidate[] = [];
  for (const deal of negotiationsQuery.data?.items ?? []) {
    if (candidates.some((candidate) => candidate.accountId === deal.supplierAccountId)) continue;
    candidates.push({
      accountId: deal.supplierAccountId,
      fullName: t(
        "screen.organization.staffing.platformSupplierSearchAndDealStart.previousSupplier",
        {
          role: platformRoleLabel(deal.supplierRole),
          reference: deal.supplierAccountId.slice(0, 8),
        },
      ),
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
    const text = price.trim();
    const offerAmountMinor = AMOUNT_PATTERN.test(text) ? Math.round(Number(text) * 100) : 0;
    if (offerAmountMinor < MIN_OFFER_MINOR) {
      setPriceError(
        t("screen.organization.staffing.platformSupplierSearchAndDealStart.payInvalid"),
      );
      return;
    }
    setPriceError(undefined);
    setSendFailed(false);
    try {
      setSelectedTripId(tripId);
      const created = await createOfferMutation.mutateAsync({
        tripId,
        vehicleId,
        supplierAccountId: selected.accountId,
        supplierRole: selected.role,
        offerAmountMinor,
        currencyCode: currency,
      });
      setSelectedNegotiationId(created.id);
      void goTo("deal-detail-and-negotiation", { dealId: created.id });
    } catch {
      setSendFailed(true);
    }
  }

  const loading = negotiationsQuery.isLoading || tripsQuery.isLoading;
  const failed = negotiationsQuery.isError || tripsQuery.isError;
  const canSend = enabled && Boolean(selected && tripId) && !createOfferMutation.isPending;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.staffing.platformSupplierSearchAndDealStart.title")}
        caption={t("screen.organization.staffing.platformSupplierSearchAndDealStart.caption", {
          trip: tripName,
          plate: vehicle?.plateNumber ?? NO_VALUE,
        })}
      />
      <OrgAlert
        tone="info"
        title={t(
          "screen.organization.staffing.platformSupplierSearchAndDealStart.searchUnavailableTitle",
        )}
      >
        {t("screen.organization.staffing.platformSupplierSearchAndDealStart.searchUnavailableBody")}
      </OrgAlert>
      <div className="grid gap-4 md:grid-cols-2">
        <OrgSelect
          label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.trip")}
          options={[
            {
              value: "",
              label: t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.chooseTrip",
              ),
            },
            ...trips.map((item) => ({
              value: item.id,
              label: tripTitle(item, locale) || NO_VALUE,
            })),
          ]}
          value={tripId ?? ""}
          onValueChange={(value) => {
            setChosenTripId(value || null);
            setChosenVehicleId(null);
          }}
        />
        <OrgSelect
          label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.vehicle")}
          disabled={!trip}
          options={[
            {
              value: "",
              label: t(
                "screen.organization.staffing.platformSupplierSearchAndDealStart.anyVehicle",
              ),
            },
            ...(trip?.vehicles ?? []).map((item) => ({
              value: item.vehicleId,
              label: item.plateNumber ?? item.vehicleId,
            })),
          ]}
          value={vehicleId ?? ""}
          onValueChange={(value) => {
            setChosenVehicleId(value || null);
            setSelectedVehicleId(value || null);
          }}
        />
      </div>
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
              readOnly
            />
          </div>
          {failed ? (
            <OrgError
              onRetry={() => {
                void tripsQuery.refetch();
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
              window={window}
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
              required
              error={priceError}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <OrgSelect
              label={t("screen.organization.staffing.platformSupplierSearchAndDealStart.currency")}
              options={CURRENCIES.map((code) => ({ value: code, label: code }))}
              value={currency}
              onValueChange={(value) =>
                setCurrency(CURRENCIES.find((code) => code === value) ?? "EGP")
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
