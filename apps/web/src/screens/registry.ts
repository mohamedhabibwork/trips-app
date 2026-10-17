import { ADMIN_SCREENS } from "./admin";
import { ORGANIZATION_SCREENS } from "./organization";
import { PUBLIC_SCREENS } from "./public";
import { SHARED_SCREENS } from "./shared";
import type { ScreenEntry, ScreenSurface } from "./types";

// Every generated screen across the web surfaces, in spec order per surface.
export const ALL_SCREENS: readonly ScreenEntry[] = [
  ...PUBLIC_SCREENS,
  ...SHARED_SCREENS,
  ...ORGANIZATION_SCREENS,
  ...ADMIN_SCREENS,
];

export const SURFACE_LABELS: Readonly<Record<ScreenSurface, string>> = {
  public: "Public and sign-in",
  shared: "Shared states",
  organization: "Organization dashboard",
  admin: "Admin console",
};

export function screenPath(screen: Pick<ScreenEntry, "surface" | "slug">): string {
  return `/screens/${screen.surface}/${screen.slug}`;
}

export function findScreen(surface: string, slug: string): ScreenEntry | undefined {
  return ALL_SCREENS.find((screen) => screen.surface === surface && screen.slug === slug);
}

// Old-style IDs such as SCR-ORG-04 still resolve, so existing links keep working.
export function findScreenById(id: string): ScreenEntry | undefined {
  return ALL_SCREENS.find((screen) => screen.id === id);
}
