// Per-page SEO metadata: every file route's `head` delegates here, so title, description,
// Open Graph, the canonical URL and the index/noindex decision are consistent across the app.
//
// Indexing rule: only genuinely public pages are indexed. Every dashboard page
// (organization / admin / signed-in shared screens) carries `noindex` — it renders per-session
// data behind auth that must never appear in a search index.
import { interpolate, t } from "@trips-app/i18n";

import { findScreenById } from "@/screens/registry";

import { webRouteById } from "./web-routes";

// Absolute origin used for canonical URLs and og:url. Deployment-provided; when unset
// (local dev) the canonical link and og:url are simply omitted rather than pointing at a lie.
const SITE_URL = (
  (import.meta.env as Record<string, string | undefined>).VITE_PUBLIC_SITE_URL ?? ""
).replace(/\/+$/, "");

// Screens whose page deserves real marketing copy instead of the title-based template
// (the pages a search engine can actually see).
const DESCRIPTION_KEYS: Readonly<Record<string, string>> = {
  "SCR-PUB-01": "route.seo.landing.description",
  "SCR-TRV-01": "route.seo.tripBrowse.description",
  "SCR-TRV-02": "route.seo.tripDetail.description",
  "SCR-TRV-17": "route.seo.sharedAlbum.description",
  "SCR-TRV-21": "route.seo.becomeSupplier.description",
  "SCR-PUB-14": "route.seo.signIn.description",
  "SCR-PUB-15": "route.seo.signUp.description",
};

interface PageHeadContext {
  params: Record<string, string | undefined>;
}

interface PageHeadResult {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
}

/**
 * The `head` of a screen's file route, keyed by screen ID. Titles and descriptions come from the
 * i18n tables (so the metadata follows the active locale), the canonical path comes from the
 * screen's web route with `$params` filled in, and dashboard pages are marked `noindex`.
 */
export function pageHead(screenId: string) {
  return ({ params }: PageHeadContext): PageHeadResult => {
    const route = webRouteById(screenId);
    const screen = findScreenById(screenId);

    const screenTitle = screen ? t(screen.titleKey) : t("route.root.tripsEnjoy");
    const brand = t("route.root.tripsEnjoy");
    const title = route ? `${screenTitle} | ${brand}` : brand;

    const descriptionKey = DESCRIPTION_KEYS[screenId];
    const description = descriptionKey
      ? t(descriptionKey)
      : interpolate(t("route.seo.descriptionTemplate"), { title: screenTitle });

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      // The browser tab and the crawler get the same title; social scrapers get Open Graph.
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: brand },
    ];

    if (route && (route.area !== "public" || route.signedIn === true)) {
      meta.push({ name: "robots", content: "noindex, nofollow" });
    }

    const path = absolutePath(route?.path, params);
    if (path) meta.push({ property: "og:url", content: path });

    const links: Array<Record<string, string>> = [];
    if (path) links.push({ rel: "canonical", href: path });

    return { meta, links };
  };
}

/** Fills `$name` segments of a screen's path pattern from the route's params. */
function absolutePath(
  pattern: string | undefined,
  params: Record<string, string | undefined>,
): string | undefined {
  if (!pattern || !SITE_URL) return undefined;
  const path = pattern.replace(/\$([A-Za-z0-9]+)/g, (_match, name: string) => params[name] ?? "");
  return `${SITE_URL}${path}`;
}
