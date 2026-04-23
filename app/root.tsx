import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import colorSchemeApi from "@dazl/color-scheme/client?url";
import { ErrorBoundary as ErrorBoundaryRoot } from "~/components/error-boundary/error-boundary";
import "./styles/index.css";
import { useColorScheme } from "@dazl/color-scheme/react";
import { AppBackground } from "~/components/ui/app-background";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico?v=2" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { rootCssClass, resolvedScheme } = useColorScheme();
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Heaven Card",
    url: "https://heavencard.com",
    logo: "/logo.png?v=2",
  };
  return (
    <html lang="en" suppressHydrationWarning className={rootCssClass} style={{ colorScheme: resolvedScheme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:image" content="/logo.png?v=2" />
        <meta name="twitter:image" content="/logo.png?v=2" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <Meta />
        <script src={colorSchemeApi} data-light-class="light-theme" data-dark-class="dark-theme"></script>
        <Links />
      </head>
      <body>
        <AppBackground />
        <div className="app-shell">{children}</div>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `
/* ── Copy protection: block on non-inputs, allow inputs ── */
(function(){
  const isInput = (t) => t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
  document.addEventListener('contextmenu', function(e){
    if (!isInput(e.target)) { e.preventDefault(); }
  }, { passive: false });
  document.addEventListener('copy', function(e){
    if (!isInput(e.target)) { e.preventDefault(); }
  }, { passive: false });
  document.addEventListener('cut', function(e){
    if (!isInput(e.target)) { e.preventDefault(); }
  }, { passive: false });
  document.addEventListener('dragstart', function(e){
    if (e.target.tagName==='IMG' || e.target.closest('.protected, .card-data, .logo')) {
      e.preventDefault();
    }
  }, { passive: false });
})();

/* ── Soft DevTools detection ── */
(function(){
  let devOpen = false;
  const threshold = 160;
  function check(){
    const w = window.outerWidth - window.innerWidth > threshold;
    const h = window.outerHeight - window.innerHeight > threshold;
    const firebug = !!(window.console && (console.firebug || (console.exception && console.table)));
    const nowOpen = w || h || firebug;
    if (nowOpen !== devOpen) {
      devOpen = nowOpen;
      document.body.classList.toggle('devtools-open', nowOpen);
    }
  }
  window.addEventListener('resize', check);
  setInterval(check, 2000);
})();
            `,
          }}
        />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export const ErrorBoundary = ErrorBoundaryRoot;
