// Shared studio vocabulary: the deal and album states and the pills that name them
// (docs/design/web/PhoWebDeals.dc.html, PhoWebAlbums.dc.html). Values come from
// NegotiationStatus (packages/domain) and TripPhotoAlbumStatus.
import { t } from "@trips-app/i18n";

import type { StudioTone } from "./studio-ui";

interface StatusMeta {
  tone: StudioTone;
  key: string;
}

const DEAL_STATUS_META: Readonly<Record<string, StatusMeta>> = {
  pending_supplier: { tone: "live", key: "pendingSupplier" },
  countered_by_supplier: { tone: "info", key: "counteredBySupplier" },
  countered_by_org: { tone: "warn", key: "counteredByOrg" },
  accepted: { tone: "ok", key: "accepted" },
  declined: { tone: "neu", key: "declined" },
  expired: { tone: "neu", key: "expired" },
  cancelled: { tone: "neu", key: "cancelled" },
};

const ALBUM_STATUS_META: Readonly<Record<string, StatusMeta>> = {
  draft: { tone: "warn", key: "draft" },
  published: { tone: "ok", key: "published" },
  archived: { tone: "neu", key: "archived" },
};

export function dealStatusMeta(status: string): StatusMeta {
  return DEAL_STATUS_META[status] ?? { tone: "neu", key: "unknown" };
}

export function dealStatusLabel(status: string): string {
  return t(`screen.studio.common.dealStatus.${dealStatusMeta(status).key}`);
}

export function albumStatusMeta(status: string): StatusMeta {
  return ALBUM_STATUS_META[status] ?? { tone: "neu", key: "unknown" };
}

export function albumStatusLabel(status: string): string {
  return t(`screen.studio.common.albumStatus.${albumStatusMeta(status).key}`);
}

/** Deal requests still waiting for a move from either side. */
export const OPEN_DEAL_STATUSES: readonly string[] = [
  "pending_supplier",
  "countered_by_supplier",
  "countered_by_org",
];

/** The photographer's turn: the organization sent the latest offer. */
export const PHOTOGRAPHER_TURN_STATUSES: readonly string[] = [
  "pending_supplier",
  "countered_by_org",
];

/** `pick(locale, ar, en)` — the reader's language, else the other one. */
export function pick(
  locale: string,
  ar: string | null | undefined,
  en: string | null | undefined,
): string {
  const a = ar ?? "";
  const e = en ?? "";
  return (locale === "ar" ? a || e : e || a) || "";
}

/** Minor units (piasters) → a plain "1,234.56" figure for the EGP-suffixed inputs. */
export function minorToAmountText(minor: number): string {
  return (minor / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** "1,234.56" → minor units, or null when the text is not a positive amount. */
export function amountTextToMinor(text: string): number | null {
  const trimmed = text.replace(/[,\s]/g, "");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(trimmed)) return null;
  const minor = Math.round(Number(trimmed) * 100);
  return minor >= 100 ? minor : null;
}
