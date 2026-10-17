import type { ScreenEntry } from "@/screens/types";

import { ORGANIZATION_SCREENS_PART_A } from "./entries-part-1";
import { ORGANIZATION_SCREENS_PART_B } from "./entries-part-2";

export const ORGANIZATION_SCREENS: readonly ScreenEntry[] = [
  ...ORGANIZATION_SCREENS_PART_A,
  ...ORGANIZATION_SCREENS_PART_B,
];
