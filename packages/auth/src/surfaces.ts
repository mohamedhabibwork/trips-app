// Role → surface rules (A1/A2: UX only; the server re-checks everything) and surface routing.
import { SIGN_IN_PATHS, SURFACE_IDS, SURFACE_PLATFORMS } from "./conventions/index";
import type { ClientSurface, SurfaceId } from "./types";

/** Mirrors `ROLE_AUTH_DEFAULTS[role].allowedSurfaces` in packages/domain, expressed as UI surfaces. */
const ROLE_SURFACES: Readonly<Record<string, readonly SurfaceId[]>> = {
  traveler: ["traveler"],
  parent: ["traveler"],
  platform_driver: ["driver"],
  org_driver: ["driver"],
  platform_photographer: ["photographer", "studio"],
  org_photographer: ["photographer", "studio"],
  organization_owner: ["business"],
  organization_employee: ["business"],
  moderator: ["crew", "moderator"],
  admin: ["admin"],
};

/** Admin sub-roles that exist in `ADMIN_SUB_ROLE_CATALOG`; anything else is a tampered token. */
const ADMIN_SUB_ROLES: readonly string[] = ["super_admin", "operations", "finance"];

/** The surfaces a role may open. Unknown roles get none (fail closed). */
export function allowedSurfacesForRole(role: string): readonly SurfaceId[] {
  return ROLE_SURFACES[role] ?? [];
}

/**
 * Whether the client should render `surface` for this actor.
 *
 * `adminSubRole` is used only to reject a token whose sub-role is not one the platform defines; it
 * never widens access. `/admin` data calls are re-authorised server-side (`requireAdminSubRoles`).
 */
export function canAccessSurface(
  role: string,
  adminSubRole: string | null,
  surface: SurfaceId,
): boolean {
  if (!SURFACE_IDS.includes(surface)) return false;
  const surfaces = allowedSurfacesForRole(role);
  if (!surfaces.includes(surface)) return false;
  if (surface === "admin") {
    if (adminSubRole !== null && !ADMIN_SUB_ROLES.includes(adminSubRole)) return false;
  }
  return true;
}

/** Where a role lands after signing in. Falls back to the public home page. */
export function homePathForRole(role: string, surface: SurfaceId): string {
  // An unknown surface is a programming error; the public home page is always safe.
  if (!SURFACE_IDS.includes(surface)) return "/";
  switch (role) {
    case "admin":
      return "/admin";
    case "organization_owner":
    case "organization_employee":
      return "/business";
    case "moderator":
      return "/crew";
    case "platform_photographer":
    case "org_photographer":
      return "/studio";
    case "traveler":
    case "parent":
    case "platform_driver":
    case "org_driver":
      return "/";
    default:
      return "/";
  }
}

/** The `signIn.surface` value the web client sends for a role. */
export function surfaceForRole(role: string): ClientSurface {
  return role === "moderator" ? "pwa" : "web";
}

/** The sign-in route a surface owns — the guard's redirect target (correction 6). */
export function signInPathForSurface(surface: SurfaceId): string {
  return SIGN_IN_PATHS[surface] ?? SIGN_IN_PATHS.traveler;
}

/** The platform surface a UI surface belongs to. */
export function platformForSurface(surface: SurfaceId): ClientSurface {
  return SURFACE_PLATFORMS[surface] ?? "web";
}

/** Human-readable surface name used only for the i18n key `auth.role.*`/`auth.forbidden.*` params. */
export function surfaceMessageKey(surface: SurfaceId): string {
  switch (surface) {
    case "business":
      return "auth.staff.title";
    case "admin":
      return "auth.admin.title";
    case "crew":
      return "auth.crew.title";
    case "studio":
      return "auth.signIn.otherSurfaces";
    case "driver":
      return "auth.signUp.roleDriver";
    case "photographer":
      return "auth.signUp.rolePhotographer";
    case "moderator":
      return "auth.role.moderator";
    case "traveler":
    default:
      return "auth.signIn.title";
  }
}
