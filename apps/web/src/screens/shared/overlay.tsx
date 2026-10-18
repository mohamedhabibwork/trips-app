// Dimmed overlay for the shared dialogs (SCR-SHR-01, 09, 13). `sheet` rises from the bottom on a
// phone and becomes a centred card on wider screens; `dialog` is a centred card everywhere.
// Escape and the backdrop close it; focus moves into it on open and back on close.
import { cn } from "@trips-app/ui/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE = "textarea, input, select, button, [href], [tabindex]:not([tabindex='-1'])";

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
  placement?: "sheet" | "dialog";
  role?: "dialog" | "alertdialog";
}

export function Overlay({
  children,
  onClose,
  labelledBy,
  placement = "dialog",
  role = "dialog",
}: OverlayProps) {
  const panel = useRef<HTMLElement>(null);
  // Callers pass a fresh callback each render; the listener reads the latest one.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--te-glass-dim)]"
        onClick={() => closeRef.current()}
      />
      <section
        ref={panel}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative flex w-full flex-col gap-3.5 bg-[var(--te-surface-raised)] text-[var(--te-ink)] shadow-[var(--te-card-shadow)] md:max-w-[480px] md:rounded-[var(--te-radius-lg)]",
          placement === "sheet"
            ? "rounded-t-[var(--te-radius-lg)] px-4 pt-5 pb-6 md:p-7"
            : "mx-5 mb-auto mt-[22vh] max-w-[calc(100%-40px)] rounded-[var(--te-radius-lg)] p-6 md:m-0",
        )}
      >
        {children}
      </section>
    </div>
  );
}
