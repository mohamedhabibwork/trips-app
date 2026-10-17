import { useState, type ReactNode } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDialog, type TeDialogTone } from "@trips-app/ui/components/te-dialog";
import { TeTextarea } from "@trips-app/ui/components/te-textarea";
import { AdminScreenLink, type AdminSlug } from "./admin-links";
import { AdminActions } from "./admin-shared";

const DEFAULT_REASON_MAX_LENGTH = 500;

export interface AdminDecisionFormProps {
  reasonLabel: string;
  reasonHelp: string;
  maxLength?: number;
  submitLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel: string;
  tone?: TeDialogTone;
  /** Extra checks that must pass before the decision can be confirmed. */
  extraValid?: boolean;
  /** Effect summary shown inside the confirmation dialog. */
  dialogEffect?: ReactNode;
  cancel: { slug: AdminSlug; label: string };
  onConfirm: () => void;
}

/**
 * A decision with a required reason. Submit opens a confirmation dialog, and
 * the confirm action stays disabled until the reason has text.
 */
export function AdminDecisionForm({
  reasonLabel,
  reasonHelp,
  maxLength = DEFAULT_REASON_MAX_LENGTH,
  submitLabel,
  dialogTitle,
  dialogDescription,
  confirmLabel,
  tone = "default",
  extraValid = true,
  dialogEffect,
  cancel,
  onConfirm,
}: AdminDecisionFormProps) {
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const canConfirm = reason.trim() !== "" && extraValid;

  return (
    <>
      <TeTextarea
        label={reasonLabel}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={maxLength}
        supportingText={reasonHelp}
        rows={4}
        required
      />
      <AdminActions>
        <AdminScreenLink slug={cancel.slug} variant="secondary">
          {cancel.label}
        </AdminScreenLink>
        <TeButton
          variant={tone === "danger" ? "destructive" : "primary"}
          disabled={!canConfirm}
          onClick={() => setDialogOpen(true)}
        >
          {submitLabel}
        </TeButton>
      </AdminActions>
      <TeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        tone={tone}
        primaryLabel={confirmLabel}
        onPrimary={() => {
          setDialogOpen(false);
          onConfirm();
        }}
        confirmDisabled={!canConfirm}
        secondaryLabel="Keep editing"
        onSecondary={() => setDialogOpen(false)}
      >
        {dialogEffect}
      </TeDialog>
    </>
  );
}
