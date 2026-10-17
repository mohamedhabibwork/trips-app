// Header account menu: who you are, your role, sign out, and (P1) sign out of all devices.
import { Link } from "@tanstack/react-router";
import { Button } from "@trips-app/ui/components/button";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { useState } from "react";

import { useAuth } from "../auth-context";

export function AccountMenu() {
  const { actor, t, signOut, status } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  if (status !== "authenticated" || !actor) {
    return (
      <Link to="/sign-in" className="text-xs font-medium underline-offset-4 hover:underline">
        {t("auth.header.signIn")}
      </Link>
    );
  }

  const roleLabel = t(`auth.role.${actor.activeRole}`);
  const organization = actor.activeTenantId ?? t("auth.account.none");

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("auth.account.menu")}
        onClick={() => setOpen((value) => !value)}
      >
        {roleLabel}
      </Button>

      {open ? (
        <div
          role="menu"
          className="bg-popover text-popover-foreground absolute end-0 z-40 mt-1 w-56 border p-2 shadow-md"
        >
          <div className="grid gap-0.5 px-1 pb-2">
            <span className="text-muted-foreground text-[10px] uppercase">
              {t("auth.account.signedInAs")}
            </span>
            <span className="text-xs font-medium">{actor.accountId}</span>
            <span className="text-muted-foreground text-[11px]">
              {t("auth.account.role", { role: roleLabel })}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {t("auth.account.organization", { organization })}
            </span>
          </div>

          <div className="border-t pt-1">
            <button
              type="button"
              role="menuitem"
              disabled
              className="text-muted-foreground w-full px-1 py-1 text-start text-xs opacity-60"
            >
              {t("auth.account.settings")} · {t("auth.account.comingSoon")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="hover:bg-muted w-full px-1 py-1 text-start text-xs"
              onClick={() => {
                setOpen(false);
                void signOut(false);
              }}
            >
              {t("auth.account.signOut")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="hover:bg-muted w-full px-1 py-1 text-start text-xs"
              onClick={() => {
                setOpen(false);
                setConfirmAll(true);
              }}
            >
              {t("auth.account.signOutAll")}
            </button>
          </div>
        </div>
      ) : null}

      <TeDialog
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title={t("auth.account.signOutAllConfirmTitle")}
        description={t("auth.account.signOutAllConfirmBody")}
        primaryLabel={t("auth.account.signOutAllConfirm")}
        onPrimary={() => {
          setConfirmAll(false);
          void signOut(true);
        }}
        secondaryLabel={t("auth.common.cancel")}
        onSecondary={() => setConfirmAll(false)}
        tone="danger"
      />
    </div>
  );
}
