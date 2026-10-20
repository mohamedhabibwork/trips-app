// Firebase Analytics for the web app (CON-08: child data is never used for advertising, so
// events carry only technical context — never PII, form values or tokens). Everything no-ops
// gracefully when the Firebase web config is missing or analytics is unsupported, because
// analytics must never break the app.

import { type Analytics, getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { initializeApp } from "firebase/app";

import { ENV } from "@/env.public";

const FIREBASE_CONFIG = {
  apiKey: ENV.VITE_FIREBASE_API_KEY,
  authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.VITE_FIREBASE_PROJECT_ID,
  storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.VITE_FIREBASE_APP_ID,
  measurementId: ENV.VITE_FIREBASE_MEASUREMENT_ID,
} as const;

const ACTION_LABEL_MAX_LENGTH = 100;

let analytics: Analytics | null = null;
let initialized = false;

const hasFirebaseConfig = () =>
  Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.appId && FIREBASE_CONFIG.measurementId);

/** Logs an event only when analytics is live; safe to call from anywhere, any time. */
export const trackEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!analytics) return;
  try {
    logEvent(analytics, name, params);
  } catch {
    // Analytics failures are never surfaced to users.
  }
};

// One delegated listener tracks every button/link press without touching each screen.
// Labels come from aria-label or visible text only — never input values.
function actionLabel(target: Element): string {
  const explicit = target.getAttribute("aria-label") ?? target.getAttribute("data-analytics");
  if (explicit) return explicit.slice(0, ACTION_LABEL_MAX_LENGTH);
  const text = (target.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, ACTION_LABEL_MAX_LENGTH);
}

function installActionListener(): void {
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLAnchorElement>(
        'button, a, [role="button"], [role="menuitem"], [role="tab"]',
      );
      if (!target || target.getAttribute("aria-disabled") === "true") return;
      trackEvent("action_click", {
        action_label: actionLabel(target),
        page_path: window.location.pathname,
        tag: target.tagName.toLowerCase(),
      });
    },
    { capture: true },
  );
}

/**
 * Browser-only, once. Returns false on the server (SSR), without config, or when the browser
 * does not support the measurement SDK. Imports are static, but nothing initializes before
 * this call.
 */
export const initAnalytics = async (): Promise<boolean> => {
  if (initialized) return Boolean(analytics);
  initialized = true;
  if (import.meta.env.SSR || !hasFirebaseConfig()) return false;
  try {
    if (!(await isSupported())) return false;
    analytics = getAnalytics(initializeApp({ ...FIREBASE_CONFIG }));
    installActionListener();
    return true;
  } catch (error) {
    console.warn("[analytics] initialization skipped:", error);
    return false;
  }
};
