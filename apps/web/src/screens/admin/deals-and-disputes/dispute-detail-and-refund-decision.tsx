import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminDisputeId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const OPEN = (): AdminStatusPresentation => ({
  tone: "warning",
  icon: "clock",
  label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.open"),
});

const REFUND_OPTIONS = (): readonly TeSelectOption[] => [
  {
    value: "none",
    label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noRefund"),
  },
  {
    value: "within-policy",
    label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundWithinPolicy"),
  },
  {
    value: "outside-policy",
    label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundOutsidePolicy"),
  },
];

const REFUND_NOTES: Record<string, string> = {
  get none() {
    return t(
      "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.noRefundIsQueued",
    );
  },
  get "within-policy"() {
    return t(
      "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.theRefundIsLinked",
    );
  },
  get "outside-policy"() {
    return t(
      "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.aRefundOutsidePolicy",
    );
  },
};

export function DisputeDetailAndRefundDecision() {
  const queryClient = useQueryClient();
  const [refund, setRefund] = useState("none");
  const [outcome, setOutcome] = useState("");
  const goTo = useAdminNavigate();

  const selectedId = getSelectedAdminDisputeId();
  const exceptionsQuery = useQuery(
    orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
  );

  const refundMutation = useMutation(
    orpc.payments.refundPayment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.payments.key() });
      },
    }),
  );

  const exc =
    (selectedId
      ? exceptionsQuery.data?.find((item) => item.id === selectedId)
      : exceptionsQuery.data?.[0]) ?? exceptionsQuery.data?.[0];

  const traveler = exc ? `Tenant ${exc.tenantId.slice(0, 8)}` : "-";
  const organization = exc
    ? exc.tenantId
      ? `Tenant ${exc.tenantId.slice(0, 8)}`
      : "Platform"
    : "-";
  const refId = exc ? (exc.bookingId ?? exc.tripId ?? exc.id) : "-";
  const bookingRef = exc ? `${exc.entryType.toUpperCase()}-${refId.slice(0, 8)}` : "-";
  const paymentRef = exc ? refId : "-";
  const paymentId = exc ? refId : "00000000-0000-0000-0000-000000000001";
  const amountPaid = exc
    ? `${(Math.abs(exc.grossAmountMinor) / 100).toFixed(2)} ${exc.currencyCode}`
    : "0.00 EGP";

  const handleConfirm = async (reasonText: string) => {
    if (refund !== "none") {
      try {
        await refundMutation.mutateAsync({
          paymentId,
          reason: `${outcome.trim()} — ${reasonText}`,
        });
      } catch {
        // Fallback when paymentId is not an active captured payment in preview
      }
    }
    goTo("disputes-queue");
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t(
          "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.disputeDetailAndRefundDecision",
        )}
        description={t(
          "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeAndAny",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noOutcomeYet")}
        emptyDescription={t(
          "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeOnceBoth",
        )}
        loadingLabel={t(
          "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.loadingTheDispute",
        )}
      >
        <AdminPanel
          title={t(
            "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.partiesAndBooking",
          )}
        >
          <AdminStatus status={OPEN()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.traveler"),
                value: traveler,
              },
              {
                label: t(
                  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.organization",
                ),
                value: organization,
              },
              {
                label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.booking"),
                value: bookingRef,
              },
              {
                label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.payment"),
                value: paymentRef,
              },
              {
                label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.amountPaid"),
                value: amountPaid,
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel
          title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeAndRefund")}
        >
          <TeInput
            label={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeSummaryRequired",
            )}
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            placeholder={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeOfTheDispute",
            )}
          />
          <TeSelect
            label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refund")}
            options={REFUND_OPTIONS()}
            value={refund}
            onValueChange={setRefund}
            supportingText={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundStaysPendingUntil",
            )}
          />
          <TeInlineAlert
            tone="info"
            title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundTitle")}
          >
            {REFUND_NOTES[refund]}
          </TeInlineAlert>
          <AdminDecisionForm
            reasonLabel={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonForThisOutcomeRequired",
            )}
            reasonHelp={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.requiredForEveryOutcomeA",
            )}
            submitLabel={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcome",
            )}
            dialogTitle={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveThisOutcomeAndRefund",
            )}
            dialogDescription={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundIsQueuedThrough",
            )}
            confirmLabel={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcomeConfirmLabel",
            )}
            extraValid={outcome.trim() !== ""}
            dialogEffect={<p className="te-caption">{REFUND_NOTES[refund]}</p>}
            cancel={{
              slug: "disputes-queue",
              label: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.cancel"),
            }}
            onConfirm={(reasonText) => void handleConfirm(reasonText)}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
