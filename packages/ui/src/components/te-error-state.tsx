import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { t } from "@trips-app/i18n";

export const TE_ERROR_KINDS = [
  "not-found",
  "server",
  "offline",
  "forbidden",
  "unauthorized",
  "unavailable",
] as const;
export const TE_ERROR_PLATFORMS = ["web", "mobile"] as const;

export type TeErrorKind = (typeof TE_ERROR_KINDS)[number];
export type TeErrorPlatform = (typeof TE_ERROR_PLATFORMS)[number];

export interface TeErrorCopy {
  title: string;
  description: string;
  actionLabel: string;
  icon: TeIconName;
}

/** English defaults. Every field can be overridden through props. Never mentions stack traces. */
const ERROR_COPY = (): Record<TeErrorKind, TeErrorCopy> => ({
  "not-found": {
    title: t("ui.teErrorState.weCanTFindThis"),
    description: t("ui.teErrorState.theLinkMayBeOut"),
    actionLabel: t("ui.teErrorState.goToMyTrips"),
    icon: "alert",
  },
  server: {
    title: t("ui.teErrorState.somethingWentWrongOnOur"),
    description: t("ui.teErrorState.yourBookingAndPaymentsAre"),
    actionLabel: t("ui.teErrorState.tryAgain"),
    icon: "alert",
  },
  offline: {
    title: t("ui.teErrorState.youReOffline"),
    description: t("ui.teErrorState.checkYourInternetConnectionThen"),
    actionLabel: t("ui.teErrorState.tryAgainActionLabel"),
    icon: "offline",
  },
  forbidden: {
    title: t("ui.teErrorState.youDonTHaveAccess"),
    description: t("ui.teErrorState.askTheTripOrganizerFor"),
    actionLabel: t("ui.teErrorState.signIn"),
    icon: "lock",
  },
  unauthorized: {
    title: t("ui.teErrorState.signInToContinue"),
    description: t("ui.teErrorState.yourSessionHasEndedSign"),
    actionLabel: t("ui.teErrorState.signInActionLabel"),
    icon: "lock",
  },
  unavailable: {
    title: t("ui.teErrorState.serviceTemporarilyUnavailable"),
    description: t("ui.teErrorState.weAreWorkingOnIt"),
    actionLabel: t("ui.teErrorState.tryAgain2"),
    icon: "alert",
  },
});

export function errorStateCopy(kind: TeErrorKind): TeErrorCopy {
  return ERROR_COPY()[kind];
}

/** Support reference IDs appear on server errors only. */
export function showsReferenceId(kind: TeErrorKind, referenceId: string | undefined): boolean {
  return kind === "server" && referenceId !== undefined && referenceId.length > 0;
}

export interface TeErrorStateProps {
  kind: TeErrorKind;
  /** mobile stacks the content and makes buttons full width. */
  platform?: TeErrorPlatform;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  referenceId?: string;
  referenceLabel?: string;
  className?: string;
}

export function TeErrorState({
  kind,
  platform = "web",
  title,
  description,
  actionLabel,
  onAction,
  referenceId,
  referenceLabel = "Reference ID",
  className,
}: TeErrorStateProps) {
  const copy = errorStateCopy(kind);

  return (
    <div
      role="alert"
      data-kind={kind}
      className={cn("te-error-state", platform === "mobile" && "te-error-state--mobile", className)}
    >
      <TeIcon name={copy.icon} className="te-error-state__icon" />
      <h2 className="te-h2 te-error-state__title">{title ?? copy.title}</h2>
      <p className="te-body te-error-state__description">{description ?? copy.description}</p>
      {showsReferenceId(kind, referenceId) ? (
        <p className="te-caption te-error-state__reference">
          {referenceLabel}: {referenceId}
        </p>
      ) : null}
      {onAction ? (
        <div className="te-error-state__actions">
          <TeButton variant="primary" size="lg" onClick={onAction}>
            {actionLabel ?? copy.actionLabel}
          </TeButton>
        </div>
      ) : null}
    </div>
  );
}
