// SCR-SHR-13 Role and organization switcher on its catalog page. The account menu or a shell can
// mount `RoleSwitcher` directly.
import { useNavigate } from "@tanstack/react-router";

import { RoleSwitcher } from "./role-switcher";

export function ScrShr13RoleAndOrganizationSwitcher() {
  const navigate = useNavigate();
  return <RoleSwitcher onClose={() => void navigate({ to: "/" })} />;
}
