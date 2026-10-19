// SCR-ADM-24 Dispute detail and refund decision (docs/design/web/admin/SCR-ADM-24.dc.html): the
// parties, booking and payment of one dispute, the outcome, and a refund linked to the dispute and
// booking. An outside-policy outcome cannot be saved without a reason.
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink, useAdminNavigate, useAdminParam } from "../common/admin-actions";
import { AdminInput, AdminRadioGroup, AdminTextarea } from "../common/admin-form";
import { getSelectedAdminDisputeId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminBadge, AdminCard, AdminPage, AdminRow } from "../common/admin-ui";
import { formatMinor, minorToMajorInput, parseMajorToMinor, shortId } from "./deals-format";
import { toDispute, type Dispute } from "./dispute-model";

type Outcome = "withinPolicy" | "outsidePolicy" | "stillOpen";

const REASON_MIN_LENGTH = 2;

const outcomeOptions = () => [
  {
    value: "withinPolicy",
    label: (
      <strong>
        {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.withinPolicy")}
      </strong>
    ),
    description: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.withinPolicyBody"),
  },
  {
    value: "outsidePolicy",
    label: (
      <strong>
        {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicy")}
      </strong>
    ),
    description: t(
      "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicyBody",
    ),
  },
  {
    value: "stillOpen",
    label: (
      <strong>{t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.stillOpen")}</strong>
    ),
    description: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.stillOpenBody"),
  },
];

interface DecisionErrors {
  amount?: string;
  reason?: string;
}

function validateDecision(outcome: Outcome, amount: string, reason: string): DecisionErrors {
  if (outcome === "stillOpen") return {};
  return {
    ...(parseMajorToMinor(amount) === null
      ? { amount: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.amountError") }
      : {}),
    ...(outcome === "outsidePolicy" && reason.trim().length < REASON_MIN_LENGTH
      ? { reason: t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonError") }
      : {}),
  };
}

function PartiesCard({ dispute, locale }: { dispute: Dispute; locale: string | undefined }) {
  return (
    <AdminCard title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.parties")}>
      <div>
        <AdminRow
          label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.traveler")}
        >
          —
        </AdminRow>
        <AdminRow
          label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.organization")}
        >
          {dispute.organization}
        </AdminRow>
        <AdminRow label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.booking")}>
          {dispute.reference}
        </AdminRow>
        <AdminRow
          label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.payment")}
          last
        >
          {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.paymentValue", {
            reference: dispute.paymentReference,
            amount: formatMinor(dispute.amountMinor, dispute.currencyCode, locale),
          })}
        </AdminRow>
      </div>
    </AdminCard>
  );
}

function DisputeDecision({ dispute, locale }: { dispute: Dispute; locale: string | undefined }) {
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const [outcome, setOutcome] = useState<Outcome>("withinPolicy");
  const [amount, setAmount] = useState(minorToMajorInput(dispute.amountMinor));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<DecisionErrors>({});

  const refundMutation = useMutation(
    orpc.payments.refundPayment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.payments.key() });
      },
    }),
  );

  const save = async () => {
    const nextErrors = validateDecision(outcome, amount, reason);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      if (outcome !== "stillOpen" && dispute.linkedId) {
        await refundMutation.mutateAsync({
          paymentId: dispute.linkedId,
          refundAmountMinor: parseMajorToMinor(amount) ?? undefined,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        });
      }
      await goTo("SCR-ADM-23");
    } catch {
      // The mutation error is shown in the alert at the end of the page.
    }
  };

  const disputeRef = shortId(dispute.id);
  return (
    <DisputePage
      actions={
        <>
          <AdminLink screen="SCR-ADM-23" variant="secondary">
            {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={refundMutation.isPending}
            onClick={() => void save()}
          >
            {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcome")}
          </AdminButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <PartiesCard dispute={dispute} locale={locale} />
          <AdminCard
            title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcome")}
          >
            <AdminRadioGroup
              legend={
                <span className="sr-only">
                  {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcome")}
                </span>
              }
              name="dispute-outcome"
              value={outcome}
              options={outcomeOptions()}
              onValueChange={(value) => setOutcome(value as Outcome)}
            />
          </AdminCard>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard
            title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refund")}
          >
            <AdminInput
              label={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundAmount")}
              inputMode="decimal"
              value={amount}
              disabled={outcome === "stillOpen"}
              aria-invalid={Boolean(errors.amount)}
              help={errors.amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="te-caption">
              {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.linkedTo", {
                dispute: disputeRef,
                booking: dispute.reference,
              })}
            </span>
            {outcome !== "stillOpen" ? (
              <AdminBadge tone="info" icon={false}>
                {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundPending")}
              </AdminBadge>
            ) : null}
          </AdminCard>
          <AdminCard>
            <AdminTextarea
              label={
                <span className="te-h3">
                  {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reason")}
                </span>
              }
              rows={4}
              placeholder={t(
                "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonPlaceholder",
              )}
              value={reason}
              aria-invalid={Boolean(errors.reason)}
              help={errors.reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <span className="te-caption">
              {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.auditNote")}
            </span>
          </AdminCard>
          <AdminAlert tone="warning">
            {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicyRule")}
          </AdminAlert>
          {refundMutation.isError ? (
            <AdminAlert
              tone="danger"
              title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveFailed")}
            >
              {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveFailedBody")}
            </AdminAlert>
          ) : null}
        </div>
      </div>
    </DisputePage>
  );
}

function DisputePage({ actions, children }: { actions?: ReactNode; children: ReactNode }) {
  return (
    <AdminPage
      title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.title")}
      description={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.description")}
      actions={actions}
    >
      {children}
    </AdminPage>
  );
}

export function DisputeDetailAndRefundDecision() {
  const { status: authStatus, locale } = useAuth();
  const disputeId = useAdminParam("disputeId", getSelectedAdminDisputeId);
  const exceptionsQuery = useQuery({
    ...orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
    enabled: authStatus === "authenticated",
  });

  const source = exceptionsQuery.data?.find((item) => item.id === disputeId);
  const dispute = source ? toDispute(source) : null;

  if (dispute) return <DisputeDecision key={dispute.id} dispute={dispute} locale={locale} />;
  return (
    <DisputePage>
      <AdminQueryState
        query={exceptionsQuery}
        loadingLabel={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.loading")}
      >
        <AdminCard>
          <AdminEmpty
            title={t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.notFoundTitle")}
            description={t(
              "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.notFoundBody",
            )}
          />
          <AdminLink screen="SCR-ADM-23" variant="secondary" className="self-start">
            {t("screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.backToDisputes")}
          </AdminLink>
        </AdminCard>
      </AdminQueryState>
    </DisputePage>
  );
}
