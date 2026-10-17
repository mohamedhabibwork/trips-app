import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";

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
const ERROR_COPY: Record<TeErrorKind, TeErrorCopy> = {
  "not-found": {
    title: "We can't find this page",
    description:
      "The link may be out of date or the page may have moved. Check the address, or go back to your trips.",
    actionLabel: "Go to my trips",
    icon: "alert",
  },
  server: {
    title: "Something went wrong on our side",
    description: "Your booking and payments are safe. Please try again in a few minutes.",
    actionLabel: "Try again",
    icon: "alert",
  },
  offline: {
    title: "You're offline",
    description: "Check your internet connection, then try again.",
    actionLabel: "Try again",
    icon: "offline",
  },
  forbidden: {
    title: "You don't have access to this page",
    description: "Ask the trip organizer for access, or sign in with the account that has it.",
    actionLabel: "Sign in",
    icon: "lock",
  },
  unauthorized: {
    title: "Sign in to continue",
    description: "Your session has ended. Sign in again to see this page.",
    actionLabel: "Sign in",
    icon: "lock",
  },
  unavailable: {
    title: "Service temporarily unavailable",
    description: "We are working on it. Try again in a few minutes.",
    actionLabel: "Try again",
    icon: "alert",
  },
};

export function errorStateCopy(kind: TeErrorKind): TeErrorCopy {
  return ERROR_COPY[kind];
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
