import { cn } from "@trips-app/ui/lib/utils";
import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";

export const TE_ROLES = [
  "traveler",
  "parent",
  "driver",
  "photographer",
  "organization",
  "admin",
] as const;

export type TeRole = (typeof TE_ROLES)[number];

/**
 * Role to badge tone. Chosen to echo the role app icons:
 * traveler = orange ground -> accent (coral); parent = navy trust base -> info;
 * driver and admin = navy ground -> neutral; photographer = amber symbol -> highlight;
 * organization = navy, solid white -> info (the brand file pairs it with info-soft).
 * Tones never carry status meaning here, so success, warning and danger are not used.
 */
const ROLE_TONES: Record<TeRole, TeBadgeTone> = {
  traveler: "accent",
  parent: "info",
  driver: "neutral",
  photographer: "highlight",
  organization: "info",
  admin: "neutral",
};

const ROLE_LABELS: Record<TeRole, string> = {
  traveler: "Traveler",
  parent: "Parent",
  driver: "Driver",
  photographer: "Photographer",
  organization: "Organization",
  admin: "Admin",
};

export function roleToTone(role: TeRole): TeBadgeTone {
  return ROLE_TONES[role];
}

export function roleLabel(role: TeRole): string {
  return ROLE_LABELS[role];
}

export interface TeRoleBadgeProps {
  role: TeRole;
  /** Overrides the English default label. */
  label?: string;
  className?: string;
}

export function TeRoleBadge({ role, label, className }: TeRoleBadgeProps) {
  return (
    <TeBadge tone={roleToTone(role)} data-role={role} className={cn("te-role-badge", className)}>
      {label ?? roleLabel(role)}
    </TeBadge>
  );
}
