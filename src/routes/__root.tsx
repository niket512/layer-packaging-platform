import { useEffect, type ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useVisitorTracking } from "@/lib/visitor-tracking";
import { seoHead } from "@/lib/seo-metadata";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

const GOOGLE_FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

// Google Ads tag. Thank-you page views count as conversions only when a fresh enquiry is pending; the page sends that view itself, once.
const GTAG_INIT = "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'AW-18547475916', location.pathname.replace(/\\/+$/, '') === '/sourcing/thank-you' ? { send_page_view: false } : {});";

// Reddit Pixel. Discards the fabricated integration-test ID before the Pixel reads the URL; a thank-you view is sent by the page only when consuming a fresh saved enquiry.
const REDDIT_INIT = "try {\nvar url = new URL(location.href), c = url.searchParams.get('rdt_cid');\nvar usable = function(v){return typeof v === 'string' && v.length > 0 && v.length <= 500 && !/\\s/.test(v) && v.toLowerCase() !== 'lovable_test_click';};\nif (c !== null && !usable(c)) {url.searchParams.delete('rdt_cid');history.replaceState(history.state,'',url.pathname+url.search+url.hash);c=null;}\ntry {var saved=localStorage.getItem('rdt_cid');if(saved!==null&&!usable(saved))localStorage.removeItem('rdt_cid');if(usable(c))localStorage.setItem('rdt_cid',c);}catch(e){}\n} catch(e) {}\n!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement(\"script\");t.src=\"https://www.redditstatic.com/ads/pixel.js\",t.async=!0;var s=d.getElementsByTagName(\"script\")[0];s.parentNode.insertBefore(t,s)}}(window,document);\nrdt('init','a2_jykx84cbgi9e');\nif (location.pathname.replace(/\\/+$/, '') !== '/sourcing/thank-you') rdt('track','PageVisit');";

const SITE_SCHEMA = "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"Organization\",\"@id\":\"https://snaplogo.in/#org\",\"name\":\"Snaplogo\",\"url\":\"https://snaplogo.in/\",\"logo\":\"https://snaplogo.in/snaplogo-circle-favicon-512.png\",\"email\":\"contact@snapit.club\"},{\"@type\":\"WebSite\",\"@id\":\"https://snaplogo.in/#site\",\"url\":\"https://snaplogo.in/\",\"name\":\"Snaplogo\",\"publisher\":{\"@id\":\"https://snaplogo.in/#org\"}},{\"@type\":\"ItemList\",\"name\":\"Main pages\",\"itemListElement\":[{\"@type\":\"SiteNavigationElement\",\"position\":1,\"name\":\"About\",\"url\":\"https://snaplogo.in/about\"},{\"@type\":\"SiteNavigationElement\",\"position\":2,\"name\":\"Manufacturers\",\"url\":\"https://snaplogo.in/manufacturer-network\"},{\"@type\":\"SiteNavigationElement\",\"position\":3,\"name\":\"Team\",\"url\":\"https://snaplogo.in/team\"},{\"@type\":\"SiteNavigationElement\",\"position\":4,\"name\":\"Proposal\",\"url\":\"https://snaplogo.in/proposal\"}]}]}";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    const leaf = matches[matches.length - 1];
    const indexData = matches.find((m) => (m.routeId as string) === "/")?.loaderData as { appHost?: boolean } | undefined;
    const seo = seoHead(leaf?.pathname ?? "/", Boolean(indexData?.appHost));
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "color-scheme", content: "only light" },
        { name: "author", content: "Snaplogo" },
        ...seo.meta,
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "preload", as: "style", href: GOOGLE_FONTS },
        { rel: "icon", href: "/snaplogo-circle-favicon-96.png", sizes: "96x96", type: "image/png" },
        { rel: "icon", href: "/snaplogo-circle-favicon-512.png", sizes: "512x512", type: "image/png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        ...seo.links,
      ],
      scripts: [
        { src: "https://www.googletagmanager.com/gtag/js?id=AW-18547475916", defer: true },
        // Non-blocking web font: applied once downloaded so text paints immediately in the fallback font.
        { children: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href="${GOOGLE_FONTS}";document.head.appendChild(l);})();` },
        { children: GTAG_INIT },
        { children: REDDIT_INIT },
        { type: "application/ld+json", children: SITE_SCHEMA },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function VisitorTracking() {
  useVisitorTracking();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <VisitorTracking />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">This page didn't load</h1>
        <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a href="/" className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-semibold">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
