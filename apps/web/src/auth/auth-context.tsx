// React bindings over the session controller (ARCHITECTURE §4.1).
//
// The controller is the module singleton from ./instance.ts: `useSyncExternalStore` gives every
// component the same snapshot, and the router guard reads the same object without hooks.
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  directionOf,
  getLocale as getCurrentLocale,
  setLocale as rememberLocale,
  t as translate,
} from "@trips-app/i18n";
import type {
  AuthActor,
  AuthLocale,
  AuthStatus,
  SessionRecord,
  SessionTokenPayload,
} from "@trips-app/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import { authController } from "./instance";
import type { SessionController, SessionSnapshot } from "./session-controller";

export interface AuthContextValue {
  status: AuthStatus;
  actor: AuthActor | null;
  record: SessionRecord | null;
  controller: SessionController;
  /** The locale the auth screens render in (Arabic by default, PRD I2). */
  locale: AuthLocale;
  setLocale: (locale: AuthLocale) => void;
  /** `dir` for the auth shell, from `directionOf(locale)`. */
  direction: "rtl" | "ltr";
  /** Locale-bound copy lookup: no user-facing string is hardcoded in a component (I1). */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** S1–S5: revoke, clear the cache, then land on `/sign-in` with `replace`. */
  signOut: (allDevices?: boolean) => Promise<void>;
  /** Adopts the session returned by signIn / verifyOtp / adminVerifyTotp / staffVerifySecondFactor. */
  signInWithSession: (payload: SessionTokenPayload) => SessionRecord;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const controller = authController;
  const router = useRouter();
  const queryClient = useQueryClient();
  // The server and the browser both answer from the locale cookie (Arabic when unset), so the first
  // client render already equals the server render.
  const [locale, setLocaleState] = useState<AuthLocale>(() => getCurrentLocale());

  /** Switches the language: remembered for the next visit, mirrored onto `<html lang dir>`. */
  const setLocale = useCallback((next: AuthLocale) => {
    rememberLocale(next);
    setLocaleState(next);
  }, []);

  const snapshot: SessionSnapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot,
  );

  // §4.3: hydrate in an effect, so the first client render equals the server render.
  useEffect(() => {
    void controller.restore();
  }, [controller]);

  // Re-run `beforeLoad` for the active matches whenever the session changes, so the redirect lands
  // on the first frame after hydration.
  useEffect(() => {
    if (snapshot.status === "loading") return;
    void router.invalidate();
  }, [snapshot.status, router]);

  const signOut = useCallback(
    async (allDevices = false): Promise<void> => {
      await controller.signOut(allDevices);
      queryClient.clear();
      await router.navigate({ to: "/sign-in", replace: true });
    },
    [controller, queryClient, router],
  );

  const signInWithSession = useCallback(
    (payload: SessionTokenPayload): SessionRecord => controller.adoptSession(payload),
    [controller],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status: snapshot.status,
      actor: snapshot.actor,
      record: snapshot.record,
      controller,
      locale,
      setLocale,
      direction: directionOf(locale),
      t: (key: string, params?: Record<string, string | number>) => translate(key, locale, params),
      signOut,
      signInWithSession,
    }),
    [snapshot, controller, locale, setLocale, signOut, signInWithSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** The auth context. Throws outside `<AuthProvider>` so a missing provider fails loudly. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}

/** The status alone, for components that only care whether they may render. */
export function useAuthStatus(): AuthStatus {
  return useAuth().status;
}

/** The active locale and a setter, for the AR|EN toggle in the auth shell. */
export function useAuthLocale(): {
  locale: AuthLocale;
  setLocale: (locale: AuthLocale) => void;
  direction: "rtl" | "ltr";
} {
  const { locale, setLocale, direction } = useAuth();
  return { locale, setLocale, direction };
}
