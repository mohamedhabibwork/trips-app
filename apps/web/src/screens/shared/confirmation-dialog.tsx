// The confirmation dialog from SCR-SHR-09: names the change and its effect before it is saved. A
// required reason keeps the confirm button disabled until it is written.
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, TextAreaField, type ButtonTone } from "@/components/kit/controls";

import { Overlay } from "./overlay";

interface ConfirmationDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  /** Ask for a reason; the change is recorded with it. */
  reasonRequired?: boolean;
  /** `danger` for removals and cancellations. */
  tone?: Extract<ButtonTone, "primary" | "danger">;
  busy?: boolean;
}

export function ConfirmationDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  reasonRequired = false,
  tone = "danger",
  busy = false,
}: ConfirmationDialogProps) {
  const { t } = useAuth();
  const [reason, setReason] = useState("");
  const blocked = busy || (reasonRequired && reason.trim().length === 0);

  return (
    <Overlay role="alertdialog" labelledBy="confirmation-title" onClose={onCancel}>
      <h2 id="confirmation-title" className="m-0 text-[22px] leading-[30px] font-bold">
        {title}
      </h2>
      <p className="m-0 text-[15px] leading-[22px] text-[var(--te-ink-muted)]">{body}</p>
      {reasonRequired ? (
        <TextAreaField
          name="reason"
          rows={3}
          label={t("screen.shared.confirmation.reason")}
          placeholder={t("screen.shared.confirmation.reasonPlaceholder")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="resize-none py-2.5"
          required
        />
      ) : null}
      <Button tone={tone} disabled={blocked} onClick={() => onConfirm(reason.trim())}>
        {busy ? t("auth.common.submitting") : confirmLabel}
      </Button>
      <Button tone="outline" disabled={busy} onClick={onCancel}>
        {t("screen.shared.confirmation.cancel")}
      </Button>
    </Overlay>
  );
}
