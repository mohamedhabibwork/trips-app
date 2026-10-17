import { cn } from "@trips-app/ui/lib/utils";

export interface TeToastProps {
  message: string;
  title?: string;
  /** Called by the close button. The toast has no timers; the caller removes it. */
  onClose: () => void;
  closeLabel?: string;
  className?: string;
}

/** Presentational only. Bottom-end solid card; uses surface-inverse (navy in light, cream in dark). */
export function TeToast({
  message,
  title,
  onClose,
  closeLabel = "Dismiss",
  className,
}: TeToastProps) {
  return (
    <div role="status" className={cn("te-toast", className)}>
      <div className="te-toast__content">
        {title ? <p className="te-toast__title">{title}</p> : null}
        <p className="te-toast__message">{message}</p>
      </div>
      <button type="button" className="te-toast__close" aria-label={closeLabel} onClick={onClose}>
        <svg
          className="te-toast__close-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
