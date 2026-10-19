import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@trips-app/ui/components/sonner";
import { directionOf, getLocale, t } from "@trips-app/i18n";

import { AuthProvider } from "@/auth/auth-context";
import { SessionExpiredDialog } from "@/auth/components/session-expired-dialog";
import type { RouterAppContext } from "@/types";

import { installClientLocale } from "@/i18n/client-locale";
import { PublicShell } from "@/components/shells/public-shell";
import { ScreenById } from "@/components/shells/shell-content";
import appCss from "../index.css?url";

// The browser reads the language from the same cookie the server rendered with (Arabic when unset),
// so the first client render equals the server render. The server side is in server.ts.
installClientLocale();

export type { RouterAppContext } from "@/types";

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: t("route.root.tripsEnjoy"),
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
  notFoundComponent: () => <ScreenById screenId="SCR-SHR-03" />,
});

// Dashboard layouts draw their own chrome; every other page sits in the public shell. The admin
// sign-in pages use its navy variant (SCR-PUB-09, SCR-PUB-10).
const DASHBOARD_LAYOUTS = new Set(["/business", "/admin"]);
const INVERSE_PAGES = new Set(["/admin_/sign-in", "/admin_/sign-in_/authenticator"]);

function PageFrame() {
  const frame = useMatches({
    select: (matches) => {
      if (matches.some((match) => DASHBOARD_LAYOUTS.has(match.routeId))) return "dashboard";
      if (matches.some((match) => INVERSE_PAGES.has(match.routeId))) return "inverse";
      return "default";
    },
  });
  if (frame === "dashboard") return <Outlet />;
  return (
    <PublicShell tone={frame === "inverse" ? "inverse" : "default"}>
      <Outlet />
    </PublicShell>
  );
}

function RootDocument() {
  const locale = getLocale();
  return (
    <html lang={locale} dir={directionOf(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          The provider owns the session state for the whole document: the header reads it, the
          guards read the same controller through the router context, and the expired notice is
          rendered above the active route so drafts stay mounted (E2).
        */}
        <AuthProvider>
          <PageFrame />
          <SessionExpiredDialog />
        </AuthProvider>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
