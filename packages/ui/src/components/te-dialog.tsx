import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { useEffect, useId, useRef, type ReactNode } from "react";

export type TeDialogTone = "default" | "danger";

export interface TeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  /** Disables the primary action (for example until a typed confirmation matches). */
  confirmDisabled?: boolean;
  secondaryLabel: string;
  onSecondary: () => void;
  tone?: TeDialogTone;
  className?: string;
}

/**
 * Modal confirmation on the native dialog element. Escape closes it and reports
 * the change through onOpenChange. The primary action takes focus when it opens.
 */
export function TeDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  primaryLabel,
  onPrimary,
  confirmDisabled = false,
  secondaryLabel,
  onSecondary,
  tone = "default",
  className,
}: TeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      primaryRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    if (open) onOpenChange(false);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn("te-dialog", tone === "danger" && "te-dialog--danger", className)}
    >
      <div className="te-dialog__body">
        <h2 id={titleId} className="te-dialog__title">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="te-dialog__description">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      <div className="te-dialog__actions">
        <TeButton variant="secondary" onClick={onSecondary}>
          {secondaryLabel}
        </TeButton>
        <TeButton
          ref={primaryRef}
          className="te-dialog__primary"
          disabled={confirmDisabled}
          aria-disabled={confirmDisabled || undefined}
          onClick={onPrimary}
        >
          {primaryLabel}
        </TeButton>
      </div>
    </dialog>
  );
}
