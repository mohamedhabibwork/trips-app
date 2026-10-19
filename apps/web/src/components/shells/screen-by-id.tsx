// Renders the registered screen a URL maps to. Lives apart from shell-content so the screen
// registry (which pulls in every screen component) stays out of the shells' import cycle.
import { useAuth } from "@/auth/auth-context";
import { surfaceForScreenId } from "@/navigation/web-routes";
import { findScreenById } from "@/screens/registry";

interface ScreenByIdProps {
  screenId: string;
}

/** Renders a registered screen, or a plain notice while its component does not exist yet. */
export function ScreenById({ screenId }: ScreenByIdProps) {
  const { t } = useAuth();
  const entry = findScreenById(screenId);
  if (!entry || entry.surface !== surfaceForScreenId(screenId)) {
    return <p className="te-body">{t("component.shell.screenNotBuilt")}</p>;
  }
  const Screen = entry.component;
  return <Screen />;
}
