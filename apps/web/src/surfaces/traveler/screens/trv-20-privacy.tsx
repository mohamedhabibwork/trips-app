// SCR-TRV-20 Privacy: request a copy of personal data or deletion of the account. Both are
// decision points (SCR-SHR-09): a confirm step is required before the request is submitted.
// Deletion explains the 30-day grace, the restore-on-sign-in rule and the 5-year trip records.
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill, TextAreaField } from "@/components/kit/controls";
import { client } from "@/utils/orpc";
import { serverRpc } from "@/utils/server-rpc";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";
import { toast } from "sonner";

type RequestKind = "data_export" | "account_deletion";

export function Trv20Privacy() {
  const { t } = useAuth();
  const [pending, setPending] = useState<RequestKind | null>(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState<RequestKind | null>(null);

  const request = useMutation({
    mutationFn: (requestType: RequestKind) =>
      serverRpc<Awaited<ReturnType<typeof client.traveler.requestPrivacyAction>>>(
        "traveler/requestPrivacyAction",
        {
          requestType,
          reason: reason.trim() || null,
          confirmedUnderstood: true,
        },
      ),
    onSuccess: (_result, requestType) => {
      setSubmitted(requestType);
      setPending(null);
      setReason("");
      toast.success(t("screen.traveler.privacy.submitted"));
    },
    onError: () => toast.error(t("screen.traveler.privacy.failed")),
  });

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.privacy.title")}</h1>

      {submitted === "data_export" ? (
        <Notice tone="success" strong>
          {t("screen.traveler.privacy.copySubmitted")}
        </Notice>
      ) : null}
      {submitted === "account_deletion" ? (
        <Notice tone="warning" strong>
          {t("screen.traveler.privacy.deletionSubmitted")}
        </Notice>
      ) : null}

      <section className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]">
        <h2 className="m-0 text-lg font-semibold">{t("screen.traveler.privacy.copyTitle")}</h2>
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.traveler.privacy.copyBody")}
        </p>
        {pending === "data_export" ? (
          <div className="flex flex-col gap-2">
            <TextAreaField
              label={t("screen.traveler.privacy.reasonLabel")}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <Button
              block
              disabled={request.isPending}
              onClick={() => request.mutate("data_export")}
            >
              {t("screen.traveler.privacy.confirmCopy")}
            </Button>
            <Button tone="outline" block onClick={() => setPending(null)}>
              {t("screen.traveler.common.cancel")}
            </Button>
          </div>
        ) : (
          <Button tone="outline" onClick={() => setPending("data_export")}>
            {t("screen.traveler.privacy.requestCopy")}
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-danger-soft)] p-4">
        <StatusPill tone="danger" icon="alert">
          {t("screen.traveler.privacy.deletionTitle")}
        </StatusPill>
        <p className="m-0 text-sm">{t("screen.traveler.privacy.deletionBody")}</p>
        <ul className="m-0 flex list-disc flex-col gap-1 ps-5 text-sm">
          <li>{t("screen.traveler.privacy.deletionGrace")}</li>
          <li>{t("screen.traveler.privacy.deletionRestore")}</li>
          <li>{t("screen.traveler.privacy.deletionBookings")}</li>
          <li>{t("screen.traveler.privacy.deletionRecords")}</li>
        </ul>
        {pending === "account_deletion" ? (
          <div className="flex flex-col gap-2">
            <Notice tone="danger" strong>
              {t("screen.traveler.privacy.deletionConfirmNote")}
            </Notice>
            <Button
              tone="danger"
              block
              disabled={request.isPending}
              onClick={() => request.mutate("account_deletion")}
            >
              {t("screen.traveler.privacy.confirmDeletion")}
            </Button>
            <Button tone="outline" block onClick={() => setPending(null)}>
              {t("screen.traveler.common.cancel")}
            </Button>
          </div>
        ) : (
          <Button tone="danger" onClick={() => setPending("account_deletion")}>
            {t("screen.traveler.privacy.requestDeletion")}
          </Button>
        )}
      </section>
    </div>
  );
}
