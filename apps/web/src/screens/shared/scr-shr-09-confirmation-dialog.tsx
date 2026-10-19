// SCR-SHR-09 Confirmation dialog on its catalog page, with the removal example from the artboard.
// Screens that remove or cancel something mount `ConfirmationDialog` with their own copy.
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";

import { ConfirmationDialog } from "./confirmation-dialog";

export function ScrShr09ConfirmationDialog() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const close = () => void navigate({ to: "/" });
  return (
    <ConfirmationDialog
      title={t("screen.shared.confirmation.exampleTitle")}
      body={t("screen.shared.confirmation.exampleBody")}
      confirmLabel={t("screen.shared.confirmation.exampleConfirm")}
      reasonRequired
      onConfirm={close}
      onCancel={close}
    />
  );
}
