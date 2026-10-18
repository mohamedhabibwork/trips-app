import type { ReactNode } from "react";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { ScreenLink } from "../../shared/screen-link";

interface AuthFrameProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Narrow single-column frame for sign-up, sign-in and account-state screens. Every frame links back to the start. */
export function AuthFrame({ title, description, actions, children }: AuthFrameProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ScreenLink surface="public" slug="landing">
          {t("screen.public.common.authFrame.backToTheStart")}
        </ScreenLink>
      </div>
      <TePageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
