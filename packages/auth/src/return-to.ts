// E3: `returnTo` is honoured only for same-origin relative paths (PRD §7.5).
const FALLBACK_PATH = "/";

/**
 * Sanitises a `returnTo` query value.
 *
 * Accepts only paths that start with a single `/` and stay on this origin:
 *   "/business", "/business?x=1", "/trip/42#seat"  → kept
 *   "//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "", null → fallback
 */
export function sanitizeReturnTo(
  raw: string | null | undefined,
  fallback: string = FALLBACK_PATH,
): string {
  const safeFallback = isSafePath(fallback) ? fallback : FALLBACK_PATH;
  if (typeof raw !== "string") return safeFallback;

  const value = raw.trim();
  if (value.length === 0) return safeFallback;
  if (!isSafePath(value)) return safeFallback;
  return value;
}

/** True when `value` is a same-origin absolute path with no protocol and no host. */
export function isSafePath(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  // Protocol-relative ("//host") and backslash variants are cross-origin in every browser.
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  if (value.includes("\\")) return false;
  // Control characters can be used to smuggle a second header/line in some clients.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  // A path containing "://" is not a path.
  if (value.includes("://")) return false;
  return true;
}
