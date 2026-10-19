// SCR-TRV-21 Supplier application entry: start a driver, photographer or organization application
// while keeping full traveler access (FR-TRV-06). Any pending application's status is shown.
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Notice, StatusPill } from "@/components/kit/controls";
import { orpc } from "@/utils/orpc";
import { ScreenLoading } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

const CARDS = [
  { key: "driver", to: "/sign-up/driver" },
  { key: "photographer", to: "/sign-up/photographer" },
  { key: "organization", to: "/sign-up/organization" },
] as const;

export function Trv21BecomeSupplier() {
  const { t } = useAuth();
  const navigate = useNavigate();

  const statusQuery = useQuery({
    ...orpc.onboarding.getApplicationStatus.queryOptions({ input: {} }),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const application = (
    statusQuery.data as
      | { applications?: readonly { applicationType?: string; status?: string }[] }
      | undefined
  )?.applications?.[0];
  const status = application?.status;

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.supplier.title")}</h1>
      <Notice tone="info">{t("screen.traveler.supplier.travelerUnchanged")}</Notice>

      {statusQuery.isPending ? (
        <ScreenLoading />
      ) : statusQuery.isError ? null : status ? (
        <div className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]">
          <StatusPill
            tone={status === "approved" ? "success" : status === "rejected" ? "danger" : "warning"}
          >
            {t(`screen.traveler.supplier.status.${status}`)}
          </StatusPill>
          <p className="m-0 text-sm text-[var(--te-ink-muted)]">
            {status === "pending"
              ? t("screen.traveler.supplier.pendingNote")
              : status === "rejected"
                ? t("screen.traveler.supplier.rejectedNote")
                : t("screen.traveler.supplier.approvedNote")}
          </p>
        </div>
      ) : (
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.traveler.supplier.noApplication")}
        </p>
      )}

      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
        {CARDS.map((card) => (
          <li
            key={card.key}
            className="flex flex-col gap-2 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)]"
          >
            <h2 className="m-0 text-lg font-bold">
              {t(`screen.traveler.supplier.card.${card.key}`)}
            </h2>
            <p className="m-0 text-sm text-[var(--te-ink-muted)]">
              {t(`screen.traveler.supplier.card.${card.key}Body`)}
            </p>
            <button
              type="button"
              className="mt-auto cursor-pointer self-start underline"
              onClick={() => void navigate({ to: card.to })}
            >
              {t("screen.traveler.supplier.apply")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
