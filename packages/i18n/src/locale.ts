// Current-locale resolution and direction helpers (UI-01, UI-02).
//
// One place answers "which language is the app in right now?", so no component has to guess. The
// order is: an explicit choice made in this tab, then the persisted choice, then the document
// language, then the browser preference, then the product default. Every step is guarded, so the
// same module runs in the browser, in Node tests and on Workers.
//
// The host objects are reached through narrow structural types rather than `lib.dom`: this package
// builds for Workers, where `document` does not exist and must not be part of the type graph.
import type { Direction, Locale } from "./types";

/** Every locale the product ships. */
export const SUPPORTED_LOCALES = ["ar", "en"] as const satisfies readonly Locale[];

/** Arabic is the product default (PRD I2). */
export const DEFAULT_LOCALE: Locale = "ar";

/** Where a visitor's choice is remembered between visits. */
export const LOCALE_STORAGE_KEY = "trips.locale";

const LOCALE_CODES: readonly string[] = SUPPORTED_LOCALES;

/** The slice of `document` this module touches. */
interface DocumentLike {
  readonly documentElement: {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
  };
}

/** The slice of `Storage` this module touches. */
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The slice of `Navigator` this module touches. */
interface NavigatorLike {
  readonly languages?: readonly string[];
  readonly language?: string;
}

function hostDocument(): DocumentLike | null {
  return (globalThis as { document?: DocumentLike }).document ?? null;
}

function hostStorage(): StorageLike | null {
  try {
    return (globalThis as { localStorage?: StorageLike }).localStorage ?? null;
  } catch {
    // Some browsers throw on mere access when storage is disabled.
    return null;
  }
}

function hostNavigator(): NavigatorLike | null {
  return (globalThis as { navigator?: NavigatorLike }).navigator ?? null;
}

/** Whether a value is one of the supported locales. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALE_CODES.includes(value);
}

/**
 * Narrows a BCP 47 tag to a supported locale: `ar-EG` and `AR_eg` both become `ar`.
 * Returns `null` for anything the product does not ship.
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (typeof value !== "string") return null;
  const base = value.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  return isLocale(base) ? base : null;
}

/** The reading direction of a locale. */
export function directionOf(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

let override: Locale | null = null;

/**
 * A host-supplied source that wins over every other step, for hosts that know the locale per
 * request (a server reading the visitor's cookie) or per document. Returns `null` to fall through.
 */
let scopeResolver: (() => Locale | null) | null = null;

/**
 * Registers (or clears, with `null`) the host locale source. A server uses it to answer
 * `getLocale()` from the current request, so concurrent requests never share one module value.
 */
export function setLocaleResolver(resolver: (() => Locale | null) | null): void {
  scopeResolver = resolver;
}

function fromResolver(): Locale | null {
  try {
    return normalizeLocale(scopeResolver?.() ?? null);
  } catch {
    return null;
  }
}

const listeners = new Set<(locale: Locale) => void>();

function fromStorage(): Locale | null {
  try {
    return normalizeLocale(hostStorage()?.getItem(LOCALE_STORAGE_KEY));
  } catch {
    // Blocked or full storage (private mode, disabled cookies): fall through to the next source.
    return null;
  }
}

function fromDocument(): Locale | null {
  const document = hostDocument();
  return document ? normalizeLocale(document.documentElement.getAttribute("lang")) : null;
}

function fromNavigator(): Locale | null {
  // Only a real browser tab has a language preference worth honouring. Node, Bun and Workers all
  // expose a `navigator`, but its `language` is absent or meaningless there, so require `window`.
  if (!(globalThis as { window?: unknown }).window) return null;

  const navigator = hostNavigator();
  if (!navigator) return null;
  for (const tag of navigator.languages ?? []) {
    const locale = normalizeLocale(tag);
    if (locale) return locale;
  }
  return normalizeLocale(navigator.language);
}

/**
 * The locale in effect right now.
 *
 * Never throws: a missing `document`, `navigator` or storage simply falls through to the default,
 * so server rendering and unit tests get a stable answer.
 */
export function getLocale(): Locale {
  return (
    override ??
    fromResolver() ??
    fromStorage() ??
    fromDocument() ??
    fromNavigator() ??
    DEFAULT_LOCALE
  );
}

/**
 * Switches the app language: remembers the choice, mirrors it onto `<html lang dir>` so CSS and
 * screen readers follow, and notifies subscribers.
 */
export function setLocale(locale: Locale): void {
  const next = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  override = next;

  try {
    hostStorage()?.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // A blocked storage keeps the choice for this tab only.
  }

  const document = hostDocument();
  if (document) {
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", directionOf(next));
  }

  for (const listener of listeners) listener(next);
}

/** Forgets the in-tab choice, so `getLocale()` reads the persisted/browser preference again. */
export function resetLocale(): void {
  override = null;
}

/** Calls `listener` after every `setLocale`. Returns the unsubscribe function. */
export function subscribeLocale(listener: (locale: Locale) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
