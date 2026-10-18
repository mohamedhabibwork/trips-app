import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@trips-app/ui/components/sonner";
import { setLocale, t } from "@trips-app/i18n";

import { AuthProvider } from "@/auth/auth-context";
import { SessionExpiredDialog } from "@/auth/components/session-expired-dialog";
import type { RouterAppContext } from "@/types";

import Header from "../components/header";
import appCss from "../index.css?url";

// The document this app renders declares English (`<html lang="en">`). The server has no document
// to read, so without this the first paint would use the product default (Arabic) and every string
// would be replaced on hydration.
if (typeof window === "undefined") setLocale("en");

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
});

function RootDocument() {
  return (
    <html lang="en">
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
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            <Outlet />
          </div>
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
