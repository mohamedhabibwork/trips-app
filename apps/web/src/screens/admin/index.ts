import type { ScreenEntry } from "@/screens/types";
import { ADMIN_SCREENS_PART_1 } from "./entries-part-1";
import { ADMIN_SCREENS_PART_2 } from "./entries-part-2";

// Admin console screens in spec order: SCR-ADM-01 to SCR-ADM-33.
export const ADMIN_SCREENS: readonly ScreenEntry[] = [
  ...ADMIN_SCREENS_PART_1,
  ...ADMIN_SCREENS_PART_2,
];
