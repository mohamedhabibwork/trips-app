import { cn } from "@trips-app/ui/lib/utils";
import type { ComponentProps } from "react";

import { TE_ICON_NAMES, TE_ICON_PATHS, type TeIconName } from "./te-icon-paths";

export { TE_ICON_NAMES, type TeIconName };

export interface TeIconProps extends Omit<ComponentProps<"svg">, "name"> {
  name: TeIconName;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  /** Mirror the icon in RTL (directional icons such as arrows). */
  flipInRtl?: boolean;
}

export function TeIcon({ name, label, flipInRtl = false, className, ...props }: TeIconProps) {
  const isLabelled = label !== undefined && label.length > 0;

  return (
    <svg
      {...props}
      className={cn("te-icon", flipInRtl && "te-icon--flip-rtl", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={isLabelled ? "img" : undefined}
      aria-label={isLabelled ? label : undefined}
      aria-hidden={isLabelled ? undefined : true}
      focusable="false"
    >
      <path d={TE_ICON_PATHS[name]} />
    </svg>
  );
}
