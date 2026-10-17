import type { ComponentType } from "react";

export type ScreenSurface = "organization" | "admin" | "public" | "shared";

// One generated screen. Screens take no props and render placeholder data from docs/screens.
export interface ScreenEntry {
  id: string;
  slug: string;
  title: string;
  surface: ScreenSurface;
  component: ComponentType;
}
