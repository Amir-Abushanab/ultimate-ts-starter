import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { getLocale } from "@ultimate-ts-starter/i18n/runtime";
import { Toaster } from "@ultimate-ts-starter/ui/components/sonner";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { scan } from "react-scan";

import { ErrorBoundary } from "@/components/error-boundary";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { initAnalytics } from "@/lib/analytics";
import type { orpc } from "@/utils/orpc";

import appCss from "@/index.css?url";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);
export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

const RootDocument = () => {
  const [locale, setLocale] = useState(getLocale());
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  useEffect(() => {
    scan({ enabled: import.meta.env.DEV });
    initAnalytics();
  }, []);

  // Re-render when locale changes (Paraglide's setLocale triggers this)
  useEffect(() => {
    const handleLocaleChange = () => {
      setLocale(getLocale());
    };
    window.addEventListener("paraglide:locale-change", handleLocaleChange);
    return () => {
      window.removeEventListener("paraglide:locale-change", handleLocaleChange);
    };
  }, []);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <div className="grid h-svh grid-rows-[auto_1fr_auto]">
              <Header />
              <Outlet />
              <Footer />
            </div>
          </ErrorBoundary>
          <Toaster richColors />
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootDocument,

  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Ultimate TS Starter",
      },
      {
        content: "The ultimate TypeScript starter for web, mobile, and server.",
        name: "description",
      },
      {
        content: "Ultimate TS Starter",
        property: "og:title",
      },
      {
        content: "The ultimate TypeScript starter for web, mobile, and server.",
        property: "og:description",
      },
    ],
  }),
});
