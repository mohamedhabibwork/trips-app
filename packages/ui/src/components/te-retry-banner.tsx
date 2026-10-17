import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export interface TeRetryBannerProps {
  message: string;
  onRetry: () => void;
  /** True while a retry is in flight. Disables the button and swaps its label. */
  retrying?: boolean;
  retryLabel?: string;
  retryingLabel?: string;
  className?: string;
}

/** Connection that will recover on its own. Warning strip on web. */
export function TeRetryBanner({
  message,
  onRetry,
  retrying = false,
  retryLabel = "Retry",
  retryingLabel = "Retrying...",
  className,
}: TeRetryBannerProps) {
  return (
    <div role="status" className={cn("te-retry-banner", className)}>
      <TeIcon name="offline" />
      <p className="te-retry-banner__message">{message}</p>
      <TeButton variant="secondary" onClick={onRetry} disabled={retrying}>
        {retrying ? retryingLabel : retryLabel}
      </TeButton>
    </div>
  );
}
