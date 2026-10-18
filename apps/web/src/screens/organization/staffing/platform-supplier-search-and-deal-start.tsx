import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import {
  getActiveWizardTripId,
  getSelectedVehicleId,
  OrgSection,
  setActiveWizardTripId,
  setSelectedNegotiationId,
  StateBadge,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface SupplierCandidate {
  accountId: string;
  fullName: string;
  role: "platform_driver" | "platform_photographer";
  isAvailable: boolean;
}

export function PlatformSupplierSearchAndDealStart() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedRole] = useState<"platform_driver" | "platform_photographer">("platform_driver");
  const [price, setPrice] = useState("150.00");
  const [currency, setCurrency] = useState<"EGP" | "SAR" | "AED" | "USD">("SAR");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const suppliersQuery = useQuery(
    orpc.onboarding.listOrganizationSuppliers.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const negotiationsQuery = useQuery(
    orpc.negotiation.listOrganizationNegotiations.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const rawCandidates = useMemo<SupplierCandidate[]>(() => {
    const candidates: SupplierCandidate[] = [];
    if (suppliersQuery.data?.suppliers) {
      for (const s of suppliersQuery.data.suppliers) {
        candidates.push({
          accountId: s.supplierAccountId,
          fullName: s.fullName,
          role: s.supplierRole === "org_photographer" ? "platform_photographer" : "platform_driver",
          isAvailable: true,
        });
      }
    }
    if (negotiationsQuery.data?.items) {
      for (const n of negotiationsQuery.data.items) {
        if (!candidates.some((c) => c.accountId === n.supplierAccountId)) {
          candidates.push({
            accountId: n.supplierAccountId,
            fullName: `${n.supplierRole === "platform_driver" ? "Driver" : "Photographer"} (${n.supplierAccountId.slice(0, 8)})`,
            role: n.supplierRole,
            isAvailable: true,
          });
        }
      }
    }
    return candidates;
  }, [suppliersQuery.data, negotiationsQuery.data]);

  const firstCandidate = rawCandidates[0];

  const nowIso = useMemo(() => new Date().toISOString(), []);
  const tomorrowIso = useMemo(() => new Date(Date.now() + 24 * 3600 * 1000).toISOString(), []);

  const availabilityQuery = useQuery(
    orpc.availability.checkSupplierAvailability.queryOptions({
      input: {
        supplierAccountId: firstCandidate?.accountId ?? "",
        startsAt: nowIso,
        endsAt: tomorrowIso,
      },
      enabled:
        authStatus === "authenticated" &&
        Boolean(actor?.activeTenantId) &&
        Boolean(firstCandidate?.accountId),
    }),
  );

  const suppliers = useMemo<readonly SupplierCandidate[]>(() => {
    if (!rawCandidates.length) return [];
    if (availabilityQuery.data && rawCandidates[0]) {
      return [
        {
          ...rawCandidates[0],
          isAvailable: availabilityQuery.data.isAvailable,
        },
        ...rawCandidates.slice(1),
      ];
    }
    return rawCandidates;
  }, [rawCandidates, availabilityQuery.data]);

  const createOfferMutation = useMutation(
    orpc.negotiation.createOffer.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
      },
    }),
  );

  async function handleSendProposal(
    supplierAccountId: string,
    role: "platform_driver" | "platform_photographer",
  ) {
    if (authStatus === "authenticated" && actor?.activeTenantId && supplierAccountId) {
      setErrorMsg(null);
      try {
        let tripId = getActiveWizardTripId();
        if (!tripId) {
          tripId = tripsQuery.data?.items[0]?.id ?? null;
          if (tripId) setActiveWizardTripId(tripId);
        }
        if (tripId) {
          const offerAmountMinor = Math.max(
            100,
            Math.round((Number.parseFloat(price) || 150) * 100),
          );
          const created = await createOfferMutation.mutateAsync({
            tripId,
            vehicleId: getSelectedVehicleId(),
            supplierAccountId,
            supplierRole: role,
            offerAmountMinor,
            currencyCode: currency === "USD" ? "SAR" : currency,
          });
          setSelectedNegotiationId(created.id);
        }
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not send proposal.");
        return;
      }
    }
    void goTo("deal-detail-and-negotiation");
  }

  const busy = createOfferMutation.isPending;

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSuppliers = suppliers.filter((s) =>
    s.fullName.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "staffing-board",
            label: t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.backToStaffingBoard",
            ),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.staffing.platformSupplierSearchAndDealStart.platformSupplierSearchAndDeal",
          )}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <TeInlineAlert tone="info">
          {t("screen.organization.staffing.platformSupplierSearchAndDealStart.theTripRouteDateAnd")}
        </TeInlineAlert>
        <OrgSection
          title={t("screen.organization.staffing.platformSupplierSearchAndDealStart.findASupplier")}
        >
          <TeSearchField
            label={t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers",
            )}
            value={query}
            onValueChange={setQuery}
            clearLabel={t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.clearSearch",
            )}
            placeholder={t(
              "screen.organization.staffing.platformSupplierSearchAndDealStart.nameRoleOrArea",
            )}
          />
          {visibleSuppliers.length > 0 ? (
            visibleSuppliers.map((supplier) => (
              <TeCard
                key={supplier.accountId}
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="te-h3">{supplier.fullName}</h3>
                    <StateBadge
                      tone="success"
                      icon="check"
                      label={t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.verified",
                      )}
                    />
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  <StateBadge
                    tone={supplier.isAvailable ? "info" : "warning"}
                    icon="calendar"
                    label={t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate",
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TeInput
                      label={t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.price",
                      )}
                      placeholder={t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.amount",
                      )}
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <TeInput
                      label={t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.currency",
                      )}
                      placeholder={t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.currencyCode",
                      )}
                      value={currency}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        if (code === "EGP" || code === "SAR" || code === "AED" || code === "USD") {
                          setCurrency(code);
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <TeButton
                      disabled={busy}
                      onClick={() => void handleSendProposal(supplier.accountId, supplier.role)}
                    >
                      {t(
                        "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal",
                      )}
                    </TeButton>
                  </div>
                </div>
              </TeCard>
            ))
          ) : (
            <TeCard>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TeInput
                    label="Supplier Account ID"
                    placeholder="UUID"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                  />
                  <TeInput
                    label={t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.price",
                    )}
                    placeholder={t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.amount",
                    )}
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <TeInput
                    label={t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.currency",
                    )}
                    placeholder={t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.currencyCode",
                    )}
                    value={currency}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      if (code === "EGP" || code === "SAR" || code === "AED" || code === "USD") {
                        setCurrency(code);
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <TeButton
                    disabled={busy}
                    onClick={() => void handleSendProposal(selectedSupplierId, selectedRole)}
                  >
                    {t(
                      "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal",
                    )}
                  </TeButton>
                </div>
              </div>
            </TeCard>
          )}
        </OrgSection>
      </div>
    </StatePreview>
  );
}
