import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export interface TeOfflineBannerProps {
  /** Says the connection is lost and which actions still work. */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Connection lost. Warning styling, announced as a status message. */
export function TeOfflineBanner({
  message,
  onRetry,
  retryLabel = "Retry",
  className,
}: TeOfflineBannerProps) {
  return (
    <div role="status" className={cn("te-offline-banner", className)}>
      <TeIcon name="offline" />
      <p className="te-offline-banner__message">{message}</p>
      {onRetry ? (
        <TeButton variant="secondary" onClick={onRetry}>
          {retryLabel}
        </TeButton>
      ) : null}
    </div>
  );
}
