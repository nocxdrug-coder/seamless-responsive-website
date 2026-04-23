import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, isRouteErrorResponse, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, Meta, Links, ScrollRestoration, Scripts, Link, NavLink, useLoaderData, useNavigate, useLocation, redirect, useFetcher } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useColorScheme } from "@dazl/color-scheme/react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import classNames from "classnames";
import crypto$1, { timingSafeEqual } from "node:crypto";
import { ArrowRight, ChevronDown, Zap, Shield, Globe, ArrowLeft, AlertCircle, EyeOff, Eye, Headphones, CreditCard, CheckCircle, HelpCircle, Ticket, Camera, Activity, ChevronUp, LayoutDashboard, ArrowDownToLine, History, Package, ShoppingBag, ShieldCheck, LifeBuoy, LogOut, TriangleAlert, X, Clock, Receipt, Plus, ExternalLink, Lock, Info, Filter, ChevronLeft, ChevronRight, Search, PlusCircle, RefreshCcw, ShoppingCart, RotateCcw, Wallet, Inbox, ArrowUpRight, ArrowDownLeft, Trash2, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Users, BarChart2, FileText, Loader2, Wrench, Minus, Wand2, Upload, ShieldOff, MinusCircle, Undo2, DollarSign, TrendingUp, Download, Layers, Check, Copy, Edit3, Ban, Unlock, MessageSquare, Send } from "lucide-react";
import { UAParser } from "ua-parser-js";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body2 = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body2);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body2);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const colorSchemeApi = "data:text/javascript;base64,ZnVuY3Rpb24gaW5pdGlhdGVDb2xvclNjaGVtZSh7IHNhdmVDb25maWcsIGxvYWRDb25maWcsIGNzc0NsYXNzIH0pIHsKICAgIGNvbnN0IHN0YXRlID0gewogICAgICAgIGxpc3RlbmVyczogbmV3IFNldCgpLAogICAgICAgIGNvbmZpZzogbG9hZENvbmZpZygpLAogICAgfTsKICAgIGNvbnN0IGlzRGFya1F1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKTsKICAgIGNvbnN0IHJlc29sdmVTeXN0ZW0gPSAoKSA9PiAoaXNEYXJrUXVlcnkubWF0Y2hlcyA/ICdkYXJrJyA6ICdsaWdodCcpOwogICAgY29uc3Qgb25TeXN0ZW1DaGFuZ2UgPSAoKSA9PiB7CiAgICAgICAgaWYgKHN0YXRlLmNvbmZpZyAhPT0gJ3N5c3RlbScpCiAgICAgICAgICAgIHJldHVybjsKICAgICAgICB1cGRhdGVEb2N1bWVudCgpOwogICAgfTsKICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9ICgpID0+IHsKICAgICAgICBjb25zdCBjb25maWcgPSBzdGF0ZS5jb25maWc7CiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBjb25maWcgPT09ICdzeXN0ZW0nID8gcmVzb2x2ZVN5c3RlbSgpIDogY29uZmlnOwogICAgICAgIHJldHVybiB7IGNvbmZpZywgcmVzb2x2ZWQgfTsKICAgIH07CiAgICBjb25zdCB1cGRhdGVEb2N1bWVudCA9ICgpID0+IHsKICAgICAgICBjb25zdCBjdXJyZW50ID0gY3VycmVudFN0YXRlKCk7CiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsKICAgICAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MubGlnaHQsIGNzc0NsYXNzLmRhcmspOwogICAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZChjc3NDbGFzc1tjdXJyZW50LnJlc29sdmVkXSk7CiAgICAgICAgcm9vdC5zdHlsZS5jb2xvclNjaGVtZSA9IGN1cnJlbnQucmVzb2x2ZWQgPT09ICdkYXJrJyA/ICdkYXJrJyA6ICdsaWdodCc7CiAgICAgICAgc3RhdGUubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihjdXJyZW50KSk7CiAgICB9OwogICAgLy8gc2V0IGluaXRpYWwgY29sb3Igc2NoZW1lIGFuZCBsaXN0ZW4gZm9yIHN5c3RlbSBjaGFuZ2VzCiAgICB1cGRhdGVEb2N1bWVudCgpOwogICAgaXNEYXJrUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25TeXN0ZW1DaGFuZ2UpOwogICAgcmV0dXJuIHsKICAgICAgICBnZXQgY29uZmlnKCkgewogICAgICAgICAgICByZXR1cm4gc3RhdGUuY29uZmlnOwogICAgICAgIH0sCiAgICAgICAgc2V0IGNvbmZpZyhjb25maWcpIHsKICAgICAgICAgICAgaWYgKGNvbmZpZyA9PT0gc3RhdGUuY29uZmlnKQogICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICBzdGF0ZS5jb25maWcgPSBjb25maWc7CiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50KCk7CiAgICAgICAgICAgIHNhdmVDb25maWcoY29uZmlnKTsKICAgICAgICB9LAogICAgICAgIGdldCBjdXJyZW50U3RhdGUoKSB7CiAgICAgICAgICAgIHJldHVybiBjdXJyZW50U3RhdGUoKTsKICAgICAgICB9LAogICAgICAgIGdldCByZXNvbHZlZFN5c3RlbSgpIHsKICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVTeXN0ZW0oKTsKICAgICAgICB9LAogICAgICAgIGdldFJvb3RDc3NDbGFzcyhyZXNvbHZlZCA9IGN1cnJlbnRTdGF0ZSgpLnJlc29sdmVkKSB7CiAgICAgICAgICAgIHJldHVybiBjc3NDbGFzc1tyZXNvbHZlZF07CiAgICAgICAgfSwKICAgICAgICBzdWJzY3JpYmU6IChzdWIpID0+IHsKICAgICAgICAgICAgc3RhdGUubGlzdGVuZXJzLmFkZChzdWIpOwogICAgICAgICAgICByZXR1cm4gKCkgPT4gewogICAgICAgICAgICAgICAgc3RhdGUubGlzdGVuZXJzLmRlbGV0ZShzdWIpOwogICAgICAgICAgICB9OwogICAgICAgIH0sCiAgICAgICAgZGlzcG9zZTogKCkgPT4gewogICAgICAgICAgICBzdGF0ZS5saXN0ZW5lcnMuY2xlYXIoKTsKICAgICAgICAgICAgaXNEYXJrUXVlcnkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgb25TeXN0ZW1DaGFuZ2UpOwogICAgICAgIH0sCiAgICB9Owp9CmNvbnN0IHN0b3JhZ2VLZXkgPSAnY29sb3Itc2NoZW1lJzsKY29uc3Qgc2NyaXB0RGF0YXNldCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ/LmRhdGFzZXQ7CmNvbnN0IGRhcmtDc3NDbGFzcyA9IHNjcmlwdERhdGFzZXQ/LmRhcmtDbGFzcyB8fCAnZGFyay10aGVtZSc7CmNvbnN0IGxpZ2h0Q3NzQ2xhc3MgPSBzY3JpcHREYXRhc2V0Py5saWdodENsYXNzIHx8ICdsaWdodC10aGVtZSc7CndpbmRvdy5jb2xvclNjaGVtZUFwaSA/Pz0gaW5pdGlhdGVDb2xvclNjaGVtZSh7CiAgICBsb2FkQ29uZmlnKCkgewogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpOwogICAgICAgICAgICByZXR1cm4gY29uZmlnID09PSAnbGlnaHQnIHx8IGNvbmZpZyA9PT0gJ2RhcmsnID8gY29uZmlnIDogJ3N5c3RlbSc7CiAgICAgICAgfQogICAgICAgIGNhdGNoIHsKICAgICAgICAgICAgcmV0dXJuICdzeXN0ZW0nOwogICAgICAgIH0KICAgIH0sCiAgICBzYXZlQ29uZmlnKGNvbmZpZykgewogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGlmIChjb25maWcgPT09ICdzeXN0ZW0nKSB7CiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShzdG9yYWdlS2V5KTsKICAgICAgICAgICAgfQogICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIGNvbmZpZyk7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgY2F0Y2ggewogICAgICAgICAgICAvLyBGYWxsYmFjayB0byBuby1vcCBpZiBsb2NhbFN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZQogICAgICAgIH0KICAgIH0sCiAgICBjc3NDbGFzczogeyBsaWdodDogbGlnaHRDc3NDbGFzcywgZGFyazogZGFya0Nzc0NsYXNzIH0sCn0pOwo=";
const errorBoundary = "_errorBoundary_391dk_1";
const errorContainer = "_errorContainer_391dk_9";
const errorTitle = "_errorTitle_391dk_16";
const styles$V = {
  errorBoundary,
  errorContainer,
  errorTitle
};
function ErrorBoundary$1({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsx("main", { className: styles$V.errorBoundary, children: /* @__PURE__ */ jsxs("div", { className: styles$V.errorContainer, children: [
    /* @__PURE__ */ jsx("h1", { className: styles$V.errorTitle, children: message }),
    /* @__PURE__ */ jsx("p", { className: styles$V.errorDetails, children: details }),
    stack
  ] }) });
}
const background = "_background_897ys_1";
const gradientLayer = "_gradientLayer_897ys_10";
const glowLayer = "_glowLayer_897ys_20";
const noiseLayer = "_noiseLayer_897ys_29";
const styles$U = {
  background,
  gradientLayer,
  glowLayer,
  noiseLayer
};
function AppBackground() {
  return /* @__PURE__ */ jsxs("div", { className: styles$U.background, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("div", { className: styles$U.gradientLayer }),
    /* @__PURE__ */ jsx("div", { className: styles$U.glowLayer }),
    /* @__PURE__ */ jsx("div", { className: styles$U.noiseLayer })
  ] });
}
const links = () => [{
  rel: "icon",
  href: "/favicon.ico?v=2"
}, {
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
}];
function Layout({
  children
}) {
  const {
    rootCssClass,
    resolvedScheme
  } = useColorScheme();
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Heaven Card",
    url: "https://heavencard.com",
    logo: "/logo.png?v=2"
  };
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    suppressHydrationWarning: true,
    className: rootCssClass,
    style: {
      colorScheme: resolvedScheme
    },
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx("meta", {
        property: "og:image",
        content: "/logo.png?v=2"
      }), /* @__PURE__ */ jsx("meta", {
        name: "twitter:image",
        content: "/logo.png?v=2"
      }), /* @__PURE__ */ jsx("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify(orgSchema)
        }
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx("script", {
        src: colorSchemeApi,
        "data-light-class": "light-theme",
        "data-dark-class": "dark-theme"
      }), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(AppBackground, {}), /* @__PURE__ */ jsx("div", {
        className: "app-shell",
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {}), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
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
            `
        }
      })]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(ErrorBoundary$1);
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const header$c = "_header_1i5r3_1";
const inner$c = "_inner_1i5r3_19";
const logo = "_logo_1i5r3_30";
const logoImage$4 = "_logoImage_1i5r3_38";
const logoText$2 = "_logoText_1i5r3_46";
const logoName$3 = "_logoName_1i5r3_52";
const logoTagline$2 = "_logoTagline_1i5r3_59";
const nav$1 = "_nav_1i5r3_64";
const navLink = "_navLink_1i5r3_72";
const active = "_active_1i5r3_88";
const actions$3 = "_actions_1i5r3_92";
const loginBtn = "_loginBtn_1i5r3_99";
const registerBtn = "_registerBtn_1i5r3_130";
const hamburger = "_hamburger_1i5r3_160";
const hamburgerLine = "_hamburgerLine_1i5r3_170";
const mobileMenu = "_mobileMenu_1i5r3_178";
const open$2 = "_open_1i5r3_197";
const mobileNavLink = "_mobileNavLink_1i5r3_201";
const mobileActions = "_mobileActions_1i5r3_217";
const mobilePrimaryBtn = "_mobilePrimaryBtn_1i5r3_230";
const mobileSecondaryBtn = "_mobileSecondaryBtn_1i5r3_231";
const styles$T = {
  header: header$c,
  inner: inner$c,
  logo,
  logoImage: logoImage$4,
  logoText: logoText$2,
  logoName: logoName$3,
  logoTagline: logoTagline$2,
  nav: nav$1,
  navLink,
  active,
  actions: actions$3,
  loginBtn,
  registerBtn,
  hamburger,
  hamburgerLine,
  mobileMenu,
  open: open$2,
  mobileNavLink,
  mobileActions,
  mobilePrimaryBtn,
  mobileSecondaryBtn
};
const NAV_LINKS = [
  { label: "Features", to: "/features", protected: false },
  { label: "Products", to: "/products", protected: false },
  { label: "Support", to: "/support", protected: false }
];
function NavigationHeader({ className, isAuthenticated }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const handleNavClick = () => {
    closeMenu();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("header", { className: classNames(styles$T.header, className), children: /* @__PURE__ */ jsxs("div", { className: styles$T.inner, children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: `${styles$T.logo} logo`, onClick: closeMenu, children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$T.logoImage }),
        /* @__PURE__ */ jsxs("div", { className: styles$T.logoText, children: [
          /* @__PURE__ */ jsx("span", { className: styles$T.logoName, children: "Heaven Card" }),
          /* @__PURE__ */ jsx("span", { className: styles$T.logoTagline, children: "Next-Gen Payments" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: styles$T.nav, children: NAV_LINKS.map((link) => /* @__PURE__ */ jsx(
        NavLink,
        {
          to: link.to,
          className: ({ isActive }) => classNames(styles$T.navLink, { [styles$T.active]: isActive }),
          onClick: handleNavClick,
          children: link.label
        },
        link.to
      )) }),
      /* @__PURE__ */ jsx("div", { className: styles$T.actions, children: isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: styles$T.loginBtn, children: "Go to Dashboard" }),
        /* @__PURE__ */ jsx(Link, { to: "/cards", className: styles$T.registerBtn, children: "Shop Now" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/login", className: styles$T.loginBtn, children: "Login" }),
        /* @__PURE__ */ jsx(Link, { to: "/register", className: styles$T.registerBtn, children: "Register" })
      ] }) }),
      /* @__PURE__ */ jsxs("button", { className: styles$T.hamburger, onClick: toggleMenu, "aria-label": "Toggle menu", children: [
        /* @__PURE__ */ jsx("span", { className: styles$T.hamburgerLine }),
        /* @__PURE__ */ jsx("span", { className: styles$T.hamburgerLine }),
        /* @__PURE__ */ jsx("span", { className: styles$T.hamburgerLine })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: classNames(styles$T.mobileMenu, { [styles$T.open]: menuOpen }), children: [
      (isAuthenticated ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Support", to: "/support" },
        { label: "Products", to: "/products" },
        { label: "Features", to: "/features" }
      ] : [
        { label: "Support", to: "/support" },
        { label: "Products", to: "/products" },
        { label: "Features", to: "/features" }
      ]).map((link) => /* @__PURE__ */ jsx(
        Link,
        {
          to: link.to,
          className: styles$T.mobileNavLink,
          onClick: handleNavClick,
          children: link.label
        },
        link.to
      )),
      /* @__PURE__ */ jsx("div", { className: styles$T.mobileActions, children: isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: styles$T.mobilePrimaryBtn, onClick: closeMenu, children: "Go to Dashboard" }),
        /* @__PURE__ */ jsx(Link, { to: "/cards", className: styles$T.mobileSecondaryBtn, onClick: closeMenu, children: "Shop Now" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/login", className: styles$T.mobileSecondaryBtn, onClick: closeMenu, children: "Login" }),
        /* @__PURE__ */ jsx(Link, { to: "/register", className: styles$T.mobilePrimaryBtn, onClick: closeMenu, children: "Register" })
      ] }) })
    ] })
  ] });
}
const footer$2 = "_footer_vqzmp_1";
const inner$b = "_inner_vqzmp_7";
const topRow = "_topRow_vqzmp_13";
const brand$2 = "_brand_vqzmp_20";
const logoWrap = "_logoWrap_vqzmp_26";
const logoImage$3 = "_logoImage_vqzmp_33";
const logoName$2 = "_logoName_vqzmp_40";
const brandDesc = "_brandDesc_vqzmp_47";
const col = "_col_vqzmp_54";
const colTitle = "_colTitle_vqzmp_60";
const colLink = "_colLink_vqzmp_67";
const divider = "_divider_vqzmp_78";
const bottomRow = "_bottomRow_vqzmp_84";
const copyright = "_copyright_vqzmp_91";
const styles$S = {
  footer: footer$2,
  inner: inner$b,
  topRow,
  brand: brand$2,
  logoWrap,
  logoImage: logoImage$3,
  logoName: logoName$2,
  brandDesc,
  col,
  colTitle,
  colLink,
  divider,
  bottomRow,
  copyright
};
function FooterInformation({ className }) {
  return /* @__PURE__ */ jsx("footer", { className: classNames(styles$S.footer, className), children: /* @__PURE__ */ jsxs("div", { className: styles$S.inner, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$S.topRow, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$S.brand, children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: styles$S.logoWrap, children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$S.logoImage }),
          /* @__PURE__ */ jsx("span", { className: styles$S.logoName, children: "Heaven Card" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: styles$S.brandDesc, children: "Next-generation prepaid card marketplace with instant delivery" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$S.col, children: [
        /* @__PURE__ */ jsx("div", { className: styles$S.colTitle, children: "Product" }),
        /* @__PURE__ */ jsx("a", { href: "/features", className: styles$S.colLink, children: "Features" }),
        /* @__PURE__ */ jsx("a", { href: "/#gateway", className: styles$S.colLink, children: "Pricing" }),
        /* @__PURE__ */ jsx("a", { href: "/#", className: styles$S.colLink, children: "API" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$S.col, children: [
        /* @__PURE__ */ jsx("div", { className: styles$S.colTitle, children: "Company" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "About" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "Terms" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "Privacy" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$S.col, children: [
        /* @__PURE__ */ jsx("div", { className: styles$S.colTitle, children: "Support" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "Help Center" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "Contact" }),
        /* @__PURE__ */ jsx("a", { href: "#", className: styles$S.colLink, children: "Status" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("hr", { className: styles$S.divider }),
    /* @__PURE__ */ jsx("div", { className: styles$S.bottomRow, children: /* @__PURE__ */ jsx("p", { className: styles$S.copyright, children: "© 2026 Heaven Card. All rights reserved." }) })
  ] }) });
}
const REQUIRED_SERVER_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SESSION_SECRET",
  "ADMIN_SESSION_SECRET",
  "LGPAY_APP_ID",
  "LGPAY_SECRET_KEY"
];
const AUTH_WRITE_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "SESSION_SECRET",
  "ADMIN_SESSION_SECRET"
];
function getServerEnv(key) {
  switch (key) {
    case "SUPABASE_URL":
      return process.env.SUPABASE_URL;
    case "SUPABASE_ANON_KEY":
      return process.env.SUPABASE_ANON_KEY;
    case "SESSION_SECRET":
      return process.env.SESSION_SECRET;
    case "ADMIN_SESSION_SECRET":
      return process.env.ADMIN_SESSION_SECRET;
    case "LGPAY_APP_ID":
      return process.env.LGPAY_APP_ID;
    case "LGPAY_SECRET_KEY":
      return process.env.LGPAY_SECRET_KEY;
    case "SUPABASE_SERVICE_KEY":
      return process.env.SUPABASE_SERVICE_KEY;
    case "BYPASS_SECRET":
      return process.env.BYPASS_SECRET;
    default:
      return process.env[key];
  }
}
function isMissing(value2) {
  return !value2 || value2.trim().length === 0;
}
function hasServerEnv(key) {
  return !isMissing(getServerEnv(key));
}
function getMissingServerEnv(keys) {
  return keys.filter((key) => !hasServerEnv(key));
}
function getExpectedServerEnv() {
  return {
    required: [...REQUIRED_SERVER_ENV_KEYS],
    authWrites: [...AUTH_WRITE_ENV_KEYS],
    optional: ["SUPABASE_SERVICE_KEY", "BYPASS_SECRET"]
  };
}
function logMissingUserAuthEnv(context) {
  const missing = [...getMissingServerEnv(["SUPABASE_URL", "SESSION_SECRET"])];
  const hasDbKey = hasServerEnv("SUPABASE_SERVICE_KEY") || hasServerEnv("SUPABASE_ANON_KEY");
  console.log(
    `[env] ${context} user-auth -> SUPABASE_URL: ${hasServerEnv("SUPABASE_URL") ? "set" : "missing"}, SESSION_SECRET: ${hasServerEnv("SESSION_SECRET") ? "set" : "missing"}, SERVICE_KEY: ${hasServerEnv("SUPABASE_SERVICE_KEY") ? "set" : "missing"}, ANON_KEY: ${hasServerEnv("SUPABASE_ANON_KEY") ? "set" : "missing"}`
  );
  if (!hasDbKey) {
    console.error(
      `[env] ${context} needs SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY in server/Vercel env (not VITE_*)`
    );
    missing.push("SUPABASE_SERVICE_KEY");
  }
  return missing;
}
function logMissingAdminAuthEnv(context) {
  const missing = [...getMissingServerEnv(["SUPABASE_URL", "ADMIN_SESSION_SECRET"])];
  const hasDbKey = hasServerEnv("SUPABASE_SERVICE_KEY") || hasServerEnv("SUPABASE_ANON_KEY");
  console.log(
    `[env] ${context} admin-auth -> SUPABASE_URL: ${hasServerEnv("SUPABASE_URL") ? "set" : "missing"}, ADMIN_SESSION_SECRET: ${hasServerEnv("ADMIN_SESSION_SECRET") ? "set" : "missing"}, SERVICE_KEY: ${hasServerEnv("SUPABASE_SERVICE_KEY") ? "set" : "missing"}, ANON_KEY: ${hasServerEnv("SUPABASE_ANON_KEY") ? "set" : "missing"}`
  );
  if (!hasDbKey) {
    console.error(
      `[env] ${context} needs SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY in server env`
    );
    missing.push("SUPABASE_SERVICE_KEY");
  }
  return missing;
}
const env_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getExpectedServerEnv,
  getMissingServerEnv,
  getServerEnv,
  hasServerEnv,
  logMissingAdminAuthEnv,
  logMissingUserAuthEnv
}, Symbol.toStringTag, { value: "Module" }));
const USER_SECRET = getServerEnv("SESSION_SECRET") ?? "dev-user-secret-change-in-prod";
const ADMIN_SECRET = getServerEnv("ADMIN_SESSION_SECRET") ?? "dev-admin-secret-change-in-prod";
if (!getServerEnv("SESSION_SECRET")) {
  console.error("[session] SESSION_SECRET is missing. Falling back to an insecure default secret for this runtime.");
}
if (!getServerEnv("ADMIN_SESSION_SECRET")) {
  console.error("[session] ADMIN_SESSION_SECRET is missing. Falling back to an insecure default admin secret for this runtime.");
}
const USER_COOKIE = "__cc_session";
const ADMIN_COOKIE = "__cc_admin";
const USER_MAX_AGE = 60 * 60 * 24 * 7;
const ADMIN_MAX_AGE = 60 * 60 * 8;
function sign(payload, secret) {
  return crypto$1.createHmac("sha256", secret).update(payload).digest("base64url");
}
function isHttps(request) {
  const proto = request.headers.get("x-forwarded-proto") ?? "";
  if (proto === "https") return true;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}
function buildCookie(name, value2, maxAge, request) {
  const secure = request && isHttps(request) ? "; Secure" : "";
  return `${name}=${value2}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
function destroyCookie(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
function createToken(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(data, secret);
  return `${data}.${sig}`;
}
function parseToken(raw, secret) {
  const lastDot = raw.lastIndexOf(".");
  if (lastDot === -1) return null;
  const data = raw.slice(0, lastDot);
  const sig = raw.slice(lastDot + 1);
  const expected = sign(data, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto$1.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}
function extractCookie(request, name) {
  const header2 = request.headers.get("Cookie") ?? "";
  const cookies = Object.fromEntries(
    header2.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return cookies[name] ?? null;
}
function createSessionCookie(payload, request) {
  return buildCookie(USER_COOKIE, createToken(payload, USER_SECRET), USER_MAX_AGE, request);
}
function destroySessionCookie() {
  return destroyCookie(USER_COOKIE);
}
function parseSession(request) {
  const raw = extractCookie(request, USER_COOKIE);
  if (!raw) return null;
  const payload = parseToken(raw, USER_SECRET);
  if (!payload) {
    console.warn("[session] User cookie signature mismatch");
    return null;
  }
  return payload;
}
function requireSession(request) {
  const session = parseSession(request);
  if (!session) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return session;
}
function createAdminSessionCookie(payload, request) {
  if (payload.role !== "admin") throw new Error("Only admin payloads can use the admin cookie");
  return buildCookie(ADMIN_COOKIE, createToken(payload, ADMIN_SECRET), ADMIN_MAX_AGE, request);
}
function destroyAdminSessionCookie() {
  return destroyCookie(ADMIN_COOKIE);
}
function parseAdminSession(request) {
  const raw = extractCookie(request, ADMIN_COOKIE);
  if (!raw) return null;
  const payload = parseToken(raw, ADMIN_SECRET);
  if (!payload || payload.role !== "admin") {
    console.warn("[session] Admin cookie invalid or wrong role");
    return null;
  }
  return payload;
}
function requireAdminSession(request) {
  const session = parseAdminSession(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  return session;
}
const session_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createAdminSessionCookie,
  createSessionCookie,
  destroyAdminSessionCookie,
  destroySessionCookie,
  parseAdminSession,
  parseSession,
  requireAdminSession,
  requireSession
}, Symbol.toStringTag, { value: "Module" }));
async function loader$k({ request }) {
  const session = parseSession(request);
  return Response.json({ isAuthenticated: !!session });
}
const publicLayout = UNSAFE_withComponentProps(function PublicLayout() {
  const {
    isAuthenticated
  } = useLoaderData();
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(NavigationHeader, {
      isAuthenticated
    }), /* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(FooterInformation, {})]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: publicLayout,
  loader: loader$k
}, Symbol.toStringTag, { value: "Module" }));
const AUTH_KEY = "cc_shop_authed";
const USER_KEY = "cc_shop_user";
function useAuth() {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTH_KEY) === "true";
  };
  const login2 = useCallback((userData) => {
    localStorage.setItem(AUTH_KEY, "true");
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);
  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    try {
      await fetch("/api/login?action=logout", { credentials: "include" });
    } catch {
    }
  }, []);
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const updated = { id: data.id, email: data.email, name: data.name, role: data.role };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        setUser(updated);
        return data;
      }
    } catch {
    }
    return null;
  }, []);
  return { isAuthenticated, login: login2, logout, user, refreshUser };
}
function ProtectedLink({ to, className, children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: to } });
    } else {
      navigate(to);
    }
  };
  return /* @__PURE__ */ jsx("a", { href: to, className, onClick: handleClick, children });
}
const hero$1 = "_hero_u5bxz_1";
const bgGlow = "_bgGlow_u5bxz_12";
const glowCircle1 = "_glowCircle1_u5bxz_18";
const glowCircle2 = "_glowCircle2_u5bxz_29";
const content$1 = "_content_u5bxz_45";
const badge$1 = "_badge_u5bxz_53";
const badgeDot = "_badgeDot_u5bxz_69";
const headline = "_headline_u5bxz_82";
const headlineAccent = "_headlineAccent_u5bxz_90";
const headlineMain = "_headlineMain_u5bxz_108";
const subheading$2 = "_subheading_u5bxz_114";
const ctas = "_ctas_u5bxz_125";
const ctaPrimary = "_ctaPrimary_u5bxz_135";
const ctaSecondary = "_ctaSecondary_u5bxz_179";
const trustBadges = "_trustBadges_u5bxz_205";
const trustItem = "_trustItem_u5bxz_214";
const trustDot = "_trustDot_u5bxz_222";
const trustDotGreen = "_trustDotGreen_u5bxz_228";
const trustDotBlue = "_trustDotBlue_u5bxz_229";
const trustDotPurple = "_trustDotPurple_u5bxz_230";
const scrollIndicator = "_scrollIndicator_u5bxz_232";
const styles$R = {
  hero: hero$1,
  bgGlow,
  glowCircle1,
  glowCircle2,
  content: content$1,
  badge: badge$1,
  badgeDot,
  headline,
  headlineAccent,
  headlineMain,
  subheading: subheading$2,
  ctas,
  ctaPrimary,
  ctaSecondary,
  trustBadges,
  trustItem,
  trustDot,
  trustDotGreen,
  trustDotBlue,
  trustDotPurple,
  scrollIndicator
};
function HeroSection({ isAuthenticated }) {
  return /* @__PURE__ */ jsxs("section", { className: styles$R.hero, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$R.bgGlow, children: [
      /* @__PURE__ */ jsx("div", { className: styles$R.glowCircle1 }),
      /* @__PURE__ */ jsx("div", { className: styles$R.glowCircle2 })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$R.content, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$R.badge, children: [
        /* @__PURE__ */ jsx("span", { className: styles$R.badgeDot }),
        "Instant Delivery • Auto-Credit"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: styles$R.headline, children: [
        /* @__PURE__ */ jsx("span", { className: styles$R.headlineAccent, children: "Next-Level" }),
        /* @__PURE__ */ jsx("span", { className: styles$R.headlineMain, children: "Platinum Prepaid Cards" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: styles$R.subheading, children: "Experience lightning-fast card delivery with seamless UPI and crypto payments. Your wallet, your rules." }),
      /* @__PURE__ */ jsx("div", { className: styles$R.ctas, children: isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: styles$R.ctaPrimary, children: [
          "Go to Dashboard ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 18 })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/cards", className: styles$R.ctaSecondary, children: "Shop Now" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Link, { to: "/register", className: styles$R.ctaPrimary, children: [
          "Get Started ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 18 })
        ] }),
        /* @__PURE__ */ jsx(ProtectedLink, { to: "/cards", className: styles$R.ctaSecondary, children: "Explore Cards" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$R.trustBadges, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$R.trustItem, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$R.trustDot} ${styles$R.trustDotGreen}` }),
          "99.5% Uptime"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$R.trustItem, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$R.trustDot} ${styles$R.trustDotBlue}` }),
          "Instant Delivery"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$R.trustItem, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$R.trustDot} ${styles$R.trustDotPurple}` }),
          "Crypto Ready"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$R.scrollIndicator, children: /* @__PURE__ */ jsx(ChevronDown, { size: 20 }) })
  ] });
}
const section$5 = "_section_4en7y_1";
const inner$a = "_inner_4en7y_20";
const header$b = "_header_4en7y_28";
const title$e = "_title_4en7y_33";
const subtitle$a = "_subtitle_4en7y_41";
const grid$6 = "_grid_4en7y_46";
const card$8 = "_card_4en7y_52";
const iconWrap$2 = "_iconWrap_4en7y_76";
const iconWrapBlue = "_iconWrapBlue_4en7y_86";
const iconWrapPurple = "_iconWrapPurple_4en7y_87";
const iconWrapOrange = "_iconWrapOrange_4en7y_88";
const cardTitle$1 = "_cardTitle_4en7y_90";
const cardDesc = "_cardDesc_4en7y_98";
const styles$Q = {
  section: section$5,
  inner: inner$a,
  header: header$b,
  title: title$e,
  subtitle: subtitle$a,
  grid: grid$6,
  card: card$8,
  iconWrap: iconWrap$2,
  iconWrapBlue,
  iconWrapPurple,
  iconWrapOrange,
  cardTitle: cardTitle$1,
  cardDesc
};
const FEATURES$3 = [
  {
    icon: /* @__PURE__ */ jsx(Zap, { size: 24 }),
    iconClass: styles$Q.iconWrapBlue,
    title: "Lightning Fast",
    desc: "Instant card delivery after payment confirmation. No waiting, no delays."
  },
  {
    icon: /* @__PURE__ */ jsx(Shield, { size: 24 }),
    iconClass: styles$Q.iconWrapPurple,
    title: "Bank-Level Security",
    desc: "Advanced encryption and secure payment processing for your peace of mind."
  },
  {
    icon: /* @__PURE__ */ jsx(Globe, { size: 24 }),
    iconClass: styles$Q.iconWrapOrange,
    title: "Multi-Currency",
    desc: "Support for UPI, BTC, LTC, TON, and USDT. Pay your way."
  }
];
function WhyChooseUs() {
  return /* @__PURE__ */ jsx("section", { id: "features", className: styles$Q.section, children: /* @__PURE__ */ jsxs("div", { className: styles$Q.inner, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$Q.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$Q.title, children: "Why Choose Us" }),
      /* @__PURE__ */ jsx("p", { className: styles$Q.subtitle, children: "Experience the perfect blend of speed, security, and simplicity" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$Q.grid, children: FEATURES$3.map((f) => /* @__PURE__ */ jsxs("div", { className: styles$Q.card, children: [
      /* @__PURE__ */ jsx("div", { className: `${styles$Q.iconWrap} ${f.iconClass}`, children: f.icon }),
      /* @__PURE__ */ jsx("h3", { className: styles$Q.cardTitle, children: f.title }),
      /* @__PURE__ */ jsx("p", { className: styles$Q.cardDesc, children: f.desc })
    ] }, f.title)) })
  ] }) });
}
const section$4 = "_section_pyhuk_1";
const inner$9 = "_inner_pyhuk_6";
const header$a = "_header_pyhuk_12";
const titleGroup = "_titleGroup_pyhuk_19";
const title$d = "_title_pyhuk_19";
const subtitle$9 = "_subtitle_pyhuk_32";
const viewAll = "_viewAll_pyhuk_37";
const grid$5 = "_grid_pyhuk_52";
const card$7 = "_card_pyhuk_58";
const cardTop = "_cardTop_pyhuk_77";
const cardIcon = "_cardIcon_pyhuk_83";
const inStockBadge = "_inStockBadge_pyhuk_96";
const inStockDot = "_inStockDot_pyhuk_108";
const cardName$2 = "_cardName_pyhuk_115";
const cardMeta$1 = "_cardMeta_pyhuk_122";
const metaItem$1 = "_metaItem_pyhuk_128";
const metaLabel$1 = "_metaLabel_pyhuk_134";
const metaValue$1 = "_metaValue_pyhuk_141";
const price$2 = "_price_pyhuk_147";
const priceUnit = "_priceUnit_pyhuk_157";
const actions$2 = "_actions_pyhuk_164";
const addToCartBtn = "_addToCartBtn_pyhuk_169";
const buyNowBtn = "_buyNowBtn_pyhuk_188";
const styles$P = {
  section: section$4,
  inner: inner$9,
  header: header$a,
  titleGroup,
  title: title$d,
  subtitle: subtitle$9,
  viewAll,
  grid: grid$5,
  card: card$7,
  cardTop,
  cardIcon,
  inStockBadge,
  inStockDot,
  cardName: cardName$2,
  cardMeta: cardMeta$1,
  metaItem: metaItem$1,
  metaLabel: metaLabel$1,
  metaValue: metaValue$1,
  price: price$2,
  priceUnit,
  actions: actions$2,
  addToCartBtn,
  buyNowBtn
};
function toVirtualCard$2(p) {
  const qty = Number(p.stock ?? 0);
  return {
    id: p.id,
    bin: p.bin,
    provider: p.provider,
    type: p.type,
    expiry: p.expiry,
    name: p.name,
    country: p.country,
    countryFlag: p.countryFlag,
    street: p.street,
    city: p.city,
    state: p.state,
    address: p.address,
    zip: p.zip,
    extras: p.extras ?? null,
    bank: p.bank,
    price: Number(p.price) || 0,
    limit: Number(p.limit) || 0,
    validUntil: p.validUntil,
    inStock: p.status === "in_stock" && qty > 0,
    stock: qty,
    color: p.color || "#3b82f6"
  };
}
function FeaturedCards() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return;
        const list2 = (data?.products ?? []).map(toVirtualCard$2).slice(0, 8);
        if (!cancelled) setFeatured(list2);
      } catch {
      }
    }
    fetchFeatured();
    const id = window.setInterval(fetchFeatured, 2e3);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  const handleProtectedAction = () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/cards" } });
    }
  };
  return /* @__PURE__ */ jsx("section", { id: "gallery", className: styles$P.section, children: /* @__PURE__ */ jsxs("div", { className: styles$P.inner, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$P.header, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$P.titleGroup, children: [
        /* @__PURE__ */ jsx("h2", { className: styles$P.title, children: "Featured Cards" }),
        /* @__PURE__ */ jsx("p", { className: styles$P.subtitle, children: "Premium cards ready for instant delivery" })
      ] }),
      /* @__PURE__ */ jsxs(ProtectedLink, { to: "/cards", className: styles$P.viewAll, children: [
        "View All ",
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$P.grid, children: featured.map((card2) => /* @__PURE__ */ jsxs("div", { className: styles$P.card, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$P.cardTop, children: [
        /* @__PURE__ */ jsx("div", { className: styles$P.cardIcon, style: { background: card2.color }, children: card2.type[0] }),
        /* @__PURE__ */ jsxs("div", { className: styles$P.inStockBadge, children: [
          /* @__PURE__ */ jsx("span", { className: styles$P.inStockDot }),
          "In Stock"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$P.cardName, children: card2.name }),
      /* @__PURE__ */ jsxs("div", { className: styles$P.cardMeta, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$P.metaItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$P.metaLabel, children: "Limit" }),
          /* @__PURE__ */ jsxs("span", { className: styles$P.metaValue, children: [
            "$",
            card2.limit
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$P.metaItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$P.metaLabel, children: "Valid Until" }),
          /* @__PURE__ */ jsx("span", { className: styles$P.metaValue, children: card2.validUntil })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: styles$P.price, children: [
          "$",
          card2.price.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$P.priceUnit, children: "USDT per card" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$P.actions, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles$P.addToCartBtn,
            onClick: handleProtectedAction,
            title: isAuthenticated() ? "Add to cart" : "Login to add to cart",
            children: "Add to Cart"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles$P.buyNowBtn,
            onClick: handleProtectedAction,
            title: isAuthenticated() ? "Buy now" : "Login to buy",
            children: "Buy Now"
          }
        )
      ] })
    ] }, card2.id)) })
  ] }) });
}
const section$3 = "_section_6ddie_1";
const inner$8 = "_inner_6ddie_6";
const card$6 = "_card_6ddie_12";
const left$1 = "_left_6ddie_37";
const heading$5 = "_heading_6ddie_39";
const headingGradient = "_headingGradient_6ddie_47";
const subtext$1 = "_subtext_6ddie_54";
const features = "_features_6ddie_61";
const featureItem$1 = "_featureItem_6ddie_67";
const featureIcon$2 = "_featureIcon_6ddie_73";
const featureText$2 = "_featureText_6ddie_84";
const featureTitle$2 = "_featureTitle_6ddie_90";
const featureDesc$2 = "_featureDesc_6ddie_96";
const right$1 = "_right_6ddie_101";
const paymentMethodsCard = "_paymentMethodsCard_6ddie_103";
const methodsHeader = "_methodsHeader_6ddie_110";
const methodsTitle = "_methodsTitle_6ddie_117";
const allActiveBadge = "_allActiveBadge_6ddie_123";
const activeDot = "_activeDot_6ddie_132";
const methodsGrid = "_methodsGrid_6ddie_139";
const methodItem = "_methodItem_6ddie_145";
const methodIcon = "_methodIcon_6ddie_160";
const methodName = "_methodName_6ddie_165";
const methodSub = "_methodSub_6ddie_171";
const styles$O = {
  section: section$3,
  inner: inner$8,
  card: card$6,
  left: left$1,
  heading: heading$5,
  headingGradient,
  subtext: subtext$1,
  features,
  featureItem: featureItem$1,
  featureIcon: featureIcon$2,
  featureText: featureText$2,
  featureTitle: featureTitle$2,
  featureDesc: featureDesc$2,
  right: right$1,
  paymentMethodsCard,
  methodsHeader,
  methodsTitle,
  allActiveBadge,
  activeDot,
  methodsGrid,
  methodItem,
  methodIcon,
  methodName,
  methodSub
};
const FEATURES$2 = [
  {
    icon: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 48 48", width: "22", height: "22", fill: "none", children: [
      /* @__PURE__ */ jsx("rect", { width: "48", height: "48", rx: "10", fill: "url(#upiGrad)" }),
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "upiGrad", x1: "0", y1: "0", x2: "48", y2: "48", gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#5F3FBD" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#2E7D32" })
      ] }) }),
      /* @__PURE__ */ jsx("text", { x: "24", y: "32", textAnchor: "middle", fontSize: "13", fontWeight: "800", fill: "#fff", fontFamily: "sans-serif", children: "UPI" })
    ] }),
    bg: "rgba(99,102,241,0.15)",
    title: "UPI Payments",
    desc: "Instant bank-to-wallet via UPI"
  },
  {
    icon: "₿",
    bg: "rgba(249,115,22,0.2)",
    title: "Crypto Payments",
    desc: "BTC, LTC, TON, USDT supported"
  },
  {
    icon: "🔒",
    bg: "rgba(239,68,68,0.2)",
    title: "Secure Processing",
    desc: "MD5 signatures & encrypted data"
  }
];
const UpiLogo = () => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 60 24", width: "36", height: "16", fill: "none", children: [
  /* @__PURE__ */ jsx("text", { x: "0", y: "18", fontSize: "16", fontWeight: "900", fill: "url(#upiG)", fontFamily: "sans-serif", children: "UPI" }),
  /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "upiG", x1: "0", y1: "0", x2: "60", y2: "0", children: [
    /* @__PURE__ */ jsx("stop", { stopColor: "#5F3FBD" }),
    /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#2E7D32" })
  ] }) })
] });
const UsdtLogo = () => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 32 32", width: "28", height: "28", fill: "none", children: [
  /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "16", fill: "#26A17B" }),
  /* @__PURE__ */ jsx("path", { d: "M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.662 0-.814 2.902-1.49 6.79-1.664v2.653c.254.018.982.062 1.988.062 1.207 0 1.812-.05 1.925-.062v-2.652c3.88.173 6.775.85 6.775 1.663 0 .813-2.895 1.49-6.775 1.661zm0-3.59v-2.366h5.414V8h-14.67v3.427h5.414v2.365c-4.4.202-7.708 1.074-7.708 2.12 0 1.046 3.308 1.917 7.708 2.12v7.589h2.842v-7.59c4.392-.202 7.692-1.073 7.692-2.119 0-1.046-3.3-1.917-7.692-2.12z", fill: "#fff" })
] });
const PAYMENT_METHODS = [
  {
    icon: /* @__PURE__ */ jsx(UpiLogo, {}),
    name: "UPI",
    sub: "Instant"
  },
  { icon: "₿", name: "Bitcoin", sub: "BTC" },
  { icon: "Ł", name: "Litecoin", sub: "LTC" },
  {
    icon: /* @__PURE__ */ jsx(UsdtLogo, {}),
    name: "USDT",
    sub: "Tether"
  }
];
function PaymentGatewaySection() {
  return /* @__PURE__ */ jsx("section", { id: "gateway", className: styles$O.section, children: /* @__PURE__ */ jsx("div", { className: styles$O.inner, children: /* @__PURE__ */ jsxs("div", { className: styles$O.card, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$O.left, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$O.heading, children: /* @__PURE__ */ jsx("span", { className: styles$O.headingGradient, children: "Payment Gateway" }) }),
      /* @__PURE__ */ jsx("p", { className: styles$O.subtext, children: "Seamless integration with multiple payment methods for instant wallet top-ups" }),
      /* @__PURE__ */ jsx("div", { className: styles$O.features, children: FEATURES$2.map((f) => /* @__PURE__ */ jsxs("div", { className: styles$O.featureItem, children: [
        /* @__PURE__ */ jsx("div", { className: styles$O.featureIcon, style: { background: f.bg }, children: f.icon }),
        /* @__PURE__ */ jsxs("div", { className: styles$O.featureText, children: [
          /* @__PURE__ */ jsx("span", { className: styles$O.featureTitle, children: f.title }),
          /* @__PURE__ */ jsx("span", { className: styles$O.featureDesc, children: f.desc })
        ] })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$O.right, children: /* @__PURE__ */ jsxs("div", { className: styles$O.paymentMethodsCard, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$O.methodsHeader, children: [
        /* @__PURE__ */ jsx("span", { className: styles$O.methodsTitle, children: "Payment Methods" }),
        /* @__PURE__ */ jsxs("span", { className: styles$O.allActiveBadge, children: [
          /* @__PURE__ */ jsx("span", { className: styles$O.activeDot }),
          "All Active"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$O.methodsGrid, children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxs("div", { className: styles$O.methodItem, children: [
        /* @__PURE__ */ jsx("div", { className: styles$O.methodIcon, children: m.icon }),
        /* @__PURE__ */ jsx("div", { className: styles$O.methodName, children: m.name }),
        /* @__PURE__ */ jsx("div", { className: styles$O.methodSub, children: m.sub })
      ] }, m.name)) })
    ] }) })
  ] }) }) });
}
const section$2 = "_section_1dxms_1";
const inner$7 = "_inner_1dxms_6";
const header$9 = "_header_1dxms_12";
const title$c = "_title_1dxms_17";
const subtitle$8 = "_subtitle_1dxms_28";
const list = "_list_1dxms_33";
const item = "_item_1dxms_39";
const open$1 = "_open_1dxms_47";
const question = "_question_1dxms_51";
const questionText = "_questionText_1dxms_64";
const icon = "_icon_1dxms_70";
const answer = "_answer_1dxms_81";
const visible = "_visible_1dxms_87";
const answerText = "_answerText_1dxms_91";
const styles$N = {
  section: section$2,
  inner: inner$7,
  header: header$9,
  title: title$c,
  subtitle: subtitle$8,
  list,
  item,
  open: open$1,
  question,
  questionText,
  icon,
  answer,
  visible,
  answerText
};
const FAQS = [
  {
    q: "How fast is card delivery?",
    a: "Cards are delivered instantly after successful payment verification. You'll receive full card details (number, expiry, CVV) in your dashboard within seconds."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI (QR code payments) and multiple cryptocurrencies including BTC, LTC, TON, and USDT. Minimum deposit is ₹2,000 INR."
  },
  {
    q: "How secure is the platform?",
    a: "We use 256-bit SSL encryption, bank-level security protocols, MD5 signature verification, and never store sensitive payment information."
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are considered on a case-by-case basis for unused cards. Once card details are viewed, refunds cannot be processed. Contact support within 24 hours of purchase."
  }
];
function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
  return /* @__PURE__ */ jsx("section", { id: "faq", className: styles$N.section, children: /* @__PURE__ */ jsxs("div", { className: styles$N.inner, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$N.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$N.title, children: "FAQ" }),
      /* @__PURE__ */ jsx("p", { className: styles$N.subtitle, children: "Got questions? We've got answers" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$N.list, children: FAQS.map((faq, i) => /* @__PURE__ */ jsxs("div", { className: classNames(styles$N.item, { [styles$N.open]: openIndex === i }), children: [
      /* @__PURE__ */ jsxs("button", { className: styles$N.question, onClick: () => toggle(i), children: [
        /* @__PURE__ */ jsx("span", { className: styles$N.questionText, children: faq.q }),
        /* @__PURE__ */ jsx(ChevronDown, { size: 18, className: styles$N.icon })
      ] }),
      /* @__PURE__ */ jsx("div", { className: classNames(styles$N.answer, { [styles$N.visible]: openIndex === i }), children: /* @__PURE__ */ jsx("p", { className: styles$N.answerText, children: faq.a }) })
    ] }, i)) })
  ] }) });
}
const section$1 = "_section_1dajt_1";
const inner$6 = "_inner_1dajt_6";
const card$5 = "_card_1dajt_12";
const title$b = "_title_1dajt_46";
const subtitle$7 = "_subtitle_1dajt_54";
const actions$1 = "_actions_1dajt_60";
const primaryBtn = "_primaryBtn_1dajt_70";
const secondaryBtn = "_secondaryBtn_1dajt_90";
const styles$M = {
  section: section$1,
  inner: inner$6,
  card: card$5,
  title: title$b,
  subtitle: subtitle$7,
  actions: actions$1,
  primaryBtn,
  secondaryBtn
};
function CtaSection() {
  return /* @__PURE__ */ jsx("section", { className: styles$M.section, children: /* @__PURE__ */ jsx("div", { className: styles$M.inner, children: /* @__PURE__ */ jsxs("div", { className: styles$M.card, children: [
    /* @__PURE__ */ jsx("h2", { className: styles$M.title, children: "Ready to Get Started?" }),
    /* @__PURE__ */ jsx("p", { className: styles$M.subtitle, children: "Join thousands of users who trust Heaven Card for their prepaid card needs" }),
    /* @__PURE__ */ jsxs("div", { className: styles$M.actions, children: [
      /* @__PURE__ */ jsx(Link, { to: "/register", className: styles$M.primaryBtn, children: "Create Free Account" }),
      /* @__PURE__ */ jsx(ProtectedLink, { to: "/cards", className: styles$M.secondaryBtn, children: "Browse Cards" })
    ] })
  ] }) }) });
}
const _index = UNSAFE_withComponentProps(function Index() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(HeroSection, {}), /* @__PURE__ */ jsx(WhyChooseUs, {}), /* @__PURE__ */ jsx(PaymentGatewaySection, {}), /* @__PURE__ */ jsx("div", {
      id: "cards",
      children: /* @__PURE__ */ jsx(FeaturedCards, {})
    }), /* @__PURE__ */ jsx(FaqSection, {}), /* @__PURE__ */ jsx(CtaSection, {})]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _index
}, Symbol.toStringTag, { value: "Module" }));
const wrap$h = "_wrap_1az5m_1";
const backLink$2 = "_backLink_1az5m_7";
const heading$4 = "_heading_1az5m_21";
const subheading$1 = "_subheading_1az5m_29";
const form$3 = "_form_1az5m_34";
const fieldGroup$7 = "_fieldGroup_1az5m_40";
const label$a = "_label_1az5m_46";
const input$7 = "_input_1az5m_52";
const rowMeta = "_rowMeta_1az5m_73";
const rememberMe = "_rememberMe_1az5m_79";
const forgotLink = "_forgotLink_1az5m_95";
const submitBtn$4 = "_submitBtn_1az5m_106";
const registerPrompt = "_registerPrompt_1az5m_125";
const registerLink = "_registerLink_1az5m_131";
const errorBanner$2 = "_errorBanner_1az5m_141";
const passwordWrap$1 = "_passwordWrap_1az5m_153";
const eyeBtn$1 = "_eyeBtn_1az5m_163";
const styles$L = {
  wrap: wrap$h,
  backLink: backLink$2,
  heading: heading$4,
  subheading: subheading$1,
  form: form$3,
  fieldGroup: fieldGroup$7,
  label: label$a,
  input: input$7,
  rowMeta,
  rememberMe,
  forgotLink,
  submitBtn: submitBtn$4,
  registerPrompt,
  registerLink,
  errorBanner: errorBanner$2,
  passwordWrap: passwordWrap$1,
  eyeBtn: eyeBtn$1
};
function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: login2 } = useAuth();
  const fromPath = location.state?.from ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        // credentials: "include" ensures the Set-Cookie response header
        // is stored by the browser and sent on all subsequent requests.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      login2(data.user);
      navigate(fromPath, { replace: true });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$L.wrap, children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: styles$L.backLink, children: [
      /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
      " Back to home"
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: styles$L.heading, children: "Welcome Back" }),
      /* @__PURE__ */ jsx("p", { className: styles$L.subheading, children: "Sign in to continue your journey" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: styles$L.form, onSubmit: handleSubmit, noValidate: true, children: [
      error && /* @__PURE__ */ jsxs("div", { className: styles$L.errorBanner, children: [
        /* @__PURE__ */ jsx(AlertCircle, { size: 15 }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$L.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$L.label, children: "Email Address" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$L.input,
            type: "email",
            placeholder: "you@example.com",
            autoComplete: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$L.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$L.label, children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: styles$L.passwordWrap, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$L.input,
              type: showPassword ? "text" : "password",
              placeholder: "Enter your password",
              autoComplete: "current-password",
              value: password,
              onChange: (e) => setPassword(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: styles$L.eyeBtn,
              onClick: () => setShowPassword((v) => !v),
              "aria-label": showPassword ? "Hide password" : "Show password",
              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$L.rowMeta, children: [
        /* @__PURE__ */ jsxs("label", { className: styles$L.rememberMe, children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox" }),
          "Remember me"
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/reset-password", className: styles$L.forgotLink, children: "Forgot password?" })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: styles$L.submitBtn, disabled: isLoading, children: isLoading ? "Signing in…" : "Sign In" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: styles$L.registerPrompt, children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/register", className: styles$L.registerLink, children: "Create account" })
    ] })
  ] });
}
const wrap$g = "_wrap_1fods_1";
const logoRow$1 = "_logoRow_1fods_7";
const logoImage$2 = "_logoImage_1fods_13";
const logoText$1 = "_logoText_1fods_20";
const logoName$1 = "_logoName_1fods_25";
const logoTagline$1 = "_logoTagline_1fods_32";
const heading$3 = "_heading_1fods_37";
const desc$2 = "_desc_1fods_44";
const featureList$2 = "_featureList_1fods_50";
const featureCard$1 = "_featureCard_1fods_56";
const featureIcon$1 = "_featureIcon_1fods_66";
const featureText$1 = "_featureText_1fods_76";
const featureTitle$1 = "_featureTitle_1fods_82";
const featureDesc$1 = "_featureDesc_1fods_88";
const paymentRow$1 = "_paymentRow_1fods_93";
const paymentLabel$1 = "_paymentLabel_1fods_99";
const paymentBadges$1 = "_paymentBadges_1fods_106";
const paymentBadge$1 = "_paymentBadge_1fods_106";
const styles$K = {
  wrap: wrap$g,
  logoRow: logoRow$1,
  logoImage: logoImage$2,
  logoText: logoText$1,
  logoName: logoName$1,
  logoTagline: logoTagline$1,
  heading: heading$3,
  desc: desc$2,
  featureList: featureList$2,
  featureCard: featureCard$1,
  featureIcon: featureIcon$1,
  featureText: featureText$1,
  featureTitle: featureTitle$1,
  featureDesc: featureDesc$1,
  paymentRow: paymentRow$1,
  paymentLabel: paymentLabel$1,
  paymentBadges: paymentBadges$1,
  paymentBadge: paymentBadge$1
};
const FEATURES$1 = [
  {
    icon: /* @__PURE__ */ jsx(Zap, { size: 20 }),
    color: "rgba(34,197,94,0.15)",
    textColor: "#22c55e",
    title: "99.5% Uptime",
    desc: "Always available when you need us"
  },
  {
    icon: /* @__PURE__ */ jsx(Zap, { size: 20 }),
    color: "rgba(59,130,246,0.15)",
    textColor: "#3b82f6",
    title: "Instant Delivery",
    desc: "Cards delivered in seconds"
  },
  {
    icon: /* @__PURE__ */ jsx(Shield, { size: 20 }),
    color: "rgba(230,57,70,0.15)",
    textColor: "#e63946",
    title: "Bank-Level Security",
    desc: "Your data is always protected"
  },
  {
    icon: /* @__PURE__ */ jsx(Headphones, { size: 20 }),
    color: "rgba(249,115,22,0.15)",
    textColor: "#f97316",
    title: "12/7 Support",
    desc: "We're here whenever you need help"
  }
];
function TrustIndicators() {
  return /* @__PURE__ */ jsxs("div", { className: styles$K.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$K.logoRow, children: [
      /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$K.logoImage }),
      /* @__PURE__ */ jsxs("div", { className: styles$K.logoText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$K.logoName, children: "Heaven Card" }),
        /* @__PURE__ */ jsx("span", { className: styles$K.logoTagline, children: "Next-Gen Payments" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: styles$K.heading, children: "Growing fast with early users" }),
    /* @__PURE__ */ jsx("p", { className: styles$K.desc, children: "Your secure gateway to premium digital assets with multi-currency support and 24/7 availability." }),
    /* @__PURE__ */ jsx("div", { className: styles$K.featureList, children: FEATURES$1.map((f) => /* @__PURE__ */ jsxs("div", { className: styles$K.featureCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$K.featureIcon, style: { background: f.color, color: f.textColor }, children: f.icon }),
      /* @__PURE__ */ jsxs("div", { className: styles$K.featureText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$K.featureTitle, children: f.title }),
        /* @__PURE__ */ jsx("span", { className: styles$K.featureDesc, children: f.desc })
      ] })
    ] }, f.title)) }),
    /* @__PURE__ */ jsxs("div", { className: styles$K.paymentRow, children: [
      /* @__PURE__ */ jsx("span", { className: styles$K.paymentLabel, children: "Accepted Payment Methods" }),
      /* @__PURE__ */ jsx("div", { className: styles$K.paymentBadges, children: ["UPI", "BTC", "USDT", "LTC"].map((m) => /* @__PURE__ */ jsx("span", { className: styles$K.paymentBadge, children: m }, m)) })
    ] })
  ] });
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function formatUsers(n) {
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K+`;
  return `${n}+`;
}
function formatProcessed(cents) {
  const dollars = cents / 100;
  if (dollars >= 1e6) return `$${(dollars / 1e6).toFixed(1)}M+`;
  if (dollars >= 1e3) return `$${Math.floor(dollars / 1e3)}K+`;
  return `$${Math.floor(dollars)}`;
}
function isBrowser() {
  return typeof window !== "undefined";
}
const INITIAL_USERS = 1247;
const INITIAL_PROCESSED = 12840 * 100;
const INITIAL_COUNTRIES = 40;
const INITIAL_UPTIME = 99.5;
function useLiveStats() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [processed, setProcessed] = useState(INITIAL_PROCESSED);
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [uptime, setUptime] = useState(INITIAL_UPTIME);
  const countryTickRef = useRef(0);
  useEffect(() => {
    if (!isBrowser()) return;
    const userInterval = setInterval(() => {
      setUsers((prev) => {
        const pct = (Math.random() * 4 + 1) / 100;
        const delta = Math.round(prev * pct);
        const dir = Math.random() > 0.42 ? 1 : -1;
        return clamp(prev + dir * delta, 900, 7e3);
      });
    }, 5e3 + Math.random() * 4e3);
    const processedInterval = setInterval(() => {
      setProcessed((prev) => {
        const increment = (Math.floor(Math.random() * 251) + 50) * 100;
        return Math.min(prev + increment, 25e3 * 100);
      });
    }, 6e3 + Math.random() * 6e3);
    const countryInterval = setInterval(() => {
      countryTickRef.current += 1;
      if (countryTickRef.current % 4 === 0) {
        setCountries((prev) => clamp(prev + 1, 40, 60));
      }
    }, 45e3);
    const uptimeInterval = setInterval(() => {
      setUptime((prev) => {
        const delta = Math.random() * 0.1 - 0.05;
        return parseFloat(clamp(prev + delta, 99.3, 99.7).toFixed(1));
      });
    }, 15e3);
    return () => {
      clearInterval(userInterval);
      clearInterval(processedInterval);
      clearInterval(countryInterval);
      clearInterval(uptimeInterval);
    };
  }, []);
  return {
    usersDisplay: formatUsers(users),
    processedDisplay: formatProcessed(processed),
    countriesDisplay: `${countries}+`,
    uptimeDisplay: `${uptime}%`,
    rawUsers: users
  };
}
const wrap$f = "_wrap_11yb9_1";
const stat$1 = "_stat_11yb9_8";
const value$2 = "_value_11yb9_14";
const label$9 = "_label_11yb9_24";
const styles$J = {
  wrap: wrap$f,
  stat: stat$1,
  value: value$2,
  label: label$9
};
function PlatformStatistics() {
  const { usersDisplay, processedDisplay, countriesDisplay } = useLiveStats();
  const STATS = [
    { value: usersDisplay, label: "Active Users" },
    { value: processedDisplay, label: "Processed" },
    { value: countriesDisplay, label: "Countries" }
  ];
  return /* @__PURE__ */ jsx("div", { className: styles$J.wrap, children: STATS.map((s) => /* @__PURE__ */ jsxs("div", { className: styles$J.stat, children: [
    /* @__PURE__ */ jsx("span", { className: styles$J.value, children: s.value }),
    /* @__PURE__ */ jsx("span", { className: styles$J.label, children: s.label })
  ] }, s.label)) });
}
const page$d = "_page_1oqyx_1";
const card$4 = "_card_1oqyx_36";
const trustPanel = "_trustPanel_1oqyx_87";
const styles$I = {
  page: page$d,
  card: card$4,
  trustPanel
};
async function loader$j({ request }) {
  const session = await parseSession(request);
  if (session) {
    return redirect("/dashboard");
  }
  return null;
}
const login = UNSAFE_withComponentProps(function LoginPage() {
  return /* @__PURE__ */ jsx("div", {
    className: styles$I.page,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles$I.card,
      children: [/* @__PURE__ */ jsx(LoginForm, {}), /* @__PURE__ */ jsxs("div", {
        className: styles$I.trustPanel,
        children: [/* @__PURE__ */ jsx(TrustIndicators, {}), /* @__PURE__ */ jsx(PlatformStatistics, {})]
      })]
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login,
  loader: loader$j
}, Symbol.toStringTag, { value: "Module" }));
const wrap$e = "_wrap_etk7s_1";
const backLink$1 = "_backLink_etk7s_7";
const heading$2 = "_heading_etk7s_21";
const subheading = "_subheading_etk7s_29";
const form$2 = "_form_etk7s_34";
const fieldGroup$6 = "_fieldGroup_etk7s_40";
const label$8 = "_label_etk7s_46";
const input$6 = "_input_etk7s_52";
const hint = "_hint_etk7s_73";
const termsRow$1 = "_termsRow_etk7s_78";
const termsLink$1 = "_termsLink_etk7s_95";
const submitBtn$3 = "_submitBtn_etk7s_104";
const loginPrompt = "_loginPrompt_etk7s_123";
const loginLink = "_loginLink_etk7s_129";
const errorBanner$1 = "_errorBanner_etk7s_139";
const passwordWrap = "_passwordWrap_etk7s_151";
const eyeBtn = "_eyeBtn_etk7s_161";
const styles$H = {
  wrap: wrap$e,
  backLink: backLink$1,
  heading: heading$2,
  subheading,
  form: form$2,
  fieldGroup: fieldGroup$6,
  label: label$8,
  input: input$6,
  hint,
  termsRow: termsRow$1,
  termsLink: termsLink$1,
  submitBtn: submitBtn$3,
  loginPrompt,
  loginLink,
  errorBanner: errorBanner$1,
  passwordWrap,
  eyeBtn
};
function RegistrationForm() {
  const navigate = useNavigate();
  const { login: login2 } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions to continue.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        // credentials: "include" ensures the Set-Cookie response from the server
        // is stored by the browser for subsequent authenticated requests.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      login2(data.user);
      navigate("/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$H.wrap, children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: styles$H.backLink, children: [
      /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
      " Back to home"
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: styles$H.heading, children: "Create Account" }),
      /* @__PURE__ */ jsx("p", { className: styles$H.subheading, children: "Start your journey with Heaven Card today" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: styles$H.form, onSubmit: handleSubmit, noValidate: true, children: [
      error && /* @__PURE__ */ jsxs("div", { className: styles$H.errorBanner, children: [
        /* @__PURE__ */ jsx(AlertCircle, { size: 15 }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$H.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$H.label, children: "Full Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$H.input,
            type: "text",
            placeholder: "Enter your full name",
            autoComplete: "name",
            value: name,
            onChange: (e) => setName(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$H.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$H.label, children: "Email Address" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$H.input,
            type: "email",
            placeholder: "you@example.com",
            autoComplete: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$H.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$H.label, children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: styles$H.passwordWrap, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$H.input,
              type: showPassword ? "text" : "password",
              placeholder: "Create a strong password",
              autoComplete: "new-password",
              value: password,
              onChange: (e) => setPassword(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: styles$H.eyeBtn,
              onClick: () => setShowPassword((v) => !v),
              "aria-label": showPassword ? "Hide password" : "Show password",
              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$H.hint, children: "Must be at least 8 characters long." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: styles$H.termsRow, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: agreed,
            onChange: (e) => setAgreed(e.target.checked)
          }
        ),
        /* @__PURE__ */ jsxs("span", { children: [
          "I have read and agree to the ",
          /* @__PURE__ */ jsx("a", { href: "#", className: styles$H.termsLink, children: "Terms & Conditions" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: styles$H.submitBtn, disabled: isLoading, children: isLoading ? "Creating account…" : "Create Account" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: styles$H.loginPrompt, children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: styles$H.loginLink, children: "Sign In" })
    ] })
  ] });
}
const wrap$d = "_wrap_m7izd_1";
const logoRow = "_logoRow_m7izd_7";
const logoImage$1 = "_logoImage_m7izd_13";
const logoText = "_logoText_m7izd_20";
const logoName = "_logoName_m7izd_25";
const logoTagline = "_logoTagline_m7izd_32";
const heading$1 = "_heading_m7izd_37";
const desc$1 = "_desc_m7izd_44";
const featureList$1 = "_featureList_m7izd_50";
const featureCard = "_featureCard_m7izd_56";
const featureIcon = "_featureIcon_m7izd_66";
const featureText = "_featureText_m7izd_76";
const featureTitle = "_featureTitle_m7izd_82";
const featureDesc = "_featureDesc_m7izd_88";
const paymentRow = "_paymentRow_m7izd_93";
const paymentLabel = "_paymentLabel_m7izd_99";
const paymentBadges = "_paymentBadges_m7izd_106";
const paymentBadge = "_paymentBadge_m7izd_106";
const styles$G = {
  wrap: wrap$d,
  logoRow,
  logoImage: logoImage$1,
  logoText,
  logoName,
  logoTagline,
  heading: heading$1,
  desc: desc$1,
  featureList: featureList$1,
  featureCard,
  featureIcon,
  featureText,
  featureTitle,
  featureDesc,
  paymentRow,
  paymentLabel,
  paymentBadges,
  paymentBadge
};
const FEATURES = [
  {
    icon: /* @__PURE__ */ jsx(Zap, { size: 20 }),
    color: "rgba(59,130,246,0.15)",
    textColor: "#3b82f6",
    title: "Lightning Fast",
    desc: "Instant card delivery after payment confirmation"
  },
  {
    icon: /* @__PURE__ */ jsx(Shield, { size: 20 }),
    color: "rgba(168,85,247,0.15)",
    textColor: "#a855f7",
    title: "Bank-Level Security",
    desc: "Advanced encryption for your peace of mind"
  },
  {
    icon: /* @__PURE__ */ jsx(CreditCard, { size: 20 }),
    color: "rgba(230,57,70,0.15)",
    textColor: "#e63946",
    title: "Multi-Payment",
    desc: "UPI, BTC, LTC, TON, and USDT supported"
  }
];
function RegistrationTrustSection() {
  return /* @__PURE__ */ jsxs("div", { className: styles$G.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$G.logoRow, children: [
      /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$G.logoImage }),
      /* @__PURE__ */ jsxs("div", { className: styles$G.logoText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$G.logoName, children: "Heaven Card" }),
        /* @__PURE__ */ jsx("span", { className: styles$G.logoTagline, children: "Next-Gen Payments" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: styles$G.heading, children: "Join 1,200+ Early Users on Heaven Card" }),
    /* @__PURE__ */ jsx("p", { className: styles$G.desc, children: "Experience the fastest way to purchase prepaid cards with instant delivery and secure payment processing." }),
    /* @__PURE__ */ jsx("div", { className: styles$G.featureList, children: FEATURES.map((f) => /* @__PURE__ */ jsxs("div", { className: styles$G.featureCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$G.featureIcon, style: { background: f.color, color: f.textColor }, children: f.icon }),
      /* @__PURE__ */ jsxs("div", { className: styles$G.featureText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$G.featureTitle, children: f.title }),
        /* @__PURE__ */ jsx("span", { className: styles$G.featureDesc, children: f.desc })
      ] })
    ] }, f.title)) }),
    /* @__PURE__ */ jsxs("div", { className: styles$G.paymentRow, children: [
      /* @__PURE__ */ jsx("span", { className: styles$G.paymentLabel, children: "Trusted Payment Methods" }),
      /* @__PURE__ */ jsx("div", { className: styles$G.paymentBadges, children: ["VISA", "Mastercard", "Crypto", "UPI"].map((m) => /* @__PURE__ */ jsx("span", { className: styles$G.paymentBadge, children: m }, m)) })
    ] })
  ] });
}
const wrap$c = "_wrap_11yb9_1";
const stat = "_stat_11yb9_8";
const value$1 = "_value_11yb9_14";
const label$7 = "_label_11yb9_24";
const styles$F = {
  wrap: wrap$c,
  stat,
  value: value$1,
  label: label$7
};
function UserStatistics() {
  const { usersDisplay, uptimeDisplay } = useLiveStats();
  const STATS = [
    { value: usersDisplay, label: "Users" },
    { value: uptimeDisplay, label: "Uptime" },
    { value: "12/7", label: "Support" }
    // static as requested
  ];
  return /* @__PURE__ */ jsx("div", { className: styles$F.wrap, children: STATS.map((s) => /* @__PURE__ */ jsxs("div", { className: styles$F.stat, children: [
    /* @__PURE__ */ jsx("span", { className: styles$F.value, children: s.value }),
    /* @__PURE__ */ jsx("span", { className: styles$F.label, children: s.label })
  ] }, s.label)) });
}
const page$c = "_page_3h2ku_1";
const card$3 = "_card_3h2ku_24";
const styles$E = {
  page: page$c,
  card: card$3
};
async function loader$i({ request }) {
  const session = await parseSession(request);
  if (session) {
    return redirect("/dashboard");
  }
  return null;
}
const register = UNSAFE_withComponentProps(function RegisterPage() {
  return /* @__PURE__ */ jsx("div", {
    className: styles$E.page,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles$E.card,
      children: [/* @__PURE__ */ jsx(RegistrationForm, {}), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx(RegistrationTrustSection, {}), /* @__PURE__ */ jsx(UserStatistics, {})]
      })]
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: register,
  loader: loader$i
}, Symbol.toStringTag, { value: "Module" }));
const page$b = "_page_115ps_1";
const backgroundGlow = "_backgroundGlow_115ps_12";
const container$3 = "_container_115ps_24";
const brandBadge = "_brandBadge_115ps_36";
const brandBadgeLogo = "_brandBadgeLogo_115ps_49";
const header$8 = "_header_115ps_55";
const title$a = "_title_115ps_59";
const subtitle$6 = "_subtitle_115ps_67";
const form$1 = "_form_115ps_74";
const inputGroup$1 = "_inputGroup_115ps_80";
const inputHint = "_inputHint_115ps_119";
const formFooter = "_formFooter_115ps_125";
const backLink = "_backLink_115ps_132";
const resetBtn$2 = "_resetBtn_115ps_143";
const tipBox = "_tipBox_115ps_168";
const errorBox = "_errorBox_115ps_175";
const successBox = "_successBox_115ps_185";
const titleInfo = "_titleInfo_115ps_190";
const subtitleInfo = "_subtitleInfo_115ps_197";
const bodyInfo = "_bodyInfo_115ps_203";
const resetBtnHero = "_resetBtnHero_115ps_208";
const styles$D = {
  page: page$b,
  backgroundGlow,
  container: container$3,
  brandBadge,
  brandBadgeLogo,
  header: header$8,
  title: title$a,
  subtitle: subtitle$6,
  form: form$1,
  inputGroup: inputGroup$1,
  inputHint,
  formFooter,
  backLink,
  resetBtn: resetBtn$2,
  tipBox,
  errorBox,
  successBox,
  titleInfo,
  subtitleInfo,
  bodyInfo,
  resetBtnHero
};
const resetPassword = UNSAFE_withComponentProps(function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [totalPurchases, setTotalPurchases] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[reset-password] Form submitted");
    if (lockedUntil && Date.now() < lockedUntil) {
      console.warn("[reset-password] Blocked: account locked");
      setError("Account locked. Please try again later.");
      return;
    }
    if (newPassword !== confirmPassword) {
      console.warn("[reset-password] Passwords mismatch");
      setError("Passwords do not match.");
      return;
    }
    console.log("[reset-password] Sending via API...");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          name,
          createdDate,
          walletBalance: parseFloat(walletBalance) || 0,
          totalPurchases: parseInt(totalPurchases, 10) || 0,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        throw new Error(data.error || "Recovery failed. Your details did not match our records.");
      }
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsx("main", {
      className: styles$D.page,
      children: /* @__PURE__ */ jsx("div", {
        className: styles$D.container,
        children: /* @__PURE__ */ jsxs("div", {
          className: styles$D.successBox,
          children: [/* @__PURE__ */ jsx(CheckCircle, {
            size: 48,
            color: "#f43f5e",
            style: {
              margin: "0 auto 1rem"
            }
          }), /* @__PURE__ */ jsx("h1", {
            className: styles$D.titleInfo,
            children: "Password Reset Successful"
          }), /* @__PURE__ */ jsx("p", {
            className: styles$D.subtitleInfo,
            children: "Your account has been secured."
          }), /* @__PURE__ */ jsx("p", {
            className: styles$D.bodyInfo,
            children: "You may now log in with your new credentials."
          }), /* @__PURE__ */ jsx(Link, {
            to: "/login",
            className: styles$D.resetBtnHero,
            style: {
              display: "inline-block",
              marginTop: "2rem",
              textDecoration: "none"
            },
            children: "Return to Login"
          })]
        })
      })
    });
  }
  return /* @__PURE__ */ jsxs("main", {
    className: styles$D.page,
    children: [/* @__PURE__ */ jsx("div", {
      className: styles$D.backgroundGlow
    }), /* @__PURE__ */ jsxs("div", {
      className: styles$D.container,
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles$D.header,
        children: [/* @__PURE__ */ jsxs("div", {
          className: styles$D.brandBadge,
          children: [/* @__PURE__ */ jsx("img", {
            src: "/logo.png?v=2",
            alt: "Heaven Card logo",
            className: styles$D.brandBadgeLogo
          }), "Secure Account Recovery"]
        }), /* @__PURE__ */ jsx("h1", {
          className: styles$D.title,
          children: "Reset your password"
        }), /* @__PURE__ */ jsx("p", {
          className: styles$D.subtitle,
          children: "Please answer a few account questions for identity verification."
        })]
      }), /* @__PURE__ */ jsxs("form", {
        className: styles$D.form,
        onSubmit: handleSubmit,
        children: [error && /* @__PURE__ */ jsx("div", {
          className: styles$D.errorBox,
          children: error
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Email"
          }), /* @__PURE__ */ jsx("input", {
            type: "email",
            required: true,
            placeholder: "you@example.com",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            disabled: loading || !!lockedUntil
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Full name (as on account)"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            required: true,
            placeholder: "John Doe",
            value: name,
            onChange: (e) => setName(e.target.value),
            disabled: loading || !!lockedUntil
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Account created date (YYYY-MM-DD)"
          }), /* @__PURE__ */ jsx("input", {
            type: "date",
            required: true,
            value: createdDate,
            onChange: (e) => setCreatedDate(e.target.value),
            disabled: loading || !!lockedUntil
          }), /* @__PURE__ */ jsx("span", {
            className: styles$D.inputHint,
            children: "Enter the date when you first registered your account."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Account balance (USD)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            step: "0.01",
            min: "0",
            required: true,
            placeholder: "e.g. 12.34",
            value: walletBalance,
            onChange: (e) => setWalletBalance(e.target.value),
            disabled: loading || !!lockedUntil
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Total purchases (USD / Order Count)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            min: "0",
            required: true,
            placeholder: "e.g. 3",
            value: totalPurchases,
            onChange: (e) => setTotalPurchases(e.target.value),
            disabled: loading || !!lockedUntil
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "New password"
          }), /* @__PURE__ */ jsx("input", {
            type: "password",
            required: true,
            placeholder: "Minimum 8 characters",
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
            disabled: loading || !!lockedUntil,
            minLength: 8
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.inputGroup,
          children: [/* @__PURE__ */ jsx("label", {
            children: "Confirm password"
          }), /* @__PURE__ */ jsx("input", {
            type: "password",
            required: true,
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            disabled: loading || !!lockedUntil,
            minLength: 8
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$D.formFooter,
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/login",
            className: styles$D.backLink,
            children: "Back to login"
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            className: styles$D.resetBtn,
            disabled: loading || !!lockedUntil,
            children: loading ? "Verifying..." : lockedUntil ? "Account Locked" : "Reset password"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: styles$D.tipBox,
          children: "Tip: We match email, full name, account creation date, USD wallet balance, and total purchases (up to 2 decimals)."
        })]
      })]
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: resetPassword
}, Symbol.toStringTag, { value: "Module" }));
const page$a = "_page_hkt7m_1";
const inner$5 = "_inner_hkt7m_6";
const topBar = "_topBar_hkt7m_12";
const headerTitleGroup = "_headerTitleGroup_hkt7m_19";
const iconCircle = "_iconCircle_hkt7m_25";
const title$9 = "_title_hkt7m_36";
const subtitle$5 = "_subtitle_hkt7m_46";
const backBtn$3 = "_backBtn_hkt7m_52";
const cardContainer = "_cardContainer_hkt7m_69";
const ticketsWidgetContainer = "_ticketsWidgetContainer_hkt7m_70";
const cardHeader$1 = "_cardHeader_hkt7m_101";
const ticketsWidgetHeader = "_ticketsWidgetHeader_hkt7m_102";
const cardHeaderLeft = "_cardHeaderLeft_hkt7m_111";
const cardTitle = "_cardTitle_hkt7m_117";
const replyBadge = "_replyBadge_hkt7m_124";
const ticketTotal = "_ticketTotal_hkt7m_134";
const form = "_form_hkt7m_139";
const errorBanner = "_errorBanner_hkt7m_145";
const successBanner = "_successBanner_hkt7m_160";
const inputGroup = "_inputGroup_hkt7m_172";
const requiredStar = "_requiredStar_hkt7m_187";
const selectWrapper = "_selectWrapper_hkt7m_191";
const selectIcon = "_selectIcon_hkt7m_195";
const fileUploadWrapper = "_fileUploadWrapper_hkt7m_226";
const chooseFileBtn = "_chooseFileBtn_hkt7m_236";
const fileNameText = "_fileNameText_hkt7m_254";
const uploadHint = "_uploadHint_hkt7m_263";
const submitBtn$2 = "_submitBtn_hkt7m_269";
const quickTipsBox = "_quickTipsBox_hkt7m_296";
const tipsTitle = "_tipsTitle_hkt7m_304";
const tipsList = "_tipsList_hkt7m_311";
const dangerTip = "_dangerTip_hkt7m_319";
const ticketList = "_ticketList_hkt7m_325";
const emptyState$2 = "_emptyState_hkt7m_331";
const emptyText = "_emptyText_hkt7m_336";
const skeletonContainer = "_skeletonContainer_hkt7m_342";
const skeletonLine = "_skeletonLine_hkt7m_348";
const pulse = "_pulse_hkt7m_1";
const ticketItem = "_ticketItem_hkt7m_361";
const ticketSummary = "_ticketSummary_hkt7m_369";
const ticketSubjectContainer = "_ticketSubjectContainer_hkt7m_377";
const ticketSubject = "_ticketSubject_hkt7m_377";
const ticketType = "_ticketType_hkt7m_389";
const ticketRight = "_ticketRight_hkt7m_394";
const statusBadge$1 = "_statusBadge_hkt7m_401";
const open = "_open_hkt7m_408";
const answered = "_answered_hkt7m_413";
const closed = "_closed_hkt7m_418";
const ticketDetails = "_ticketDetails_hkt7m_423";
const detailRow = "_detailRow_hkt7m_432";
const detailLabel = "_detailLabel_hkt7m_439";
const detailValue = "_detailValue_hkt7m_443";
const messageBlock = "_messageBlock_hkt7m_447";
const messageText = "_messageText_hkt7m_453";
const screenshotPreview = "_screenshotPreview_hkt7m_460";
const replyBlock = "_replyBlock_hkt7m_480";
const replyLabel = "_replyLabel_hkt7m_487";
const replyText = "_replyText_hkt7m_494";
const styles$C = {
  page: page$a,
  inner: inner$5,
  topBar,
  headerTitleGroup,
  iconCircle,
  title: title$9,
  subtitle: subtitle$5,
  backBtn: backBtn$3,
  cardContainer,
  ticketsWidgetContainer,
  cardHeader: cardHeader$1,
  ticketsWidgetHeader,
  cardHeaderLeft,
  cardTitle,
  replyBadge,
  ticketTotal,
  form,
  errorBanner,
  successBanner,
  inputGroup,
  requiredStar,
  selectWrapper,
  selectIcon,
  fileUploadWrapper,
  chooseFileBtn,
  fileNameText,
  uploadHint,
  submitBtn: submitBtn$2,
  quickTipsBox,
  tipsTitle,
  tipsList,
  dangerTip,
  ticketList,
  emptyState: emptyState$2,
  emptyText,
  skeletonContainer,
  skeletonLine,
  pulse,
  ticketItem,
  ticketSummary,
  ticketSubjectContainer,
  ticketSubject,
  ticketType,
  ticketRight,
  statusBadge: statusBadge$1,
  open,
  answered,
  closed,
  ticketDetails,
  detailRow,
  detailLabel,
  detailValue,
  messageBlock,
  messageText,
  screenshotPreview,
  replyBlock,
  replyLabel,
  replyText
};
const support = UNSAFE_withComponentProps(function SupportPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    fetch("/api/login", {
      credentials: "include"
    }).then((res) => res.json()).then((data) => {
      setAuthenticated(Boolean(data.authenticated));
    }).catch(console.error).finally(() => setAuthChecked(true));
  }, []);
  useEffect(() => {
    if (!authChecked || !authenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/support", {
      credentials: "include"
    }).then((res) => res.json()).then((data) => {
      if (data.tickets) {
        setTickets(data.tickets);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [authChecked, authenticated]);
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFormError("Screenshot must be less than 5MB.");
      setFile(null);
      return;
    }
    setFile(selected);
    setFormError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[support] Submit ticket clicked");
    setFormError("");
    setFormSuccess(false);
    if (!issueType) {
      setFormError("Please select an Issue Type");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("issueType", issueType);
      formData.append("subject", subject);
      formData.append("message", message);
      if (file) formData.append("screenshot", file);
      const res = await fetch("/api/support", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      console.log("[support] API response received");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket.");
      setTickets([data.ticket, ...tickets]);
      setIssueType("");
      setSubject("");
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormSuccess(true);
    } catch (err) {
      if (err instanceof Error) setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", {
    className: styles$C.page,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles$C.inner,
      children: [/* @__PURE__ */ jsxs("div", {
        className: styles$C.topBar,
        children: [/* @__PURE__ */ jsxs("div", {
          className: styles$C.headerTitleGroup,
          children: [/* @__PURE__ */ jsx("div", {
            className: styles$C.iconCircle,
            children: /* @__PURE__ */ jsx(HelpCircle, {
              size: 22,
              color: "#f43f5e"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h1", {
              className: styles$C.title,
              children: "Support Center"
            }), /* @__PURE__ */ jsx("p", {
              className: styles$C.subtitle,
              children: "Get Help"
            })]
          })]
        }), /* @__PURE__ */ jsx(Link, {
          to: authenticated ? "/dashboard" : "/",
          className: styles$C.backBtn,
          children: /* @__PURE__ */ jsx(ArrowLeft, {
            size: 18
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: styles$C.cardContainer,
        children: [/* @__PURE__ */ jsxs("div", {
          className: styles$C.cardHeader,
          children: [/* @__PURE__ */ jsxs("div", {
            className: styles$C.cardHeaderLeft,
            children: [/* @__PURE__ */ jsx(Ticket, {
              size: 20,
              color: "#f43f5e"
            }), /* @__PURE__ */ jsx("h2", {
              className: styles$C.cardTitle,
              children: "New Ticket"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: styles$C.replyBadge,
            children: "Avg. reply: ~30min"
          })]
        }), /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: styles$C.form,
          children: [!authChecked ? /* @__PURE__ */ jsx("div", {
            className: styles$C.errorBanner,
            children: "Checking session…"
          }) : !authenticated ? /* @__PURE__ */ jsxs("div", {
            className: styles$C.errorBanner,
            children: ["Please ", /* @__PURE__ */ jsx(Link, {
              to: "/login",
              children: "log in"
            }), " or ", /* @__PURE__ */ jsx(Link, {
              to: "/register",
              children: "register"
            }), " to submit a ticket and view your history."]
          }) : null, formError && /* @__PURE__ */ jsx("div", {
            className: styles$C.errorBanner,
            children: formError
          }), formSuccess && /* @__PURE__ */ jsxs("div", {
            className: styles$C.successBanner,
            children: [/* @__PURE__ */ jsx(CheckCircle, {
              size: 16
            }), " Ticket accurately submitted for review"]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$C.inputGroup,
            children: [/* @__PURE__ */ jsxs("label", {
              children: ["Issue Type ", /* @__PURE__ */ jsx("span", {
                className: styles$C.requiredStar,
                children: "*"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: styles$C.selectWrapper,
              children: [/* @__PURE__ */ jsxs("select", {
                value: issueType,
                onChange: (e) => setIssueType(e.target.value),
                required: true,
                disabled: !authenticated,
                children: [/* @__PURE__ */ jsx("option", {
                  value: "",
                  disabled: true,
                  children: "-- Select Issue Type --"
                }), /* @__PURE__ */ jsx("option", {
                  value: "Deposit Issue",
                  children: "Deposit Issue"
                }), /* @__PURE__ */ jsx("option", {
                  value: "Card Purchase",
                  children: "Card Purchase Issue"
                }), /* @__PURE__ */ jsx("option", {
                  value: "Account Access",
                  children: "Account Access"
                }), /* @__PURE__ */ jsx("option", {
                  value: "Bug Report",
                  children: "Bug Report"
                }), /* @__PURE__ */ jsx("option", {
                  value: "Other",
                  children: "Other General Issue"
                })]
              }), /* @__PURE__ */ jsx(ChevronDown, {
                className: styles$C.selectIcon,
                size: 16
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$C.inputGroup,
            children: [/* @__PURE__ */ jsxs("label", {
              children: ["Subject ", /* @__PURE__ */ jsx("span", {
                className: styles$C.requiredStar,
                children: "*"
              })]
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              placeholder: "Brief description of your issue",
              value: subject,
              onChange: (e) => setSubject(e.target.value),
              required: true,
              maxLength: 100,
              disabled: !authenticated
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$C.inputGroup,
            children: [/* @__PURE__ */ jsxs("label", {
              children: ["Message ", /* @__PURE__ */ jsx("span", {
                className: styles$C.requiredStar,
                children: "*"
              })]
            }), /* @__PURE__ */ jsx("textarea", {
              placeholder: "Describe your issue in detail...",
              value: message,
              onChange: (e) => setMessage(e.target.value),
              required: true,
              rows: 5,
              disabled: !authenticated
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$C.inputGroup,
            children: [/* @__PURE__ */ jsx("label", {
              children: "Screenshot"
            }), /* @__PURE__ */ jsxs("div", {
              className: styles$C.fileUploadWrapper,
              children: [/* @__PURE__ */ jsxs("button", {
                type: "button",
                className: styles$C.chooseFileBtn,
                onClick: () => fileInputRef.current?.click(),
                disabled: !authenticated,
                children: [/* @__PURE__ */ jsx(Camera, {
                  size: 16
                }), " Choose file"]
              }), /* @__PURE__ */ jsx("span", {
                className: styles$C.fileNameText,
                children: file ? file.name : "No file chosen"
              }), /* @__PURE__ */ jsx("input", {
                type: "file",
                ref: fileInputRef,
                accept: "image/*",
                onChange: handleFileChange,
                style: {
                  display: "none"
                }
              })]
            }), /* @__PURE__ */ jsx("span", {
              className: styles$C.uploadHint,
              children: "Optional: Attach payment screenshot or error image"
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: submitting || !authenticated,
            className: styles$C.submitBtn,
            children: submitting ? "Submitting..." : /* @__PURE__ */ jsx(Fragment, {
              children: "🚀 Submit Ticket"
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: styles$C.quickTipsBox,
          children: [/* @__PURE__ */ jsx("h4", {
            className: styles$C.tipsTitle,
            children: "💡 Quick Tips:"
          }), /* @__PURE__ */ jsxs("ul", {
            className: styles$C.tipsList,
            children: [/* @__PURE__ */ jsxs("li", {
              children: [/* @__PURE__ */ jsx("strong", {
                children: "Transaction ID:"
              }), ' Found in "Wallet History" page']
            }), /* @__PURE__ */ jsx("li", {
              children: "Copy the exact ID number from wallet (e.g., 972446)"
            }), /* @__PURE__ */ jsx("li", {
              className: styles$C.dangerTip,
              children: /* @__PURE__ */ jsx("strong", {
                children: "Do NOT add # symbol"
              })
            }), /* @__PURE__ */ jsx("li", {
              children: "Always attach payment screenshot"
            }), /* @__PURE__ */ jsx("li", {
              children: "Response time: 15-30 minutes"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: styles$C.ticketsWidgetContainer,
        children: [/* @__PURE__ */ jsxs("div", {
          className: styles$C.ticketsWidgetHeader,
          children: [/* @__PURE__ */ jsxs("div", {
            className: styles$C.cardHeaderLeft,
            children: [/* @__PURE__ */ jsx(Activity, {
              size: 20,
              color: "#f43f5e"
            }), /* @__PURE__ */ jsx("h2", {
              className: styles$C.cardTitle,
              children: "My Tickets"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$C.ticketTotal,
            children: ["Total: ", tickets.length]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: styles$C.ticketList,
          children: loading ? /* @__PURE__ */ jsxs("div", {
            className: styles$C.skeletonContainer,
            children: [/* @__PURE__ */ jsx("div", {
              className: styles$C.skeletonLine
            }), /* @__PURE__ */ jsx("div", {
              className: styles$C.skeletonLine
            })]
          }) : !authenticated ? /* @__PURE__ */ jsx("div", {
            className: styles$C.emptyState,
            children: /* @__PURE__ */ jsx("p", {
              className: styles$C.emptyText,
              children: "Log in to see your tickets."
            })
          }) : tickets.length === 0 ? /* @__PURE__ */ jsx("div", {
            className: styles$C.emptyState,
            children: /* @__PURE__ */ jsx("p", {
              className: styles$C.emptyText,
              children: "You haven't opened any support tickets yet."
            })
          }) : tickets.map((ticket) => /* @__PURE__ */ jsxs("div", {
            className: styles$C.ticketItem,
            children: [/* @__PURE__ */ jsxs("div", {
              className: styles$C.ticketSummary,
              onClick: () => setExpandedId(expandedId === ticket.id ? null : ticket.id),
              children: [/* @__PURE__ */ jsx("div", {
                className: styles$C.ticketLeft,
                children: /* @__PURE__ */ jsxs("div", {
                  className: styles$C.ticketSubjectContainer,
                  children: [/* @__PURE__ */ jsx("div", {
                    className: styles$C.ticketSubject,
                    children: ticket.subject
                  }), /* @__PURE__ */ jsx("div", {
                    className: styles$C.ticketType,
                    children: ticket.issue_type
                  })]
                })
              }), /* @__PURE__ */ jsxs("div", {
                className: styles$C.ticketRight,
                children: [/* @__PURE__ */ jsx("span", {
                  className: `${styles$C.statusBadge} ${styles$C[ticket.status]}`,
                  children: /* @__PURE__ */ jsx("span", {
                    style: {
                      textTransform: "capitalize"
                    },
                    children: ticket.status
                  })
                }), expandedId === ticket.id ? /* @__PURE__ */ jsx(ChevronUp, {
                  size: 16
                }) : /* @__PURE__ */ jsx(ChevronDown, {
                  size: 16
                })]
              })]
            }), expandedId === ticket.id && /* @__PURE__ */ jsxs("div", {
              className: styles$C.ticketDetails,
              children: [/* @__PURE__ */ jsxs("div", {
                className: styles$C.detailRow,
                children: [/* @__PURE__ */ jsx("span", {
                  className: styles$C.detailLabel,
                  children: "Ticket ID:"
                }), /* @__PURE__ */ jsx("span", {
                  className: styles$C.detailValue,
                  children: ticket.id
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: styles$C.detailRow,
                children: [/* @__PURE__ */ jsx("span", {
                  className: styles$C.detailLabel,
                  children: "Created:"
                }), /* @__PURE__ */ jsx("span", {
                  className: styles$C.detailValue,
                  children: new Date(ticket.created_at).toLocaleString()
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: styles$C.messageBlock,
                children: [/* @__PURE__ */ jsx("div", {
                  className: styles$C.messageText,
                  children: ticket.message
                }), ticket.screenshot_url && /* @__PURE__ */ jsx("div", {
                  className: styles$C.screenshotPreview,
                  children: /* @__PURE__ */ jsxs("a", {
                    href: ticket.screenshot_url,
                    target: "_blank",
                    rel: "noreferrer",
                    children: [/* @__PURE__ */ jsx(Camera, {
                      size: 14,
                      style: {
                        marginRight: 4
                      }
                    }), "View Attached Screenshot"]
                  })
                })]
              }), ticket.admin_reply && /* @__PURE__ */ jsxs("div", {
                className: styles$C.replyBlock,
                children: [/* @__PURE__ */ jsx("div", {
                  className: styles$C.replyLabel,
                  children: "Admin Reply:"
                }), /* @__PURE__ */ jsx("div", {
                  className: styles$C.replyText,
                  children: ticket.admin_reply
                })]
              })]
            })]
          }, ticket.id))
        })]
      })]
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: support
}, Symbol.toStringTag, { value: "Module" }));
function loader$h({
  request
}) {
  const u = new URL(request.url);
  u.pathname = "/";
  u.hash = "features";
  return Response.redirect(u.toString(), 302);
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$h
}, Symbol.toStringTag, { value: "Module" }));
function loader$g({
  request
}) {
  const u = new URL(request.url);
  u.pathname = "/";
  u.hash = "cards";
  return Response.redirect(u.toString(), 302);
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$g
}, Symbol.toStringTag, { value: "Module" }));
const header$7 = "_header_rys86_7";
const brandBar = "_brandBar_rys86_22";
const brand$1 = "_brand_rys86_22";
const brandImage = "_brandImage_rys86_38";
const brandText$1 = "_brandText_rys86_46";
const brandName$1 = "_brandName_rys86_52";
const brandSub$1 = "_brandSub_rys86_59";
const navPanel = "_navPanel_rys86_65";
const panelLabel = "_panelLabel_rys86_70";
const btnGrid = "_btnGrid_rys86_81";
const navBtn$1 = "_navBtn_rys86_89";
const btnIcon = "_btnIcon_rys86_125";
const btnLabel = "_btnLabel_rys86_131";
const navBtnActive = "_navBtnActive_rys86_136";
const accentDashboard = "_accentDashboard_rys86_146";
const accentDeposit = "_accentDeposit_rys86_155";
const accentHistory = "_accentHistory_rys86_164";
const accentOrders = "_accentOrders_rys86_173";
const accentShop = "_accentShop_rys86_182";
const accentValid = "_accentValid_rys86_191";
const accentSupport = "_accentSupport_rys86_200";
const accentLogout = "_accentLogout_rys86_209";
const styles$B = {
  header: header$7,
  brandBar,
  brand: brand$1,
  brandImage,
  brandText: brandText$1,
  brandName: brandName$1,
  brandSub: brandSub$1,
  navPanel,
  panelLabel,
  btnGrid,
  navBtn: navBtn$1,
  btnIcon,
  btnLabel,
  navBtnActive,
  accentDashboard,
  accentDeposit,
  accentHistory,
  accentOrders,
  accentShop,
  accentValid,
  accentSupport,
  accentLogout
};
const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    accentClass: "accentDashboard"
  },
  {
    to: "/deposit",
    label: "Deposit",
    icon: ArrowDownToLine,
    accentClass: "accentDeposit"
  },
  {
    to: "/history",
    label: "History",
    icon: History,
    accentClass: "accentHistory"
  },
  {
    to: "/orders",
    label: "Orders",
    icon: Package,
    accentClass: "accentOrders"
  },
  {
    to: "/cards",
    label: "Shop",
    icon: ShoppingBag,
    accentClass: "accentShop"
  },
  {
    to: "/valid-guarantee",
    label: "100% Valid",
    icon: ShieldCheck,
    accentClass: "accentValid"
  },
  {
    to: "/support",
    label: "Support",
    icon: LifeBuoy,
    accentClass: "accentSupport"
  }
];
function DashboardTopNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const isActive = (to) => to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);
  return /* @__PURE__ */ jsxs("header", { className: styles$B.header, children: [
    /* @__PURE__ */ jsx("div", { className: styles$B.brandBar, children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: `${styles$B.brand} logo`, children: [
      /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$B.brandImage }),
      /* @__PURE__ */ jsxs("div", { className: styles$B.brandText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$B.brandName, children: "Heaven Card" }),
        /* @__PURE__ */ jsx("span", { className: styles$B.brandSub, children: "Manage your cards & wallet" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("nav", { className: styles$B.navPanel, "aria-label": "Dashboard navigation", children: [
      /* @__PURE__ */ jsx("p", { className: styles$B.panelLabel, children: "Quick Navigation" }),
      /* @__PURE__ */ jsxs("div", { className: styles$B.btnGrid, children: [
        NAV_ITEMS.map(({ to, label: label2, icon: Icon, accentClass }) => /* @__PURE__ */ jsxs(
          Link,
          {
            to,
            className: [
              styles$B.navBtn,
              styles$B[accentClass],
              isActive(to) ? styles$B.navBtnActive : ""
            ].filter(Boolean).join(" "),
            "aria-current": isActive(to) ? "page" : void 0,
            children: [
              /* @__PURE__ */ jsx("span", { className: styles$B.btnIcon, children: /* @__PURE__ */ jsx(Icon, { size: 18, strokeWidth: 2 }) }),
              /* @__PURE__ */ jsx("span", { className: styles$B.btnLabel, children: label2 })
            ]
          },
          to
        )),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `${styles$B.navBtn} ${styles$B.accentLogout}`,
            onClick: handleLogout,
            type: "button",
            children: [
              /* @__PURE__ */ jsx("span", { className: styles$B.btnIcon, children: /* @__PURE__ */ jsx(LogOut, { size: 18, strokeWidth: 2 }) }),
              /* @__PURE__ */ jsx("span", { className: styles$B.btnLabel, children: "Logout" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
const overlay$1 = "_overlay_fj7zq_1";
const modal$1 = "_modal_fj7zq_14";
const header$6 = "_header_fj7zq_30";
const headerIcon$2 = "_headerIcon_fj7zq_39";
const headerText = "_headerText_fj7zq_50";
const headerTitle = "_headerTitle_fj7zq_54";
const headerSubtitle = "_headerSubtitle_fj7zq_62";
const closeBtn$1 = "_closeBtn_fj7zq_67";
const body = "_body_fj7zq_86";
const bodyText = "_bodyText_fj7zq_90";
const deadlineBanner = "_deadlineBanner_fj7zq_97";
const deadlineIcon = "_deadlineIcon_fj7zq_108";
const deadlineContent = "_deadlineContent_fj7zq_119";
const deadlineTitle = "_deadlineTitle_fj7zq_125";
const deadlineDesc = "_deadlineDesc_fj7zq_131";
const featureList = "_featureList_fj7zq_137";
const featureItem = "_featureItem_fj7zq_144";
const featureCheck = "_featureCheck_fj7zq_152";
const actions = "_actions_fj7zq_157";
const topUpBtn = "_topUpBtn_fj7zq_162";
const remindBtn = "_remindBtn_fj7zq_183";
const styles$A = {
  overlay: overlay$1,
  modal: modal$1,
  header: header$6,
  headerIcon: headerIcon$2,
  headerText,
  headerTitle,
  headerSubtitle,
  closeBtn: closeBtn$1,
  body,
  bodyText,
  deadlineBanner,
  deadlineIcon,
  deadlineContent,
  deadlineTitle,
  deadlineDesc,
  featureList,
  featureItem,
  featureCheck,
  actions,
  topUpBtn,
  remindBtn
};
const REMIND_KEY = "cc_shop_popup_remind_until";
const REMIND_SCOPE_KEY = "cc_shop_popup_remind_scope";
const ZERO_AT_KEY = "cc_shop_last_balance_zero_at";
const FIRST_SEEN_KEY = "cc_shop_first_seen_at";
const REMIND_MS = 2 * 60 * 60 * 1e3;
const DAY_MS = 24 * 60 * 60 * 1e3;
const NEW_USER_DAYS = 5;
const EXISTING_USER_AGE_THRESHOLD_DAYS = 7;
const EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS = 7;
function formatRemainingDays(ms) {
  const remainingDays = Math.max(0, Math.ceil(ms / DAY_MS));
  return `${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
}
function readNumber(value2) {
  if (!value2) return null;
  const n = Number(value2);
  return Number.isFinite(n) ? n : null;
}
function ActionRequiredModal() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scope, setScope] = useState("failsafe");
  const [remainingMs, setRemainingMs] = useState(0);
  const [reminded, setReminded] = useState(false);
  useEffect(() => {
    let mounted = true;
    const syncLifecycle = async (trigger) => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!mounted || !res.ok) {
          setIsVisible(false);
          return;
        }
        const data = await res.json();
        const userId2 = data.id ?? "unknown";
        const now = Date.now();
        const walletFromCents = typeof data.walletUsd === "number" ? data.walletUsd / 100 : NaN;
        const walletFromDisplay = typeof data.walletDisplay === "string" ? Number(data.walletDisplay) : NaN;
        const balance = Number.isFinite(walletFromCents) ? walletFromCents : Number.isFinite(walletFromDisplay) ? walletFromDisplay : NaN;
        const serverCreatedAt = typeof data.createdAt === "number" ? data.createdAt : null;
        const firstSeenStorageKey = `${FIRST_SEEN_KEY}:${userId2}`;
        const existingFirstSeen = readNumber(localStorage.getItem(firstSeenStorageKey));
        const firstSeenAt = serverCreatedAt ?? existingFirstSeen ?? now;
        if (!existingFirstSeen) localStorage.setItem(firstSeenStorageKey, String(firstSeenAt));
        const accountAgeDays = Math.floor((now - firstSeenAt) / DAY_MS);
        const isZeroBalance = Number.isFinite(balance) ? balance === 0 : true;
        const zeroStorageKey = `${ZERO_AT_KEY}:${userId2}`;
        const serverZeroAt = data.lastBalanceZeroAt;
        let lastBalanceZeroAt = typeof serverZeroAt === "number" ? serverZeroAt : readNumber(localStorage.getItem(zeroStorageKey));
        if (isZeroBalance && !lastBalanceZeroAt) {
          lastBalanceZeroAt = now;
          localStorage.setItem(zeroStorageKey, String(lastBalanceZeroAt));
        } else if (!isZeroBalance && lastBalanceZeroAt) {
          localStorage.removeItem(zeroStorageKey);
          lastBalanceZeroAt = null;
        }
        let nextScope = "failsafe";
        let shouldShow = false;
        let nextRemainingMs = EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS;
        if (isZeroBalance && accountAgeDays <= NEW_USER_DAYS) {
          nextScope = "new_user";
          shouldShow = true;
          nextRemainingMs = Math.max(0, NEW_USER_DAYS * DAY_MS - (now - firstSeenAt));
        } else if (isZeroBalance && accountAgeDays > EXISTING_USER_AGE_THRESHOLD_DAYS) {
          nextScope = "existing_user";
          shouldShow = true;
          const ref = lastBalanceZeroAt ?? now;
          nextRemainingMs = Math.max(0, EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS - (now - ref));
        } else if (!Number.isFinite(balance) || !firstSeenAt) {
          nextScope = "failsafe";
          shouldShow = true;
        } else {
          shouldShow = false;
        }
        if (data.accountLifecycle?.showPopup === true && !shouldShow) {
          shouldShow = true;
          nextRemainingMs = Math.max(0, data.accountLifecycle.remainingMs ?? nextRemainingMs);
          nextScope = accountAgeDays <= NEW_USER_DAYS ? "new_user" : "existing_user";
        }
        if (!shouldShow) {
          setIsVisible(false);
          localStorage.removeItem(REMIND_KEY);
          localStorage.removeItem(REMIND_SCOPE_KEY);
          return;
        }
        setScope(nextScope);
        setRemainingMs(nextRemainingMs);
        setIsVisible(true);
        const remindUntil = Number(localStorage.getItem(REMIND_KEY) ?? "0");
        const remindScope = localStorage.getItem(REMIND_SCOPE_KEY);
        setReminded(remindUntil > now && remindScope === nextScope);
        console.log("[deposit-popup]", {
          trigger,
          userType: nextScope,
          balance,
          daysRemaining: Math.ceil(nextRemainingMs / DAY_MS),
          popupTriggerStatus: shouldShow
        });
      } catch {
        if (!mounted) return;
        setScope("failsafe");
        setRemainingMs(EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS * DAY_MS);
        setIsVisible(true);
        setReminded(false);
        console.log("[deposit-popup]", {
          trigger,
          userType: "failsafe",
          balance: "unknown",
          daysRemaining: EXISTING_USER_ZERO_BALANCE_LIMIT_DAYS,
          popupTriggerStatus: true
        });
      }
    };
    void syncLifecycle("mount_or_route_change");
    const pollId = window.setInterval(() => void syncLifecycle("poll"), 15e3);
    const onFocus = () => {
      void syncLifecycle("window_focus");
    };
    window.addEventListener("focus", onFocus);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);
  useEffect(() => {
    if (!isVisible || reminded) return;
    const id = window.setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 1e3));
    }, 1e3);
    return () => window.clearInterval(id);
  }, [isVisible, reminded]);
  useEffect(() => {
    if (!isVisible || reminded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible, reminded]);
  const copy = useMemo(() => {
    if (scope === "new_user") {
      return {
        title: "Action Required - Deposit Needed",
        message: "You must deposit within 5 days or your account may be removed."
      };
    }
    if (scope === "existing_user") {
      return {
        title: "Action Required - Deposit Needed",
        message: "Your balance is empty. Deposit within 7 days to keep your account active."
      };
    }
    return {
      title: "Warning - Deposit Required",
      message: "We could not confirm account status. Deposit now to keep your account active."
    };
  }, [scope]);
  const handleRemindLater = () => {
    const until = Date.now() + REMIND_MS;
    localStorage.setItem(REMIND_KEY, String(until));
    localStorage.setItem(REMIND_SCOPE_KEY, scope);
    setReminded(true);
  };
  if (!isVisible || reminded) return null;
  return /* @__PURE__ */ jsx("div", { className: styles$A.overlay, role: "dialog", "aria-modal": "true", "aria-label": "Deposit required", children: /* @__PURE__ */ jsxs("div", { className: styles$A.modal, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$A.header, children: [
      /* @__PURE__ */ jsx("div", { className: styles$A.headerIcon, children: /* @__PURE__ */ jsx(TriangleAlert, { size: 20, color: "#ff2e2e" }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$A.headerText, children: [
        /* @__PURE__ */ jsx("div", { className: styles$A.headerTitle, children: copy.title }),
        /* @__PURE__ */ jsx("div", { className: styles$A.headerSubtitle, children: copy.message })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles$A.closeBtn, onClick: handleRemindLater, "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$A.body, children: [
      /* @__PURE__ */ jsx("p", { className: styles$A.bodyText, children: copy.message }),
      /* @__PURE__ */ jsxs("div", { className: styles$A.deadlineBanner, children: [
        /* @__PURE__ */ jsx("div", { className: styles$A.deadlineIcon, children: /* @__PURE__ */ jsx(Clock, { size: 16, color: "#ff2e2e" }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$A.deadlineContent, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$A.deadlineTitle, children: [
            "Remaining Time: ",
            formatRemainingDays(remainingMs)
          ] }),
          /* @__PURE__ */ jsx("div", { className: styles$A.deadlineDesc, children: "Countdown is recalculated on every login, refresh, and route change." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$A.featureList, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$A.featureItem, children: [
          /* @__PURE__ */ jsx(CheckCircle, { size: 16, className: styles$A.featureCheck }),
          "Secure Payment and crypto supported"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$A.featureItem, children: [
          /* @__PURE__ */ jsx(CheckCircle, { size: 16, className: styles$A.featureCheck }),
          "Secure wallet credit with real-time confirmation"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$A.featureItem, children: [
          /* @__PURE__ */ jsx(CheckCircle, { size: 16, className: styles$A.featureCheck }),
          "Minimum deposit shown at checkout"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$A.actions, children: [
        /* @__PURE__ */ jsx(Link, { to: "/deposit", className: styles$A.topUpBtn, children: "Deposit Now" }),
        /* @__PURE__ */ jsx("button", { className: styles$A.remindBtn, onClick: handleRemindLater, children: "Remind Me Later" })
      ] })
    ] })
  ] }) });
}
const url = (getServerEnv("SUPABASE_URL") ?? "").trim();
const serviceKey = (getServerEnv("SUPABASE_SERVICE_KEY") ?? "").trim();
const anonKey = (getServerEnv("SUPABASE_ANON_KEY") ?? "").trim();
const serverKey = serviceKey || anonKey;
const supabaseUsesServiceRole = Boolean(serviceKey);
const missingUrlOrAnon = getMissingServerEnv(["SUPABASE_URL", "SUPABASE_ANON_KEY"]);
if (missingUrlOrAnon.length > 0) {
  console.error(`[supabase] Missing required env: ${missingUrlOrAnon.join(", ")}`);
}
if (!serverKey) {
  console.error("[supabase] Set SUPABASE_SERVICE_KEY (recommended) or SUPABASE_ANON_KEY on the server.");
}
if (!serviceKey && anonKey) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_KEY not set; using anon key. If writes fail, add the service role key in Vercel → Settings → Environment Variables."
  );
}
const isSupabaseServerConfigured = Boolean(url) && Boolean(serverKey);
const placeholderUrl = "https://placeholder.supabase.co";
const placeholderKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
const supabase = createClient(
  url || placeholderUrl,
  serverKey || placeholderKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: { "x-client-info": "cc-shop-server/1.0" }
    }
  }
);
const supabaseAdmin = serviceKey ? createClient(url || placeholderUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: { "x-client-info": "cc-shop-server-admin/1.0" }
  }
}) : supabase;
async function testSupabaseConnection() {
  if (!isSupabaseServerConfigured) {
    return {
      ok: false,
      error: "Supabase URL or keys missing from server environment",
      usingServiceKey: supabaseUsesServiceRole
    };
  }
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) return { ok: false, error: error.message, usingServiceKey: supabaseUsesServiceRole };
    return { ok: true, usingServiceKey: supabaseUsesServiceRole };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      usingServiceKey: supabaseUsesServiceRole
    };
  }
}
const supabase_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  isSupabaseServerConfigured,
  supabase,
  supabaseAdmin,
  supabaseUsesServiceRole,
  testSupabaseConnection
}, Symbol.toStringTag, { value: "Module" }));
function getClientIp(request) {
  const xForwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const forwardedIps = xForwardedFor.split(",").map((raw) => normalizeIp(raw)).filter((ip) => Boolean(ip));
  const xRealIp = normalizeIp(request.headers.get("x-real-ip"));
  const cloudflareIp = normalizeIp(request.headers.get("cf-connecting-ip"));
  const candidates = [
    ...forwardedIps,
    ...xRealIp ? [xRealIp] : [],
    ...cloudflareIp ? [cloudflareIp] : []
  ];
  if (candidates.length === 0) return "127.0.0.1";
  return candidates.find((ip) => !isLocalIp(ip)) ?? candidates[0];
}
function normalizeIp(input2) {
  if (!input2) return null;
  let ip = input2.trim();
  if (!ip || /^unknown$/i.test(ip)) return null;
  if (ip.toLowerCase().startsWith("for=")) {
    ip = ip.slice(4).trim().replace(/^"+|"+$/g, "");
  }
  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.slice(1, ip.indexOf("]"));
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.split(":")[0];
  }
  ip = ip.replace(/^::ffff:/i, "").replace(/%[0-9a-z]+$/i, "").trim();
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1" || ip.toLowerCase() === "localhost") {
    return "127.0.0.1";
  }
  return ip || null;
}
function isLocalIp(ip) {
  return ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}
function displayIp(ip) {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return "127.0.0.1 (Local Device)";
  }
  return ip;
}
function parseUserAgent(ua, request) {
  const parser = new UAParser(ua || void 0);
  const result = parser.getResult();
  const secChUa = (request?.headers.get("sec-ch-ua") ?? "").toLowerCase();
  const secChPlatform = (request?.headers.get("sec-ch-ua-platform") ?? "").replace(/"/g, "").toLowerCase();
  const secChMobile = request?.headers.get("sec-ch-ua-mobile") ?? "";
  let device = "Desktop";
  const deviceType = (result.device.type ?? "").toLowerCase();
  if (deviceType === "tablet") {
    device = "Tablet";
  } else if (deviceType === "mobile" || secChMobile.includes("?1")) {
    device = "Mobile";
  }
  let os = "Other";
  const osName = `${result.os.name ?? ""} ${secChPlatform}`.toLowerCase();
  if (osName.includes("windows")) os = "Windows";
  else if (osName.includes("android")) os = "Android";
  else if (osName.includes("ios") || osName.includes("iphone") || osName.includes("ipad")) os = "iOS";
  else if (osName.includes("mac")) os = "macOS";
  else if (osName.includes("linux")) os = "Linux";
  else if (osName.includes("chrome")) os = "ChromeOS";
  let browser = "Other";
  const browserName = `${result.browser.name ?? ""} ${secChUa}`.toLowerCase();
  if (browserName.includes("edge") || browserName.includes("edg/") || browserName.includes("microsoft edge")) browser = "Edge";
  else if (browserName.includes("opera") || browserName.includes("opr/")) browser = "Opera";
  else if (browserName.includes("samsung")) browser = "Samsung";
  else if (browserName.includes("firefox")) browser = "Firefox";
  else if (browserName.includes("chrome") || browserName.includes("chromium")) browser = "Chrome";
  else if (browserName.includes("safari")) browser = "Safari";
  else if (browserName.includes("msie") || browserName.includes("trident")) browser = "IE";
  return { device, os, browser };
}
function normalizeEpochMs(value2) {
  const n = Number(value2);
  if (Number.isFinite(n) && n > 0) {
    return n < 1e11 ? Math.trunc(n * 1e3) : Math.trunc(n);
  }
  if (typeof value2 === "string" && value2.trim()) {
    const parsed = Date.parse(value2);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}
function fmtTimestamp(value2) {
  const ms = normalizeEpochMs(value2);
  if (!ms) return "â€”";
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return [
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  ].join(" ");
}
function needsIsoTimestampRetry(message) {
  if (!message) return false;
  return /date\/time field value out of range|invalid input syntax for type timestamp/i.test(message);
}
async function isIpBanned(ip) {
  if (!ip || ip === "unknown") return false;
  try {
    const now = Date.now();
    const { data, error } = await supabase.from("banned_ips").select("id, is_permanent, expires_at").eq("ip_address", ip).maybeSingle();
    if (error || !data) return false;
    if (data.is_permanent) return true;
    if (data.expires_at && Number(data.expires_at) > now) return true;
    void supabase.from("banned_ips").delete().eq("ip_address", ip);
    return false;
  } catch {
    return false;
  }
}
function logIpActivity(request, opts) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? opts.userAgent ?? request.headers.get("sec-ch-ua") ?? "";
  const route = opts.route ?? new URL(request.url).pathname;
  const now = Date.now();
  const parsed = parseUserAgent(userAgent, request);
  console.log(`IP: ${ip}`);
  console.log(`USER: ${opts.userId ?? "guest"}`);
  console.log(`DEVICE: ${parsed.device} / OS: ${parsed.os} / Browser: ${parsed.browser}`);
  console.log(`TIME: ${fmtTimestamp(now)}`);
  console.log(`[ip-security] action=${opts.action} status=${opts.status} route=${route}`);
  const payload = {
    user_id: opts.userId ?? null,
    ip_address: ip,
    user_agent: userAgent.slice(0, 512),
    device: parsed.device,
    os: parsed.os,
    browser: parsed.browser,
    route: route.slice(0, 200),
    action: opts.action,
    status: opts.status,
    created_at: now
  };
  void (async () => {
    const first = await supabase.from("ip_logs").insert(payload);
    if (!first.error) return;
    if (needsIsoTimestampRetry(first.error.message)) {
      const retry = await supabase.from("ip_logs").insert({
        ...payload,
        created_at: new Date(now).toISOString()
      });
      if (!retry.error) return;
      console.error(`[ip-security] âš  ip_logs insert FAILED after retry for action=${opts.action} ip=${ip}:`, retry.error.message, retry.error.code);
      return;
    }
    console.error(`[ip-security] âš  ip_logs insert FAILED for action=${opts.action} ip=${ip}:`, first.error.message, first.error.code);
  })();
}
async function banIp(ip, reason, bannedBy, opts = {}) {
  const isPermanent = opts.isPermanent !== false;
  const expiresAt = isPermanent ? null : opts.expiresAt ?? null;
  const now = Date.now();
  const payload = {
    ip_address: ip.trim(),
    reason: reason.slice(0, 500),
    banned_by: bannedBy,
    is_permanent: isPermanent,
    expires_at: expiresAt,
    created_at: now
  };
  const first = await supabase.from("banned_ips").upsert(payload, { onConflict: "ip_address" });
  if (!first.error) {
    console.log(`[ip-security] BANNED ${ip} by ${bannedBy}: ${reason}`);
    return;
  }
  if (needsIsoTimestampRetry(first.error.message)) {
    const retry = await supabase.from("banned_ips").upsert(
      { ...payload, created_at: new Date(now).toISOString() },
      { onConflict: "ip_address" }
    );
    if (!retry.error) {
      console.log(`[ip-security] BANNED ${ip} by ${bannedBy}: ${reason}`);
      return;
    }
    throw new Error("Failed to ban IP: " + retry.error.message);
  }
  throw new Error("Failed to ban IP: " + first.error.message);
}
async function unbanIp(ip) {
  const { error } = await supabase.from("banned_ips").delete().eq("ip_address", ip.trim());
  if (error) throw new Error("Failed to unban IP: " + error.message);
  console.log(`[ip-security] UNBANNED ${ip}`);
}
function rowToLog(row2) {
  const ms = normalizeEpochMs(row2.created_at);
  const ip = String(row2.ip_address ?? "");
  return {
    id: row2.id,
    userId: row2.user_id ?? null,
    ipAddress: displayIp(ip),
    userAgent: row2.user_agent ?? "",
    device: row2.device ?? "Unknown",
    os: row2.os ?? "Unknown",
    browser: row2.browser ?? "Unknown",
    route: row2.route ?? "",
    action: row2.action ?? "",
    status: row2.status ?? "",
    createdAt: ms,
    createdAtDisplay: fmtTimestamp(ms)
  };
}
function rowToBan(row2) {
  return {
    id: row2.id,
    ipAddress: row2.ip_address,
    reason: row2.reason ?? "",
    bannedBy: row2.banned_by ?? "admin",
    isPermanent: Boolean(row2.is_permanent),
    expiresAt: row2.expires_at ? normalizeEpochMs(row2.expires_at) : null,
    createdAt: normalizeEpochMs(row2.created_at)
  };
}
async function getRecentIpLogs(limit = 100) {
  const { data, error } = await supabase.from("ip_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[ip-security] getRecentIpLogs:", error.message);
    return [];
  }
  return (data ?? []).map(rowToLog);
}
async function getBannedIps() {
  const { data, error } = await supabase.from("banned_ips").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[ip-security] getBannedIps:", error.message);
    return [];
  }
  return (data ?? []).map(rowToBan);
}
async function getUserIpHistory(userId2) {
  const { data, error } = await supabase.from("ip_logs").select("ip_address, created_at").eq("user_id", userId2).order("created_at", { ascending: false }).limit(100);
  if (error || !data) return [];
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const row2 of data) {
    if (!seen.has(row2.ip_address)) {
      seen.add(row2.ip_address);
      result.push(row2.ip_address);
      if (result.length >= 10) break;
    }
  }
  return result;
}
function bannedResponse() {
  return new Response(
    JSON.stringify({
      error: "Access restricted.",
      message: "Your access has been restricted. Contact support if you believe this is an error."
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" }
    }
  );
}
const ipSecurity_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  banIp,
  bannedResponse,
  displayIp,
  getBannedIps,
  getClientIp,
  getRecentIpLogs,
  getUserIpHistory,
  isIpBanned,
  logIpActivity,
  parseUserAgent,
  unbanIp
}, Symbol.toStringTag, { value: "Module" }));
async function loader$f({ request }) {
  const url2 = new URL(request.url);
  const session = parseSession(request);
  if (!session) {
    logIpActivity(request, { action: "page_access", status: "failed", route: url2.pathname });
    const searchParams = new URLSearchParams([["returnTo", url2.pathname]]);
    throw redirect(`/login?${searchParams}`);
  }
  logIpActivity(request, { userId: session.userId, action: "page_access", status: "success", route: url2.pathname });
  return null;
}
const dashboardLayout = UNSAFE_withComponentProps(function DashboardLayout() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(ActionRequiredModal, {}), /* @__PURE__ */ jsx(DashboardTopNav, {}), /* @__PURE__ */ jsx("main", {
      className: "app-page-shell",
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboardLayout,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
const grid$4 = "_grid_1va25_1";
const chartCard$1 = "_chartCard_1va25_8";
const chartHeader = "_chartHeader_1va25_26";
const chartTitle$1 = "_chartTitle_1va25_33";
const chartBadge = "_chartBadge_1va25_39";
const chartArea = "_chartArea_1va25_48";
const chartSvg = "_chartSvg_1va25_53";
const styles$z = {
  grid: grid$4,
  chartCard: chartCard$1,
  chartHeader,
  chartTitle: chartTitle$1,
  chartBadge,
  chartArea,
  chartSvg
};
function DynamicLineChart({ data, color, dataKey }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => Math.max(d[dataKey], 10)));
  const yLabels = Array.from({ length: 6 }, (_, i) => {
    const val = maxVal - maxVal / 5 * i;
    return val >= 100 ? Math.round(val).toString() : val.toFixed(1);
  });
  const points = data.map((d, i) => {
    const x = 30 + i / (data.length - 1) * 220;
    const ratio = d[dataKey] / maxVal;
    const y = 95 - ratio * 85;
    return `${x},${y}`;
  }).join(" ");
  return /* @__PURE__ */ jsxs("svg", { className: styles$z.chartSvg, viewBox: "0 0 260 110", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsx(
      "polyline",
      {
        points,
        fill: "none",
        stroke: color,
        strokeWidth: "1.5",
        strokeLinejoin: "round"
      }
    ),
    data.map((d, i) => {
      const x = 30 + i / (data.length - 1) * 220;
      const ratio = d[dataKey] / maxVal;
      const y = 95 - ratio * 85;
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: 3, fill: color }),
        i % 3 === 0 && /* @__PURE__ */ jsx("text", { x, y: 108, textAnchor: "middle", fontSize: "6", fill: "#555", fontFamily: "monospace", children: d.date })
      ] }, d.date);
    }),
    yLabels.map((label2, i) => /* @__PURE__ */ jsx("text", { x: 26, y: 10 + i * 17, textAnchor: "end", fontSize: "6", fill: "#555", fontFamily: "monospace", children: label2 }, label2))
  ] });
}
function ActivityCharts({ serverData }) {
  const chartData = serverData?.chartData ?? [];
  return /* @__PURE__ */ jsxs("div", { className: styles$z.grid, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$z.chartCard, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$z.chartHeader, children: [
        /* @__PURE__ */ jsx("span", { className: styles$z.chartTitle, children: "Deposits — Last 14 Days" }),
        /* @__PURE__ */ jsx("span", { className: styles$z.chartBadge, children: "Trend" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$z.chartArea, children: /* @__PURE__ */ jsx(DynamicLineChart, { data: chartData, color: "#6366f1", dataKey: "deposits" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$z.chartCard, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$z.chartHeader, children: [
        /* @__PURE__ */ jsx("span", { className: styles$z.chartTitle, children: "Orders — Last 14 Days" }),
        /* @__PURE__ */ jsx("span", { className: styles$z.chartBadge, children: "Activity" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$z.chartArea, children: /* @__PURE__ */ jsx(DynamicLineChart, { data: chartData, color: "#22c55e", dataKey: "orders" }) })
    ] })
  ] });
}
const section = "_section_y45gq_1";
const sectionTitle$1 = "_sectionTitle_y45gq_5";
const grid$3 = "_grid_y45gq_13";
const actionCard = "_actionCard_y45gq_19";
const actionIconWrap = "_actionIconWrap_y45gq_39";
const actionLabel$1 = "_actionLabel_y45gq_48";
const actionSub = "_actionSub_y45gq_54";
const styles$y = {
  section,
  sectionTitle: sectionTitle$1,
  grid: grid$3,
  actionCard,
  actionIconWrap,
  actionLabel: actionLabel$1,
  actionSub
};
const ACTIONS = [
  {
    label: "Add Funds",
    sub: "Top up wallet",
    to: "/deposit",
    icon: /* @__PURE__ */ jsx(ArrowDownToLine, { size: 20 }),
    bg: "rgba(99,102,241,0.2)",
    color: "#818cf8"
  },
  {
    label: "Buy Cards",
    sub: "Browse shop",
    to: "/cards",
    icon: /* @__PURE__ */ jsx(ShoppingBag, { size: 20 }),
    bg: "rgba(168,85,247,0.2)",
    color: "#c084fc"
  },
  {
    label: "My Orders",
    sub: "View purchases",
    to: "/orders",
    icon: /* @__PURE__ */ jsx(Package, { size: 20 }),
    bg: "rgba(34,197,94,0.2)",
    color: "#22c55e"
  },
  {
    label: "Transactions",
    sub: "Full history",
    to: "/history",
    icon: /* @__PURE__ */ jsx(Receipt, { size: 20 }),
    bg: "rgba(249,115,22,0.2)",
    color: "#f97316"
  }
];
function QuickActions() {
  return /* @__PURE__ */ jsxs("div", { className: styles$y.section, children: [
    /* @__PURE__ */ jsx("h2", { className: styles$y.sectionTitle, children: "Quick Actions" }),
    /* @__PURE__ */ jsx("div", { className: styles$y.grid, children: ACTIONS.map((a) => /* @__PURE__ */ jsxs(Link, { to: a.to, className: styles$y.actionCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$y.actionIconWrap, style: { background: a.bg, color: a.color }, children: a.icon }),
      /* @__PURE__ */ jsx("span", { className: styles$y.actionLabel, children: a.label }),
      /* @__PURE__ */ jsx("span", { className: styles$y.actionSub, children: a.sub })
    ] }, a.label)) })
  ] });
}
const grid$2 = "_grid_nmbd0_1";
const card$2 = "_card_nmbd0_8";
const cardHeader = "_cardHeader_nmbd0_31";
const labelGroup = "_labelGroup_nmbd0_37";
const label$6 = "_label_nmbd0_37";
const currencyBadge = "_currencyBadge_nmbd0_51";
const currencyUsdt = "_currencyUsdt_nmbd0_62";
const iconWrap$1 = "_iconWrap_nmbd0_67";
const value = "_value_nmbd0_77";
const ordersRow = "_ordersRow_nmbd0_88";
const orderStat = "_orderStat_nmbd0_94";
const orderNum = "_orderNum_nmbd0_101";
const orderNumBlue = "_orderNumBlue_nmbd0_111";
const orderNumYellow = "_orderNumYellow_nmbd0_112";
const orderNumGreen = "_orderNumGreen_nmbd0_113";
const orderLabel = "_orderLabel_nmbd0_115";
const styles$x = {
  grid: grid$2,
  card: card$2,
  cardHeader,
  labelGroup,
  label: label$6,
  currencyBadge,
  currencyUsdt,
  iconWrap: iconWrap$1,
  value,
  ordersRow,
  orderStat,
  orderNum,
  orderNumBlue,
  orderNumYellow,
  orderNumGreen,
  orderLabel
};
function StatsOverview({ serverData }) {
  const walletDisplay = serverData?.walletDisplay ?? "...";
  const totalDeposited = serverData?.totalDepositedDisplay ?? "...";
  const totalOrders = serverData?.totalOrders ?? 0;
  const pendingOrders = serverData?.pendingOrders ?? 0;
  const completedOrders = serverData?.completedOrders ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: styles$x.grid, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$x.card, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$x.cardHeader, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$x.labelGroup, children: [
          /* @__PURE__ */ jsx("span", { className: styles$x.label, children: "Wallet Balance" }),
          /* @__PURE__ */ jsx("span", { className: `${styles$x.currencyBadge} ${styles$x.currencyUsdt}`, children: "● USDT" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$x.iconWrap, style: { background: "rgba(99,102,241,0.2)" }, children: /* @__PURE__ */ jsx(CreditCard, { size: 18, color: "#818cf8" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `${styles$x.value} protected`, children: [
        "$",
        walletDisplay
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$x.card, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$x.cardHeader, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$x.labelGroup, children: [
          /* @__PURE__ */ jsx("span", { className: styles$x.label, children: "Total Deposits" }),
          /* @__PURE__ */ jsx("span", { className: `${styles$x.currencyBadge} ${styles$x.currencyUsdt}`, children: "● USDT" })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/deposit", className: styles$x.iconWrap, style: { background: "rgba(34,197,94,0.2)", textDecoration: "none" }, children: /* @__PURE__ */ jsx(Plus, { size: 18, color: "#22c55e" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `${styles$x.value} protected`, children: [
        "$",
        totalDeposited
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$x.card, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$x.cardHeader, children: [
        /* @__PURE__ */ jsx("div", { className: styles$x.labelGroup, children: /* @__PURE__ */ jsx("span", { className: styles$x.label, children: "Orders Summary" }) }),
        /* @__PURE__ */ jsx("div", { className: styles$x.iconWrap, style: { background: "rgba(168,85,247,0.2)" }, children: /* @__PURE__ */ jsx(ShoppingBag, { size: 18, color: "#c084fc" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$x.ordersRow, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$x.orderStat, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$x.orderNum} ${styles$x.orderNumBlue} protected`, children: totalOrders }),
          /* @__PURE__ */ jsx("span", { className: styles$x.orderLabel, children: "Total" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$x.orderStat, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$x.orderNum} ${styles$x.orderNumYellow} protected`, children: pendingOrders }),
          /* @__PURE__ */ jsx("span", { className: styles$x.orderLabel, children: "Pending" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$x.orderStat, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$x.orderNum} ${styles$x.orderNumGreen} protected`, children: completedOrders }),
          /* @__PURE__ */ jsx("span", { className: styles$x.orderLabel, children: "Delivered" })
        ] })
      ] })
    ] })
  ] });
}
function Watermark({ text = "Heaven Card" }) {
  return /* @__PURE__ */ jsx("div", { className: "watermark", "aria-hidden": "true", children: text });
}
const page$9 = "_page_byhbw_1";
const inner$4 = "_inner_byhbw_7";
const styles$w = {
  page: page$9,
  inner: inner$4
};
const MAX_EVENTS = 500;
const eventLog = [];
function emit(event) {
  if (eventLog.length >= MAX_EVENTS) eventLog.shift();
  eventLog.push(event);
  console.error(`[SECURITY] ${JSON.stringify(event)}`);
}
function logSecurityEvent(event, ip, extra) {
  emit({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    event,
    ip,
    ...extra
  });
}
function getRecentEvents(limit = 50) {
  return [...eventLog].reverse().slice(0, limit);
}
const UNSAFE_CHARS = /[<>"'`\\;]/g;
function sanitizeString(input2, maxLength = 320) {
  if (typeof input2 !== "string") return "";
  return input2.trim().replace(UNSAFE_CHARS, "").substring(0, maxLength);
}
function sanitizeEmail(input2) {
  const raw = sanitizeString(input2, 320);
  return raw.toLowerCase();
}
function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}
function safeErrorMessage(err) {
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred. Please try again.";
}
const securityLog_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRecentEvents,
  isValidEmail,
  logSecurityEvent,
  safeErrorMessage,
  sanitizeEmail,
  sanitizeString
}, Symbol.toStringTag, { value: "Module" }));
function rowToUser(row2) {
  return {
    id: row2.id,
    email: row2.email,
    name: row2.name,
    passwordHash: row2.password_hash,
    walletUsd: Number(row2.wallet_usd),
    totalDepositedUsd: Number(row2.total_deposited_usd),
    createdAt: Number(row2.created_at),
    role: row2.role,
    activatedAt: row2.activated_at ? Number(row2.activated_at) : void 0,
    activationDeadlineAt: row2.activation_deadline_at ? Number(row2.activation_deadline_at) : void 0,
    zeroBalanceDeadlineAt: row2.zero_balance_deadline_at ? Number(row2.zero_balance_deadline_at) : void 0
  };
}
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1e3;
async function pruneExpiredUsers(nowMs = Date.now()) {
  try {
    const { data: activationExpired } = await supabase.from("users").select("id").eq("role", "user").is("activated_at", null).or(`activation_deadline_at.lte.${nowMs},and(activation_deadline_at.is.null,created_at.lte.${nowMs - THREE_DAYS_MS})`);
    for (const row2 of activationExpired ?? []) {
      await supabase.from("users").delete().eq("id", row2.id);
    }
    const { data: zeroBalanceExpired } = await supabase.from("users").select("id").eq("role", "user").not("activated_at", "is", null).lte("wallet_usd", 0).not("zero_balance_deadline_at", "is", null).lte("zero_balance_deadline_at", nowMs);
    for (const row2 of zeroBalanceExpired ?? []) {
      await supabase.from("users").delete().eq("id", row2.id);
    }
  } catch (err) {
    console.warn("[pruneExpiredUsers] skipped (lifecycle columns missing?):", err instanceof Error ? err.message : err);
  }
}
function rowToProduct(row2) {
  const stock = Math.max(0, Number(row2.stock ?? 0));
  const rawStatus = String(row2.status ?? "");
  const soldish = stock <= 0 || rawStatus === "sold_out" || rawStatus === "sold" || rawStatus === "inactive";
  return {
    id: row2.id,
    bin: row2.bin,
    provider: row2.provider,
    type: row2.type,
    expiry: row2.expiry,
    name: row2.name,
    country: row2.country,
    countryFlag: row2.country_flag,
    street: String(row2.street ?? ""),
    city: String(row2.city ?? ""),
    state: row2.state,
    address: row2.address,
    zip: row2.zip,
    extras: row2.extras ?? null,
    bank: row2.bank,
    priceUsdCents: Number(row2.price_usd_cents),
    limitUsd: Number(row2.limit_usd),
    validUntil: row2.valid_until,
    isValid: Boolean(row2.is_100_valid ?? row2.is_valid ?? false),
    tag: row2.tag ?? null,
    stock,
    status: soldish ? "sold_out" : "in_stock",
    color: row2.color,
    cardNumber: row2.card_number ?? void 0,
    cvv: row2.cvv ?? void 0,
    fullName: row2.full_name ?? void 0
  };
}
function rowToOrder(row2) {
  return {
    id: row2.id,
    userId: row2.user_id,
    productId: row2.product_id,
    amountUsdCents: Number(row2.amount_usd_cents),
    status: row2.status,
    createdAt: Number(row2.created_at),
    cardDetails: row2.card_details ?? void 0
  };
}
function rowToDeposit(row2) {
  return {
    id: row2.id,
    userId: row2.user_id,
    orderSn: row2.order_sn,
    amountInrPaise: Number(row2.amount_inr_paise),
    amountUsdCents: Number(row2.amount_usd_cents),
    status: row2.status,
    paymentUrl: row2.payment_url ?? void 0,
    createdAt: Number(row2.created_at),
    processedAt: row2.processed_at ? Number(row2.processed_at) : void 0
  };
}
function rowToTransaction(row2) {
  return {
    id: row2.id,
    userId: row2.user_id,
    type: row2.type,
    amountUsdCents: Number(row2.amount_usd_cents),
    balanceAfterCents: Number(row2.balance_after_cents),
    description: row2.description,
    refId: row2.ref_id,
    createdAt: Number(row2.created_at)
  };
}
let seeded = false;
let totalsBackfilled = false;
let lastSeedRunAt = 0;
const SEED_INTERVAL_MS = 6e4;
let adminVerified = false;
const ADMIN_ID = "USR-ADMIN-001";
const ADMIN_EMAIL = sanitizeEmail("forzaxrosan778@gmail.com").toLowerCase().trim();
const ADMIN_NAME = "Admin";
const ADMIN_PASS = "adminforz21@";
async function backfillUserTotalsFromWallet() {
  if (totalsBackfilled) return;
  const { data: mismatches, error } = await supabase.from("users").select("id, wallet_usd, total_deposited_usd").eq("role", "user").gt("wallet_usd", 0);
  if (error) {
    console.error("[backfillUserTotalsFromWallet] query failed:", error.message);
    return;
  }
  for (const row2 of mismatches ?? []) {
    const wallet = Number(row2.wallet_usd);
    const total = Number(row2.total_deposited_usd);
    if (wallet <= total) continue;
    const { error: updateErr } = await supabase.from("users").update({ total_deposited_usd: wallet }).eq("id", row2.id);
    if (updateErr) {
      console.error("[backfillUserTotalsFromWallet] update failed:", row2.id, updateErr.message);
    }
  }
  totalsBackfilled = true;
}
async function ensureAdminUser() {
  if (adminVerified) return;
  const { data: existingAdmin, error: lookupErr } = await supabase.from("users").select("id, email, password_hash, role").eq("id", ADMIN_ID).maybeSingle();
  if (lookupErr) {
    console.error("[seed] Admin lookup failed:", lookupErr.message);
    return;
  }
  if (!existingAdmin) {
    const adminHash2 = await bcrypt.hash(ADMIN_PASS, 12);
    const { error: insertErr } = await supabase.from("users").insert({
      id: ADMIN_ID,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password_hash: adminHash2,
      wallet_usd: 0,
      total_deposited_usd: 0,
      role: "admin",
      created_at: Date.now()
    });
    if (insertErr) {
      console.error("[seed] Admin insert failed:", insertErr.message);
      return;
    }
    console.log("[seed] Admin user created.");
    adminVerified = true;
    return;
  }
  const currentEmail = sanitizeEmail(existingAdmin.email).toLowerCase().trim();
  const currentRole = typeof existingAdmin.role === "string" ? existingAdmin.role.trim() : "";
  const storedHash = String(existingAdmin.password_hash ?? "");
  const hashIsValid = storedHash.startsWith("$2") ? await bcrypt.compare(ADMIN_PASS, storedHash) : false;
  if (currentEmail === ADMIN_EMAIL && currentRole === "admin" && hashIsValid) {
    console.log("[seed] Admin credentials OK.");
    adminVerified = true;
    return;
  }
  console.log("[seed] Admin row mismatch - repairing...");
  const adminHash = hashIsValid ? storedHash : await bcrypt.hash(ADMIN_PASS, 12);
  const { error: updateErr } = await supabase.from("users").update({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password_hash: adminHash,
    role: "admin",
    failed_attempts: 0,
    locked_until: null
  }).eq("id", ADMIN_ID);
  if (updateErr) {
    console.error("[seed] Admin update failed (RLS? Missing service key?):", updateErr.message);
    console.error("[seed] FIX: Run fix-admin.sql in Supabase SQL Editor, or add SUPABASE_SERVICE_KEY to .env");
    return;
  }
  console.log("[seed] Admin credentials repaired.");
  adminVerified = true;
}
async function ensureSeeded() {
  const now = Date.now();
  if (seeded && adminVerified && now - lastSeedRunAt < SEED_INTERVAL_MS) {
    return;
  }
  try {
    if (now - lastSeedRunAt >= SEED_INTERVAL_MS) {
      await backfillUserTotalsFromWallet();
      await pruneExpiredUsers();
      lastSeedRunAt = Date.now();
    }
    if (!adminVerified) {
      await ensureAdminUser();
    }
    if (seeded) return;
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) {
      seeded = true;
      return;
    }
    const sampleProductsRaw = [
      { id: "1", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3600, limit_usd: 287, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000001", cvv: "123", full_name: "JOHN DOE" },
      { id: "2", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3030, limit_usd: 500, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000002", cvv: "456", full_name: "JANE SMITH" },
      { id: "3", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "11/28", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Alaska", address: "A****1", zip: "NO", extras: null, bank: "Bank of America", price_usd_cents: 3553, limit_usd: 400, valid_until: "11/28", is_valid: true, color: "#3b82f6", card_number: "4573830000000003", cvv: "789", full_name: "ALICE JOHNSON" },
      { id: "4", bin: "547383", provider: "MASTERCARD", type: "CREDIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 3753, limit_usd: 1e3, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000004", cvv: "321", full_name: "BOB WILSON" },
      { id: "5", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 3e3, limit_usd: 800, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000005", cvv: "654", full_name: "CAROL BROWN" },
      { id: "6", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "Bank of America", price_usd_cents: 5188, limit_usd: 1500, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000006", cvv: "987", full_name: "DAVE MILLER" },
      { id: "7", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Indiana", address: "46221", zip: "46221", extras: "Yes", bank: "JPMorgan Chase", price_usd_cents: 4097, limit_usd: 1200, valid_until: "12/28", color: "#f59e0b", card_number: "5473830000000007", cvv: "147", full_name: "EVE TAYLOR" },
      { id: "8", bin: "565343", provider: "MASTERCARD", type: "DEBIT", expiry: "12/28", name: "MasterCard", country: "UK", country_flag: "🇬🇧", state: "VF", address: "360831", zip: "360831", extras: null, bank: "UK ISDC", price_usd_cents: 3e3, limit_usd: 600, valid_until: "12/28", color: "#f59e0b", card_number: "5653430000000008", cvv: "258", full_name: "FRANK GREEN" },
      { id: "9", bin: "411111", provider: "VISA", type: "CREDIT", expiry: "06/27", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "California", address: "90210", zip: "90210", extras: "Yes", bank: "Chase", price_usd_cents: 4200, limit_usd: 2e3, valid_until: "06/27", color: "#3b82f6", card_number: "4111110000000009", cvv: "369", full_name: "GRACE HALL" },
      { id: "10", bin: "524135", provider: "MASTERCARD", type: "CREDIT", expiry: "09/26", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Texas", address: "75001", zip: "75001", extras: null, bank: "Wells Fargo", price_usd_cents: 5500, limit_usd: 3e3, valid_until: "09/26", color: "#f59e0b", card_number: "5241350000000010", cvv: "741", full_name: "HENRY KING" },
      { id: "11", bin: "374500", provider: "AMEX", type: "CREDIT", expiry: "09/26", name: "AmexCard", country: "US", country_flag: "🇺🇸", state: "New York", address: "10001", zip: "10001", extras: "Yes", bank: "American Express", price_usd_cents: 12e3, limit_usd: 5e3, valid_until: "09/26", color: "#eab308", card_number: "3745000000000011", cvv: "852", full_name: "IVY LEE" },
      { id: "12", bin: "414720", provider: "VISA", type: "CREDIT", expiry: "12/29", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Florida", address: "33101", zip: "33101", extras: "Yes", bank: "Citibank", price_usd_cents: 19900, limit_usd: 1e4, valid_until: "12/29", color: "#3b82f6", card_number: "4147200000000012", cvv: "963", full_name: "JACK WHITE" },
      { id: "13", bin: "547383", provider: "MASTERCARD", type: "DEBIT", expiry: "11/28", name: "MasterCard", country: "CA", country_flag: "🇨🇦", state: "Ontario", address: "M5V", zip: "M5V", extras: null, bank: "TD Bank", price_usd_cents: 2850, limit_usd: 400, valid_until: "11/28", color: "#f59e0b", card_number: "5473830000000013", cvv: "159", full_name: "KAREN SCOTT" },
      { id: "14", bin: "476200", provider: "VISA", type: "DEBIT", expiry: "08/27", name: "VisaCard", country: "AU", country_flag: "🇦🇺", state: "NSW", address: "2000", zip: "2000", extras: null, bank: "ANZ", price_usd_cents: 3200, limit_usd: 700, valid_until: "08/27", color: "#3b82f6", card_number: "4762000000000014", cvv: "753", full_name: "LIAM ADAMS" },
      { id: "15", bin: "532013", provider: "MASTERCARD", type: "CREDIT", expiry: "04/29", name: "MasterCard", country: "DE", country_flag: "🇩🇪", state: "Berlin", address: "10117", zip: "10117", extras: "Yes", bank: "Deutsche Bank", price_usd_cents: 6800, limit_usd: 4e3, valid_until: "04/29", color: "#f59e0b", card_number: "5320130000000015", cvv: "357", full_name: "MIA BAKER" },
      { id: "16", bin: "400000", provider: "VISA", type: "CREDIT", expiry: "03/28", name: "VisaCard", country: "FR", country_flag: "🇫🇷", state: "Paris", address: "75001", zip: "75001", extras: null, bank: "BNP Paribas", price_usd_cents: 7500, limit_usd: 5e3, valid_until: "03/28", color: "#3b82f6", card_number: "4000000000000016", cvv: "951", full_name: "NOAH CLARK" },
      { id: "17", bin: "547383", provider: "VISA", type: "DEBIT", expiry: "07/27", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Ohio", address: "44101", zip: "44101", extras: null, bank: "PNC Bank", price_usd_cents: 3375, limit_usd: 450, valid_until: "07/27", color: "#3b82f6", card_number: "5473830000000017", cvv: "246", full_name: "OLIVIA DAVIS" },
      { id: "18", bin: "520082", provider: "MASTERCARD", type: "DEBIT", expiry: "10/28", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Georgia", address: "30301", zip: "30301", extras: null, bank: "SunTrust", price_usd_cents: 2999, limit_usd: 350, valid_until: "10/28", color: "#f59e0b", card_number: "5200820000000018", cvv: "864", full_name: "PETER EVANS" },
      { id: "19", bin: "451166", provider: "VISA", type: "CREDIT", expiry: "05/29", name: "VisaCard", country: "US", country_flag: "🇺🇸", state: "Illinois", address: "60601", zip: "60601", extras: "Yes", bank: "US Bank", price_usd_cents: 8800, limit_usd: 6e3, valid_until: "05/29", color: "#3b82f6", card_number: "4511660000000019", cvv: "135", full_name: "QUINN FOSTER" },
      { id: "20", bin: "545616", provider: "MASTERCARD", type: "CREDIT", expiry: "01/30", name: "MasterCard", country: "US", country_flag: "🇺🇸", state: "Washington", address: "98101", zip: "98101", extras: "Yes", bank: "Key Bank", price_usd_cents: 9550, limit_usd: 7500, valid_until: "01/30", color: "#f59e0b", card_number: "5456160000000020", cvv: "975", full_name: "RACHEL GRAY" }
    ];
    const sampleProducts = sampleProductsRaw.map((p) => ({
      ...p,
      stock: 1,
      status: "in_stock",
      street: "",
      city: ""
    }));
    const { error: prodErr } = await supabase.from("products").insert(sampleProducts);
    if (prodErr) console.error("[seed] Products insert failed:", prodErr.message);
    else console.log(`[seed] ${sampleProducts.length} products seeded.`);
    seeded = true;
    console.log("[seed] ✓ Database ready.");
  } catch (err) {
    console.error(
      "[seed] ✗ Supabase seeding failed. Is the SQL migration run?\n        Run db-migrate.sql in: https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new\n        Error:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
async function createUser(email, name, password) {
  await ensureSeeded();
  const normalizedEmail = email.toLowerCase().trim();
  const { data: existing } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
  if (existing) return null;
  const { data: allIds } = await supabase.from("users").select("id").like("id", "USR-%").not("id", "like", "USR-ADMIN%");
  const maxNum = (allIds ?? []).reduce((max, row2) => {
    const n = parseInt(row2.id.replace("USR-", ""), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 1e3);
  const id = `USR-${maxNum + 1}`;
  const hash = await bcrypt.hash(password, 12);
  const now = Date.now();
  const { data, error } = await supabase.from("users").insert({
    id,
    email: normalizedEmail,
    name: name.trim(),
    password_hash: hash,
    wallet_usd: 0,
    total_deposited_usd: 0,
    role: "user",
    created_at: now
    // Note: activated_at, activation_deadline_at, zero_balance_deadline_at are optional
    // columns added by the ALTER TABLE migration. Do NOT include them here — if the
    // columns don't exist yet the INSERT will fail. If they do exist, their DEFAULT
    // (null / 0) will be used automatically by Supabase.
  }).select().single();
  if (error) {
    if (error.code === "23505") {
      console.warn("[createUser] duplicate email race (23505):", normalizedEmail);
      return null;
    }
    console.error("[createUser] INSERT failed:", error.code, error.message);
    throw new Error(
      error.message.includes("row-level security") ? "Database write blocked (RLS). Add SUPABASE_SERVICE_KEY to .env — see /api/health" : `Database error: ${error.message}`
    );
  }
  console.log("[createUser] ✓ Created user:", id, normalizedEmail);
  return rowToUser(data);
}
async function findUserByEmail(email) {
  await ensureSeeded();
  const normalizedEmail = email.toLowerCase().trim();
  console.log("[findUserByEmail] looking up:", normalizedEmail);
  const { data, error } = await supabase.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
  if (error) console.error("[findUserByEmail] query error:", error.message);
  console.log("[findUserByEmail] result:", data ? `found id=${data.id}` : "not found");
  return data ? rowToUser(data) : null;
}
async function findUserById(id) {
  await ensureSeeded();
  const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  return data ? rowToUser(data) : null;
}
async function findUserByQuery(query) {
  await ensureSeeded();
  const q = query.trim().toLowerCase();
  const { data } = await supabase.from("users").select("*").or(`email.eq.${q},id.ilike.${q}`).maybeSingle();
  return data ? rowToUser(data) : null;
}
async function getWalletBalance(userId2) {
  const { data, error } = await supabase.from("users").select("wallet_usd").eq("id", userId2).single();
  if (error || !data) {
    console.error(`[getWalletBalance] failed for userId=${userId2}:`, error?.message);
    return 0;
  }
  console.log(`[getWalletBalance] userId=${userId2} wallet_usd=${data.wallet_usd}`);
  return Number(data.wallet_usd);
}
async function verifyPassword(user, password) {
  const result = await bcrypt.compare(password, user.passwordHash);
  console.log(`[verifyPassword] user=${user.email} match=${result}`);
  return result;
}
async function adjustWallet(userId2, deltaCents, type, description2, refId) {
  console.log(`[adjustWallet] START userId=${userId2} delta=${deltaCents} type=${type}`);
  const user = await findUserById(userId2);
  if (!user) {
    console.error(`[adjustWallet] FAIL: no user row for userId=${userId2}`);
    throw new Error(`User not found (id=${userId2}).`);
  }
  const current = Number(user.walletUsd);
  const newBalance = Math.max(0, current + deltaCents);
  console.log(`[adjustWallet] userId=${userId2} currentBalance=${current} delta=${deltaCents} newBalance=${newBalance}`);
  const { error: walletErr } = await supabase.from("users").update({
    wallet_usd: newBalance,
    total_deposited_usd: deltaCents > 0 ? user.totalDepositedUsd + deltaCents : user.totalDepositedUsd
  }).eq("id", userId2);
  if (walletErr) {
    console.error(`[adjustWallet] wallet_usd update failed for userId=${userId2}:`, walletErr.message);
    throw new Error(`Failed to update wallet: ${walletErr.message}`);
  }
  const txId2 = `TXN-${Date.now()}-${crypto$1.randomBytes(4).toString("hex")}`;
  const { error: txErr } = await supabase.from("transactions").insert({
    id: txId2,
    user_id: userId2,
    type,
    amount_usd_cents: Math.abs(deltaCents),
    balance_after_cents: newBalance,
    description: description2,
    ref_id: refId,
    created_at: Date.now()
  });
  if (txErr) {
    console.error(`[adjustWallet] transaction INSERT failed (non-fatal, wallet already updated) userId=${userId2}:`, txErr.code, txErr.message);
  } else {
    console.log(`[adjustWallet] OK — txId=${txId2} newBalance=${newBalance}`);
  }
}
async function adminSetBalance(userId2, amountUsdCents, note) {
  console.log(`[adminSetBalance] START userId=${userId2} targetCents=${amountUsdCents}`);
  const user = await findUserById(userId2);
  if (!user) {
    console.error(`[adminSetBalance] FAIL: no user for userId=${userId2}`);
    throw new Error(`User not found (id=${userId2}). Verify the user ID is correct.`);
  }
  const current = Number(user.walletUsd);
  const delta = amountUsdCents - current;
  if (delta === 0) {
    console.log(`[adminSetBalance] NO-OP: balance already at ${amountUsdCents} for userId=${userId2}`);
    return;
  }
  const type = delta >= 0 ? "admin_credit" : "admin_debit";
  console.log(`[adminSetBalance] userId=${userId2} current=${current} target=${amountUsdCents} delta=${delta} type=${type}`);
  await adjustWallet(userId2, delta, type, note || "Admin balance adjustment", "ADMIN");
  console.log(`[adminSetBalance] OK userId=${userId2} newBalance=${amountUsdCents}`);
}
async function getAllUsers() {
  await ensureSeeded();
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[getAllUsers]", error.message);
    return [];
  }
  return (data ?? []).map(rowToUser);
}
async function getPublicProducts(opts) {
  await ensureSeeded();
  let q = supabase.from("products").select("*").or("status.eq.active,status.eq.in_stock").gt("stock", 0);
  q = q.eq("is_100_valid", opts?.validOnly ? true : false);
  const { data, error } = await q.order("price_usd_cents", { ascending: true });
  if (error) {
    console.error("[getPublicProducts]", error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}
async function getProductById(id) {
  await ensureSeeded();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return data ? rowToProduct(data) : null;
}
function normalizeProductStatus(stock, rawStatus) {
  if (stock <= 0) return "sold_out";
  return "active";
}
async function createProduct(data) {
  await ensureSeeded();
  const id = `PROD-${Date.now()}-${crypto$1.randomBytes(4).toString("hex")}`;
  const stock = Math.max(0, Math.floor(Number(data.stock)));
  const status = normalizeProductStatus(stock);
  const rawPayload = {
    id,
    bin: data.bin,
    provider: data.provider,
    type: data.type,
    expiry: data.expiry,
    name: data.name,
    country: data.country,
    country_flag: data.countryFlag,
    street: data.street ?? "",
    city: data.city ?? "",
    state: data.state,
    address: data.address,
    zip: data.zip,
    extras: data.extras ?? null,
    bank: data.bank,
    price_usd_cents: data.priceUsdCents,
    limit_usd: data.limitUsd,
    valid_until: data.validUntil,
    is_100_valid: data.isValid ?? false,
    tag: data.tag ?? null,
    stock,
    status,
    color: data.color,
    card_number: data.cardNumber ?? null,
    cvv: data.cvv ?? null,
    full_name: data.fullName ?? null
  };
  console.log("[createProduct] Raw payload keys:", Object.keys(rawPayload));
  console.log("[createProduct] Raw payload:", JSON.stringify(rawPayload, null, 2));
  const cleanPayload = rawPayload;
  console.log("[createProduct] Inserting to Supabase...");
  const { data: row2, error } = await supabase.from("products").insert(cleanPayload).select().single();
  if (error) {
    console.error("[createProduct] SUPABASE ERROR:", error);
    console.error("[createProduct] Error code:", error.code);
    console.error("[createProduct] Error details:", error.details);
    console.error("[createProduct] Error hint:", error.hint);
    if (error.message.includes("Could not find") && error.message.includes("column")) {
      console.error("[createProduct] SCHEMA ERROR:", error.message);
      throw new Error(`Schema mismatch: ${error.message}. Run fix-products-columns.sql and refresh Supabase schema cache.`);
    }
    throw new Error("Failed to create product: " + error.message);
  }
  console.log("[createProduct] SUCCESS:", row2?.id);
  return rowToProduct(row2);
}
async function decrementProductStockAfterPurchase(productId) {
  const product = await getProductById(productId);
  if (!product) return false;
  if (product.stock <= 0 || product.status === "sold_out") return false;
  const nextStock = product.stock - 1;
  const nextStatus = normalizeProductStatus(nextStock);
  const { data, error } = await supabase.from("products").update({ stock: nextStock, status: nextStatus }).eq("id", productId).eq("stock", product.stock).select("id");
  if (error) {
    console.error("[decrementProductStockAfterPurchase]", error.message);
    return false;
  }
  return (data ?? []).length > 0;
}
async function deleteProductById(productId) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error("Failed to delete product: " + error.message);
}
async function adminSetProductStock(productId, stock) {
  const s = Math.max(0, Math.floor(Number(stock)));
  const status = normalizeProductStatus(s);
  console.log("[adminSetProductStock] Updating product ID:", productId, "→ stock:", s, "status:", status);
  const existing = await getProductById(productId);
  if (!existing) {
    throw new Error(`Failed to update stock: product not found (id=${productId})`);
  }
  const { error } = await supabase.from("products").update({ stock: s, status }).eq("id", productId);
  if (error) throw new Error("Failed to update stock: " + error.message);
  const updated = await getProductById(productId);
  if (!updated) throw new Error("Updated but could not re-fetch product (id=" + productId + ")");
  console.log("[adminSetProductStock] OK");
  return updated;
}
async function getAllProducts() {
  await ensureSeeded();
  const { data, error } = await supabase.from("products").select("*").order("status", { ascending: true });
  if (error) {
    console.error("[getAllProducts]", error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}
async function createOrder(userId2, productId, amountUsdCents) {
  const id = `ORD-${Date.now()}-${crypto$1.randomBytes(4).toString("hex")}`;
  const now = Date.now();
  const { data, error } = await supabase.from("orders").insert({
    id,
    user_id: userId2,
    product_id: productId,
    amount_usd_cents: amountUsdCents,
    status: "pending",
    created_at: now
  }).select().single();
  if (error) throw new Error("Failed to create order: " + error.message);
  return rowToOrder(data);
}
async function completeOrder(orderId2, cardDetails2) {
  const { error } = await supabase.from("orders").update({ status: "completed", card_details: cardDetails2 ?? null }).eq("id", orderId2);
  if (error) throw new Error("Failed to complete order: " + error.message);
}
async function getUserOrders(userId2, limit = 50) {
  const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId2).order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[getUserOrders]", error.message);
    return [];
  }
  return (data ?? []).map(rowToOrder);
}
async function getAllOrders(limit = 200) {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[getAllOrders]", error.message);
    return [];
  }
  return (data ?? []).map(rowToOrder);
}
async function createDeposit(userId2, orderSn, amountInrPaise, amountUsdCents) {
  const id = `DEP-${Date.now()}-${crypto$1.randomBytes(4).toString("hex")}`;
  const now = Date.now();
  const { data, error } = await supabase.from("deposits").insert({
    id,
    user_id: userId2,
    order_sn: orderSn,
    amount_inr_paise: amountInrPaise,
    amount_usd_cents: amountUsdCents,
    status: "pending",
    created_at: now
  }).select().single();
  if (error) throw new Error("Failed to create deposit: " + error.message);
  return rowToDeposit(data);
}
async function findDepositByOrderSn(orderSn) {
  const { data } = await supabase.from("deposits").select("*").eq("order_sn", orderSn).maybeSingle();
  return data ? rowToDeposit(data) : null;
}
async function updateDepositSuccess(depositId, userId2) {
  const { data: dep } = await supabase.from("deposits").select("*").eq("id", depositId).single();
  if (!dep) throw new Error("Deposit not found");
  const now = Date.now();
  await supabase.from("deposits").update({ status: "success", processed_at: now }).eq("id", depositId);
  await adjustWallet(
    userId2,
    Number(dep.amount_usd_cents),
    "deposit",
    `UPI deposit ₹${(Number(dep.amount_inr_paise) / 100).toFixed(0)} → $${(Number(dep.amount_usd_cents) / 100).toFixed(2)}`,
    depositId
  );
}
async function getUserDeposits(userId2, limit = 20) {
  const { data, error } = await supabase.from("deposits").select("*").eq("user_id", userId2).order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[getUserDeposits]", error.message);
    return [];
  }
  return (data ?? []).map(rowToDeposit);
}
async function getUserTransactions(userId2, limit = 50) {
  const { data, error } = await supabase.from("transactions").select("*").eq("user_id", userId2).order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[getUserTransactions]", error.message);
    return [];
  }
  return (data ?? []).map(rowToTransaction);
}
async function isCallbackProcessed(orderSn) {
  const { data } = await supabase.from("processed_callbacks").select("order_sn").eq("order_sn", orderSn).maybeSingle();
  return !!data;
}
async function markCallbackProcessed(orderSn) {
  await supabase.from("processed_callbacks").upsert(
    { order_sn: orderSn, processed_at: Date.now() },
    { onConflict: "order_sn", ignoreDuplicates: true }
  );
}
async function getAdminStats() {
  await ensureSeeded();
  const [usersRes, ordersRes, txRes, prodAvailRes, prodSoldRes] = await Promise.all([
    supabase.from("users").select("role", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("orders").select("amount_usd_cents,status").limit(2e3),
    supabase.from("transactions").select("amount_usd_cents").eq("type", "deposit").limit(2e3),
    supabase.from("products").select("id", { count: "exact", head: true }).or("status.eq.active,status.eq.in_stock"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "sold_out")
  ]);
  const orders = ordersRes.data ?? [];
  const totalRevenueCents = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.amount_usd_cents), 0);
  const totalDepositedCents = (txRes.data ?? []).reduce((s, t) => s + Number(t.amount_usd_cents), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  return {
    totalUsers: usersRes.count ?? 0,
    totalOrders,
    completedOrders,
    totalRevenueCents,
    totalDepositedCents,
    productsAvailable: prodAvailRes.count ?? 0,
    productsSold: prodSoldRes.count ?? 0
  };
}
const db_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adjustWallet,
  adminSetBalance,
  adminSetProductStock,
  completeOrder,
  createDeposit,
  createOrder,
  createProduct,
  createUser,
  decrementProductStockAfterPurchase,
  deleteProductById,
  ensureAdminUser,
  ensureSeeded,
  findDepositByOrderSn,
  findUserByEmail,
  findUserById,
  findUserByQuery,
  getAdminStats,
  getAllOrders,
  getAllProducts,
  getAllUsers,
  getProductById,
  getPublicProducts,
  getUserDeposits,
  getUserOrders,
  getUserTransactions,
  getWalletBalance,
  isCallbackProcessed,
  markCallbackProcessed,
  updateDepositSuccess,
  verifyPassword
}, Symbol.toStringTag, { value: "Module" }));
async function loader$e({ request }) {
  const session = parseSession(request);
  if (!session) {
    return redirect("/login");
  }
  console.log("USER [dashboard]:", session.userId);
  const walletUsd = await getWalletBalance(session.userId);
  console.log("WALLET [dashboard]:", walletUsd);
  const [user, orders, transactions] = await Promise.all([
    findUserById(session.userId),
    getUserOrders(session.userId, 50),
    getUserTransactions(session.userId, 50)
  ]);
  if (!user) {
    return redirect("/login");
  }
  console.log(
    `[dashboard loader] userId=${session.userId} wallet_usd=${walletUsd} orders=${orders.length} transactions=${transactions.length}`
  );
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const now = Date.now();
  const DAY_MS2 = 24 * 60 * 60 * 1e3;
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const cutoff = startOfToday - 13 * DAY_MS2;
  const [depositsResult, ordersResult] = await Promise.all([
    supabase.from("transactions").select("amount_usd_cents, created_at").eq("user_id", session.userId).eq("type", "deposit").gte("created_at", cutoff),
    supabase.from("orders").select("amount_usd_cents, created_at").eq("user_id", session.userId).gte("created_at", cutoff)
  ]);
  const depositsData = depositsResult.data || [];
  const ordersData = ordersResult.data || [];
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfToday - i * DAY_MS2;
    const dayEnd = dayStart + DAY_MS2 - 1;
    const dateLabel = new Date(dayStart).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const depsCents = depositsData.filter((d) => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd).reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);
    const ordsCents = ordersData.filter((d) => Number(d.created_at) >= dayStart && Number(d.created_at) <= dayEnd).reduce((sum, d) => sum + Number(d.amount_usd_cents), 0);
    chartData.push({
      date: dateLabel,
      deposits: depsCents / 100,
      orders: ordsCents / 100
    });
  }
  return Response.json({
    // User identity
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    // Wallet
    walletUsd,
    walletDisplay: (walletUsd / 100).toFixed(2),
    totalDepositedUsd: user.totalDepositedUsd,
    totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
    // Orders
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    // Recent transactions
    transactions: transactions.slice(0, 10).map((t) => ({
      id: t.id,
      type: t.type,
      amount: (t.amountUsdCents / 100).toFixed(2),
      balanceAfter: (t.balanceAfterCents / 100).toFixed(2),
      description: t.description,
      createdAt: t.createdAt
    })),
    // Chart grouping
    chartData
  });
}
const userDashboard = UNSAFE_withComponentProps(function UserDashboardPage() {
  const data = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$w.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsxs("div", {
      className: styles$w.inner,
      children: [/* @__PURE__ */ jsx(StatsOverview, {
        serverData: data
      }), /* @__PURE__ */ jsx(ActivityCharts, {
        serverData: data
      }), /* @__PURE__ */ jsx(QuickActions, {})]
    })]
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: userDashboard,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
const wrap$b = "_wrap_ks1f7_1";
const fieldGroup$5 = "_fieldGroup_ks1f7_7";
const label$5 = "_label_ks1f7_13";
const inputWrap = "_inputWrap_ks1f7_21";
const input$5 = "_input_ks1f7_21";
const receiveRow = "_receiveRow_ks1f7_45";
const receiveLabel = "_receiveLabel_ks1f7_55";
const receiveValue = "_receiveValue_ks1f7_60";
const howItWorks = "_howItWorks_ks1f7_70";
const howHeader = "_howHeader_ks1f7_77";
const howIcon = "_howIcon_ks1f7_84";
const howTitle = "_howTitle_ks1f7_98";
const steps = "_steps_ks1f7_104";
const proceedBtn = "_proceedBtn_ks1f7_133";
const errorMsg = "_errorMsg_ks1f7_163";
const successMsg = "_successMsg_ks1f7_175";
const styles$v = {
  wrap: wrap$b,
  fieldGroup: fieldGroup$5,
  label: label$5,
  inputWrap,
  input: input$5,
  receiveRow,
  receiveLabel,
  receiveValue,
  howItWorks,
  howHeader,
  howIcon,
  howTitle,
  steps,
  proceedBtn,
  errorMsg,
  successMsg
};
const RATE = 95;
const MIN_INR$1 = 2e3;
function UpiDepositForm() {
  const [amount2, setAmount] = useState("");
  const [depositState, setDepositState] = useState({ status: "idle", message: "" });
  const numAmount = parseInt(amount2, 10) || 0;
  const usdValue = numAmount > 0 ? (numAmount / RATE).toFixed(2) : "0.00";
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };
  const handleProceed = async () => {
    if (numAmount < MIN_INR$1) {
      setDepositState({
        status: "error",
        message: `Minimum deposit amount is ${MIN_INR$1.toLocaleString()} INR`
      });
      return;
    }
    setDepositState({ status: "loading", message: "Creating secure payment order..." });
    try {
      const res = await fetch("/api/deposit/create", {
        method: "POST",
        // credentials: "include" is CRITICAL — it tells the browser to send the
        // HttpOnly session cookie with the request. Without this, the server
        // sees no cookie and returns 401 even when the user is logged in.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: numAmount })
      });
      const data = await res.json();
      if (res.status === 401) {
        setDepositState({
          status: "error",
          message: "Session expired. Please log in again."
        });
        return;
      }
      if (!res.ok) {
        setDepositState({
          status: "error",
          message: data.error ?? "Payment gateway error. Please try again."
        });
        return;
      }
      setDepositState({
        status: "success",
        message: `Order created! You will receive $${data.amountUsd} USD after payment.`,
        payUrl: data.payUrl,
        amountUsd: data.amountUsd
      });
      if (data.payUrl) {
        window.open(data.payUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setDepositState({ status: "error", message: "Network error. Please check your connection." });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$v.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$v.fieldGroup, children: [
      /* @__PURE__ */ jsxs("label", { className: styles$v.label, children: [
        "Amount (INR) — Minimum ",
        MIN_INR$1.toLocaleString(),
        " INR"
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$v.inputWrap, children: /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$v.input,
          type: "text",
          inputMode: "numeric",
          pattern: "[0-9]*",
          placeholder: "e.g. 2000",
          value: amount2,
          onChange: handleChange,
          disabled: depositState.status === "loading",
          autoComplete: "off"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$v.receiveRow, children: [
      /* @__PURE__ */ jsx("span", { className: styles$v.receiveLabel, children: "You will receive:" }),
      /* @__PURE__ */ jsxs("span", { className: styles$v.receiveValue, children: [
        "$",
        usdValue,
        " USD"
      ] })
    ] }),
    depositState.status === "error" && /* @__PURE__ */ jsx("div", { className: styles$v.errorMsg, children: depositState.message }),
    depositState.status === "success" && /* @__PURE__ */ jsxs("div", { className: styles$v.successMsg, children: [
      /* @__PURE__ */ jsx(CheckCircle, { size: 14 }),
      " ",
      depositState.message
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$v.howItWorks, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$v.howHeader, children: [
        /* @__PURE__ */ jsx("span", { className: styles$v.howIcon, children: "i" }),
        /* @__PURE__ */ jsx("span", { className: styles$v.howTitle, children: "How UPI Deposit Works" })
      ] }),
      /* @__PURE__ */ jsxs("ol", { className: styles$v.steps, children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "Enter amount in INR (minimum ",
          MIN_INR$1.toLocaleString(),
          " INR)"
        ] }),
        /* @__PURE__ */ jsx("li", { children: "We create a secure UPI Order via LG-Pay gateway" }),
        /* @__PURE__ */ jsx("li", { children: "You'll be redirected to the payment page" }),
        /* @__PURE__ */ jsx("li", { children: "Complete payment using any UPI app" }),
        /* @__PURE__ */ jsx("li", { children: "USD balance added automatically after confirmation" })
      ] })
    ] }),
    depositState.status === "success" && depositState.payUrl ? /* @__PURE__ */ jsxs(
      "a",
      {
        href: depositState.payUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: styles$v.proceedBtn,
        style: {
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        },
        children: [
          /* @__PURE__ */ jsx(ExternalLink, { size: 16 }),
          " Open Payment Page"
        ]
      }
    ) : /* @__PURE__ */ jsx(
      "button",
      {
        className: styles$v.proceedBtn,
        onClick: handleProceed,
        disabled: depositState.status === "loading" || numAmount < MIN_INR$1,
        children: depositState.status === "loading" ? "Creating order..." : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ArrowRight, { size: 16 }),
          " Proceed to Payment"
        ] })
      }
    )
  ] });
}
const wrap$a = "_wrap_1eetj_1";
const fieldGroup$4 = "_fieldGroup_1eetj_7";
const label$4 = "_label_1eetj_13";
const coinBtns = "_coinBtns_1eetj_21";
const coinBtn = "_coinBtn_1eetj_21";
const coinBtnActive = "_coinBtnActive_1eetj_43";
const amountRow$1 = "_amountRow_1eetj_65";
const input$4 = "_input_1eetj_71";
const approxField = "_approxField_1eetj_91";
const generateBtn = "_generateBtn_1eetj_105";
const styles$u = {
  wrap: wrap$a,
  fieldGroup: fieldGroup$4,
  label: label$4,
  coinBtns,
  coinBtn,
  coinBtnActive,
  amountRow: amountRow$1,
  input: input$4,
  approxField,
  generateBtn
};
const COINS = [
  { symbol: "USDT(TRC20)", key: "usdt", rate: 1 },
  { symbol: "BTC", key: "btc", rate: 1 },
  { symbol: "LTC (BEP20)", key: "ltc", rate: 1 },
  { symbol: "ETH", key: "eth", rate: 1 }
];
const MIN_USD = 25;
function CryptoDepositForm() {
  const [selectedCoin, setSelectedCoin] = useState("usdt");
  const [amount2, setAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const coin = COINS.find((c) => c.key === selectedCoin) ?? COINS[0];
  const numAmount = parseFloat(amount2) || 0;
  const approxPay = numAmount > 0 ? `${numAmount.toFixed(4)} ${coin.symbol.split("(")[0].trim()}` : `1 USDT = $1.0000 (live rate)`;
  return /* @__PURE__ */ jsxs("div", { className: styles$u.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$u.fieldGroup, children: [
      /* @__PURE__ */ jsx("label", { className: styles$u.label, children: "Select Cryptocurrency" }),
      /* @__PURE__ */ jsx("div", { className: styles$u.coinBtns, children: COINS.map((c) => /* @__PURE__ */ jsx(
        "button",
        {
          className: classNames(styles$u.coinBtn, { [styles$u.coinBtnActive]: selectedCoin === c.key }),
          onClick: () => setSelectedCoin(c.key),
          children: c.symbol
        },
        c.key
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$u.amountRow, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$u.fieldGroup, children: [
        /* @__PURE__ */ jsxs("label", { className: styles$u.label, children: [
          "Amount (USD) — Minimum $",
          MIN_USD
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$u.input,
            type: "text",
            inputMode: "decimal",
            placeholder: "Enter USD amount",
            value: amount2,
            onChange: (e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$u.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$u.label, children: "You will pay (approx)" }),
        /* @__PURE__ */ jsx("div", { className: styles$u.approxField, children: approxPay })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$u.fieldGroup, children: [
      /* @__PURE__ */ jsx("label", { className: styles$u.label, children: "Transaction Reference (Optional)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$u.input,
          type: "text",
          placeholder: "e.g., TXN12345 or transaction hash",
          value: txnRef,
          onChange: (e) => setTxnRef(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("button", { className: styles$u.generateBtn, children: [
      /* @__PURE__ */ jsx(Lock, { size: 14 }),
      " Generate Deposit Address"
    ] })
  ] });
}
const card$1 = "_card_1qu46_1";
const header$5 = "_header_1qu46_24";
const headerLeft$2 = "_headerLeft_1qu46_31";
const iconWrap = "_iconWrap_1qu46_37";
const iconImage = "_iconImage_1qu46_46";
const title$8 = "_title_1qu46_52";
const subtitle$4 = "_subtitle_1qu46_59";
const backBtn$2 = "_backBtn_1qu46_64";
const rateBanner = "_rateBanner_1qu46_84";
const rateIcon = "_rateIcon_1qu46_95";
const rateTitle = "_rateTitle_1qu46_101";
const rateText = "_rateText_1qu46_108";
const tabs$1 = "_tabs_1qu46_113";
const tab$1 = "_tab_1qu46_113";
const tabActive$1 = "_tabActive_1qu46_142";
const footerNote = "_footerNote_1qu46_147";
const styles$t = {
  card: card$1,
  header: header$5,
  headerLeft: headerLeft$2,
  iconWrap,
  iconImage,
  title: title$8,
  subtitle: subtitle$4,
  backBtn: backBtn$2,
  rateBanner,
  rateIcon,
  rateTitle,
  rateText,
  tabs: tabs$1,
  tab: tab$1,
  tabActive: tabActive$1,
  footerNote
};
function WalletDepositCard({ method, onMethodChange }) {
  return /* @__PURE__ */ jsxs("div", { className: styles$t.card, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$t.header, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$t.headerLeft, children: [
        /* @__PURE__ */ jsx("div", { className: styles$t.iconWrap, children: /* @__PURE__ */ jsx("img", { src: "/assets/icons/wallet.png", className: styles$t.iconImage, alt: "Wallet deposit" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: styles$t.title, children: "Wallet Deposit" }),
          /* @__PURE__ */ jsx("div", { className: styles$t.subtitle, children: "Add funds to your account" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: styles$t.backBtn, children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
        " Back"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$t.rateBanner, children: [
      /* @__PURE__ */ jsx(Info, { size: 14, className: styles$t.rateIcon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: styles$t.rateTitle, children: "Exchange Rate Info" }),
        /* @__PURE__ */ jsx("div", { className: styles$t.rateText, children: "₹95 = $1 USD fixed rate for all UPI deposits" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$t.tabs, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: classNames(styles$t.tab, { [styles$t.tabActive]: method === "upi" }),
          onClick: () => onMethodChange("upi"),
          children: "UPI QR"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: classNames(styles$t.tab, { [styles$t.tabActive]: method === "crypto" }),
          onClick: () => onMethodChange("crypto"),
          children: "Crypto"
        }
      )
    ] }),
    method === "upi" ? /* @__PURE__ */ jsx(UpiDepositForm, {}) : /* @__PURE__ */ jsx(CryptoDepositForm, {}),
    /* @__PURE__ */ jsx("p", { className: styles$t.footerNote, children: "Crypto confirmations ke baad admin approve karega. UPI callbacks auto-approve kar sakte hain." })
  ] });
}
const page$8 = "_page_11hz9_1";
const styles$s = {
  page: page$8
};
const walletDeposit = UNSAFE_withComponentProps(function WalletDepositPage() {
  const [method, setMethod] = useState("upi");
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$s.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsx(WalletDepositCard, {
      method,
      onMethodChange: setMethod
    })]
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: walletDeposit
}, Symbol.toStringTag, { value: "Module" }));
const wrap$9 = "_wrap_fk48y_1";
const header$4 = "_header_fk48y_20";
const filterIcon = "_filterIcon_fk48y_27";
const title$7 = "_title_fk48y_31";
const row$2 = "_row_fk48y_37";
const fieldGroup$3 = "_fieldGroup_fk48y_49";
const label$3 = "_label_fk48y_55";
const input$3 = "_input_fk48y_61";
const select$1 = "_select_fk48y_77";
const checkboxGroup = "_checkboxGroup_fk48y_95";
const checkboxLabel = "_checkboxLabel_fk48y_101";
const checkbox = "_checkbox_fk48y_95";
const actionBtns = "_actionBtns_fk48y_117";
const applyBtn = "_applyBtn_fk48y_123";
const resetBtn$1 = "_resetBtn_fk48y_141";
const styles$r = {
  wrap: wrap$9,
  header: header$4,
  filterIcon,
  title: title$7,
  row: row$2,
  fieldGroup: fieldGroup$3,
  label: label$3,
  input: input$3,
  select: select$1,
  checkboxGroup,
  checkboxLabel,
  checkbox,
  actionBtns,
  applyBtn,
  resetBtn: resetBtn$1
};
function CardsFilter({ filters, onChange, onReset }) {
  return /* @__PURE__ */ jsxs("div", { className: styles$r.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$r.header, children: [
      /* @__PURE__ */ jsx(Filter, { size: 14, className: styles$r.filterIcon }),
      /* @__PURE__ */ jsx("span", { className: styles$r.title, children: "Filter Cards" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$r.row, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "BIN / SKU" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$r.input,
            type: "text",
            placeholder: "Search BIN...",
            value: filters.bin,
            onChange: (e) => onChange({ bin: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "Country" }),
        /* @__PURE__ */ jsxs("select", { className: styles$r.select, value: filters.country, onChange: (e) => onChange({ country: e.target.value }), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Countries" }),
          /* @__PURE__ */ jsx("option", { value: "US", children: "United States" }),
          /* @__PURE__ */ jsx("option", { value: "UK", children: "United Kingdom" }),
          /* @__PURE__ */ jsx("option", { value: "CA", children: "Canada" }),
          /* @__PURE__ */ jsx("option", { value: "AU", children: "Australia" }),
          /* @__PURE__ */ jsx("option", { value: "DE", children: "Germany" }),
          /* @__PURE__ */ jsx("option", { value: "FR", children: "France" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "Provider" }),
        /* @__PURE__ */ jsxs("select", { className: styles$r.select, value: filters.provider, onChange: (e) => onChange({ provider: e.target.value }), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Providers" }),
          /* @__PURE__ */ jsx("option", { value: "VISA", children: "VISA" }),
          /* @__PURE__ */ jsx("option", { value: "MASTERCARD", children: "MASTERCARD" }),
          /* @__PURE__ */ jsx("option", { value: "AMEX", children: "AMEX" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "Type" }),
        /* @__PURE__ */ jsxs("select", { className: styles$r.select, value: filters.type, onChange: (e) => onChange({ type: e.target.value }), children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All Types" }),
          /* @__PURE__ */ jsx("option", { value: "DEBIT", children: "DEBIT" }),
          /* @__PURE__ */ jsx("option", { value: "CREDIT", children: "CREDIT" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$r.row, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "Min Price ($)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$r.input,
            type: "number",
            placeholder: "0.00",
            value: filters.minPrice,
            onChange: (e) => onChange({ minPrice: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$r.fieldGroup, children: [
        /* @__PURE__ */ jsx("label", { className: styles$r.label, children: "Max Price ($)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$r.input,
            type: "number",
            placeholder: "999.00",
            value: filters.maxPrice,
            onChange: (e) => onChange({ maxPrice: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$r.checkboxGroup, children: /* @__PURE__ */ jsxs("label", { className: styles$r.checkboxLabel, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$r.checkbox,
            type: "checkbox",
            checked: filters.fullAddress,
            onChange: (e) => onChange({ fullAddress: e.target.checked })
          }
        ),
        "Full Address"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$r.actionBtns, children: [
        /* @__PURE__ */ jsx("button", { className: styles$r.applyBtn, onClick: () => onChange({}), children: "Apply" }),
        /* @__PURE__ */ jsx("button", { className: styles$r.resetBtn, onClick: onReset, children: "Reset" })
      ] })
    ] })
  ] });
}
const CART_KEY = "cc_shop_cart";
function readCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}
function useCart() {
  const [cart, setCart] = useState(readCart);
  const addToCart = useCallback((card2) => {
    setCart((prev) => {
      if (prev.some((item2) => item2.id === card2.id)) return prev;
      const next = [
        ...prev,
        {
          id: card2.id,
          name: card2.name,
          brand: card2.provider,
          country: card2.country,
          countryFlag: card2.countryFlag,
          type: card2.type,
          price: card2.price
        }
      ];
      writeCart(next);
      return next;
    });
  }, []);
  const removeFromCart = useCallback((id) => {
    setCart((prev) => {
      const next = prev.filter((item2) => item2.id !== id);
      writeCart(next);
      return next;
    });
  }, []);
  const clearCart = useCallback(() => {
    writeCart([]);
    setCart([]);
  }, []);
  return { cart, addToCart, removeFromCart, clearCart };
}
const tableWrap$6 = "_tableWrap_q7m1y_1";
const table$5 = "_table_q7m1y_1";
const row$1 = "_row_q7m1y_43";
const bin = "_bin_q7m1y_63";
const provider = "_provider_q7m1y_72";
const typeBadge$1 = "_typeBadge_q7m1y_81";
const debit = "_debit_q7m1y_90";
const credit = "_credit_q7m1y_96";
const country = "_country_q7m1y_112";
const state = "_state_q7m1y_119";
const zip = "_zip_q7m1y_128";
const booleanBadge = "_booleanBadge_q7m1y_134";
const booleanYes = "_booleanYes_q7m1y_145";
const booleanNo = "_booleanNo_q7m1y_151";
const bank = "_bank_q7m1y_157";
const price$1 = "_price_q7m1y_164";
const buyBtn$1 = "_buyBtn_q7m1y_174";
const empty$1 = "_empty_q7m1y_192";
const styles$q = {
  tableWrap: tableWrap$6,
  table: table$5,
  row: row$1,
  bin,
  provider,
  typeBadge: typeBadge$1,
  debit,
  credit,
  country,
  state,
  zip,
  booleanBadge,
  booleanYes,
  booleanNo,
  bank,
  price: price$1,
  buyBtn: buyBtn$1,
  empty: empty$1
};
function normalizeProvider(provider2) {
  return String(provider2 ?? "").trim().toUpperCase() || "UNKNOWN";
}
function maskZip(zip2) {
  const value2 = String(zip2 ?? "").trim();
  if (!value2) return "NO";
  if (value2.length <= 2) return value2;
  return `${value2[0]}***${value2[value2.length - 1]}`;
}
function CardsTable({ cards }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, addToCart } = useCart();
  const handleBuy = (card2) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    addToCart(card2);
    navigate("/cart");
  };
  return /* @__PURE__ */ jsx("div", { className: styles$q.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$q.table, children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "BIN" }),
      /* @__PURE__ */ jsx("th", { children: "PROVIDER" }),
      /* @__PURE__ */ jsx("th", { children: "TYPE" }),
      /* @__PURE__ */ jsx("th", { children: "COUNTRY" }),
      /* @__PURE__ */ jsx("th", { children: "STATE" }),
      /* @__PURE__ */ jsx("th", { children: "ADDRESS FLAG" }),
      /* @__PURE__ */ jsx("th", { children: "ZIP" }),
      /* @__PURE__ */ jsx("th", { children: "BANK" }),
      /* @__PURE__ */ jsx("th", { children: "PRICE" }),
      /* @__PURE__ */ jsx("th", {})
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      cards.map((card2) => /* @__PURE__ */ jsxs("tr", { className: `${styles$q.row} card-data`, children: [
        /* @__PURE__ */ jsx("td", { className: styles$q.bin, children: card2.bin }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$q.provider, children: normalizeProvider(card2.provider) }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `${styles$q.typeBadge} ${card2.type === "CREDIT" ? styles$q.credit : styles$q.debit}`, children: card2.type }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$q.country, children: String(card2.country ?? "").trim().toUpperCase() }) }),
        /* @__PURE__ */ jsx("td", { className: styles$q.state, children: card2.state }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `${styles$q.booleanBadge} ${card2.extras ? styles$q.booleanYes : styles$q.booleanNo}`, children: card2.extras ? "YES" : "NO" }) }),
        /* @__PURE__ */ jsx("td", { className: styles$q.zip, children: maskZip(card2.zip) }),
        /* @__PURE__ */ jsx("td", { className: styles$q.bank, children: card2.bank }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("span", { className: styles$q.price, children: [
          "$",
          card2.price.toFixed(2)
        ] }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
          "button",
          {
            className: styles$q.buyBtn,
            onClick: () => handleBuy(card2),
            title: !card2.inStock ? "Sold out" : isAuthenticated() ? cart.some((c) => c.id === card2.id) ? "Already in cart" : "Buy card" : "Login to buy",
            disabled: !card2.inStock || isAuthenticated() && cart.some((c) => c.id === card2.id),
            children: !card2.inStock ? "Sold out" : isAuthenticated() && cart.some((c) => c.id === card2.id) ? "In Cart" : "Buy"
          }
        ) })
      ] }, card2.id)),
      cards.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 12, className: styles$q.empty, children: "No cards match your filters." }) })
    ] })
  ] }) });
}
const wrap$8 = "_wrap_5x95d_1";
const info$1 = "_info_5x95d_22";
const btns = "_btns_5x95d_27";
const btn = "_btn_5x95d_27";
const btnPrimary = "_btnPrimary_5x95d_57";
const styles$p = {
  wrap: wrap$8,
  info: info$1,
  btns,
  btn,
  btnPrimary
};
function TablePagination({ page: page2, totalPages, onPageChange }) {
  return /* @__PURE__ */ jsxs("div", { className: styles$p.wrap, children: [
    /* @__PURE__ */ jsxs("span", { className: styles$p.info, children: [
      "Page ",
      page2,
      " of ",
      totalPages.toLocaleString()
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$p.btns, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: styles$p.btn,
          onClick: () => onPageChange(page2 - 1),
          disabled: page2 <= 1,
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
            " Previous"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: styles$p.btnPrimary,
          onClick: () => onPageChange(page2 + 1),
          disabled: page2 >= totalPages,
          children: [
            "Next ",
            /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
          ]
        }
      )
    ] })
  ] });
}
const page$7 = "_page_juqgd_1";
const inner$3 = "_inner_juqgd_7";
const resultsHeader = "_resultsHeader_juqgd_13";
const resultsIcon = "_resultsIcon_juqgd_27";
const resultsIconImage = "_resultsIconImage_juqgd_36";
const resultsCount = "_resultsCount_juqgd_42";
const resultsPage = "_resultsPage_juqgd_48";
const styles$o = {
  page: page$7,
  inner: inner$3,
  resultsHeader,
  resultsIcon,
  resultsIconImage,
  resultsCount,
  resultsPage
};
const PAGE_SIZE$3 = 20;
const DEFAULT_FILTERS = {
  bin: "",
  country: "",
  provider: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  fullAddress: false
};
function toVirtualCard$1(p) {
  const qty = Number(p.stock ?? 0);
  return {
    id: p.id,
    bin: p.bin,
    provider: p.provider,
    type: p.type,
    expiry: p.expiry,
    name: p.name,
    country: p.country,
    countryFlag: p.countryFlag,
    street: p.street,
    city: p.city,
    state: p.state,
    address: p.address,
    zip: p.zip,
    extras: p.extras ?? null,
    bank: p.bank,
    cardholderName: p.cardholder_name ?? null,
    price: Number(p.price) || 0,
    limit: Number(p.limit) || 0,
    validUntil: p.validUntil,
    inStock: (p.status === "in_stock" || p.status === "active") && qty > 0,
    stock: qty,
    color: p.color || "#3b82f6",
    isValid: Boolean(p.is_100_valid ?? p.is_valid ?? false),
    tag: p.tag ?? null
  };
}
const cardsCatalog = UNSAFE_withComponentProps(function CardsCatalogPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page2, setPage] = useState(1);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function fetchCards() {
      try {
        setLoadError("");
        const res = await fetch("/api/products", {
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load products");
        const next = (data?.products ?? []).map(toVirtualCard$1);
        if (!cancelled) setCards(next);
      } catch {
        if (!cancelled) setLoadError("Could not load cards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCards();
    return () => {
      cancelled = true;
    };
  }, []);
  const filtered = useMemo(() => {
    let list2 = [...cards];
    if (filters.bin) list2 = list2.filter((c) => c.bin.includes(filters.bin));
    if (filters.provider) list2 = list2.filter((c) => c.provider === filters.provider);
    if (filters.type) list2 = list2.filter((c) => c.type === filters.type);
    if (filters.country) list2 = list2.filter((c) => c.country === filters.country);
    if (filters.minPrice) list2 = list2.filter((c) => c.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice) list2 = list2.filter((c) => c.price <= parseFloat(filters.maxPrice));
    if (filters.fullAddress) {
      list2 = list2.filter((c) => Boolean(c.street?.trim()) && Boolean(c.city?.trim()) || c.address && c.address !== "N/A" && c.address.length > 3);
    }
    return list2;
  }, [cards, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE$3));
  const paginated = filtered.slice((page2 - 1) * PAGE_SIZE$3, page2 * PAGE_SIZE$3);
  const handleFilterChange = (f) => {
    setFilters((prev) => ({
      ...prev,
      ...f
    }));
    setPage(1);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$o.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsxs("div", {
      className: styles$o.inner,
      children: [/* @__PURE__ */ jsx(CardsFilter, {
        filters,
        onChange: handleFilterChange,
        onReset: () => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }
      }), /* @__PURE__ */ jsxs("div", {
        className: styles$o.resultsHeader,
        children: [/* @__PURE__ */ jsx("div", {
          className: styles$o.resultsIcon,
          children: /* @__PURE__ */ jsx("img", {
            src: "/assets/icons/credit-card.png",
            className: styles$o.resultsIconImage,
            alt: "Cards"
          })
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("div", {
            className: styles$o.resultsCount,
            children: loading ? "Loading cards…" : `Showing ${paginated.length} of ${filtered.length.toLocaleString()} cards`
          }), /* @__PURE__ */ jsxs("div", {
            className: styles$o.resultsPage,
            children: ["Page ", page2, " of ", totalPages.toLocaleString()]
          })]
        })]
      }), loadError && /* @__PURE__ */ jsx("div", {
        style: {
          color: "#ef4444",
          fontSize: "0.85rem",
          marginBottom: "0.75rem"
        },
        children: loadError
      }), /* @__PURE__ */ jsx(CardsTable, {
        cards: paginated
      }), /* @__PURE__ */ jsx(TablePagination, {
        page: page2,
        totalPages,
        onPageChange: setPage
      })]
    })]
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cardsCatalog
}, Symbol.toStringTag, { value: "Module" }));
const nav = "_nav_18krj_1";
const brand = "_brand_18krj_14";
const brandLogo$1 = "_brandLogo_18krj_22";
const logoImage = "_logoImage_18krj_30";
const brandText = "_brandText_18krj_36";
const brandName = "_brandName_18krj_42";
const brandSub = "_brandSub_18krj_49";
const searchWrap = "_searchWrap_18krj_57";
const searchIcon = "_searchIcon_18krj_64";
const searchInput$3 = "_searchInput_18krj_73";
const navBtns = "_navBtns_18krj_88";
const navBtn = "_navBtn_18krj_88";
const addFundsBtn = "_addFundsBtn_18krj_117";
const styles$n = {
  nav,
  brand,
  brandLogo: brandLogo$1,
  logoImage,
  brandText,
  brandName,
  brandSub,
  searchWrap,
  searchIcon,
  searchInput: searchInput$3,
  navBtns,
  navBtn,
  addFundsBtn
};
function ValidCcNav() {
  return /* @__PURE__ */ jsxs("nav", { className: styles$n.nav, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$n.brand, children: [
      /* @__PURE__ */ jsx("div", { className: styles$n.brandLogo, children: /* @__PURE__ */ jsx("img", { src: "/logo.png?v=2", alt: "Heaven Card logo", className: styles$n.logoImage }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$n.brandText, children: [
        /* @__PURE__ */ jsx("span", { className: styles$n.brandName, children: "Heaven Card" }),
        /* @__PURE__ */ jsx("span", { className: styles$n.brandSub, children: "VALID CC MARKETPLACE" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$n.searchWrap, children: [
      /* @__PURE__ */ jsx(Search, { size: 14, className: styles$n.searchIcon }),
      /* @__PURE__ */ jsx("input", { className: styles$n.searchInput, type: "text", placeholder: "Search gift cards..." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$n.navBtns, children: [
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: styles$n.navBtn, children: [
        /* @__PURE__ */ jsx(LayoutDashboard, { size: 13 }),
        " Dashboard"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: styles$n.navBtn, children: [
        /* @__PURE__ */ jsx(Package, { size: 13 }),
        " Orders"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/deposit", className: `${styles$n.navBtn} ${styles$n.addFundsBtn}`, children: [
        /* @__PURE__ */ jsx(PlusCircle, { size: 13 }),
        " Add Funds"
      ] })
    ] })
  ] });
}
const wrap$7 = "_wrap_1jocw_1";
const textGroup = "_textGroup_1jocw_10";
const title$6 = "_title_1jocw_15";
const subtitle$3 = "_subtitle_1jocw_23";
const allVerifiedBadge = "_allVerifiedBadge_1jocw_28";
const greenDot = "_greenDot_1jocw_42";
const badges = "_badges_1jocw_50";
const badge = "_badge_1jocw_50";
const styles$m = {
  wrap: wrap$7,
  textGroup,
  title: title$6,
  subtitle: subtitle$3,
  allVerifiedBadge,
  greenDot,
  badges,
  badge
};
const BADGES = [
  { icon: CheckCircle, label: "100% Valid Cards" },
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "Secure Payment" },
  { icon: RefreshCcw, label: "100% Refundable*" }
];
function ValidCcHero() {
  return /* @__PURE__ */ jsxs("div", { className: styles$m.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$m.textGroup, children: [
      /* @__PURE__ */ jsx("h1", { className: styles$m.title, children: "100% Valid CC Guaranteed" }),
      /* @__PURE__ */ jsx("p", { className: styles$m.subtitle, children: "Instant digital delivery • Secure wallet payment • 100% Valid" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$m.allVerifiedBadge, children: [
      /* @__PURE__ */ jsx("span", { className: styles$m.greenDot }),
      "All Cards Verified"
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$m.badges, children: BADGES.map(({ icon: Icon, label: label2 }) => /* @__PURE__ */ jsxs("div", { className: styles$m.badge, children: [
      /* @__PURE__ */ jsx(Icon, { size: 13 }),
      label2
    ] }, label2)) })
  ] });
}
function getCardBrandImage(provider2) {
  switch ((provider2 || "").toLowerCase()) {
    case "visa":
      return "/assets/cards/visa.png";
    case "amex":
    case "american express":
      return "/assets/cards/amex.png";
    case "mastercard":
    case "master card":
    case "master":
      return "/assets/cards/mastercard.png";
    case "discover":
      return "/assets/cards/discover.png";
    default:
      return "/assets/cards/default.png";
  }
}
const grid$1 = "_grid_k09v9_1";
const card = "_card_k09v9_7";
const verifiedBadge = "_verifiedBadge_k09v9_22";
const verifiedDot = "_verifiedDot_k09v9_39";
const cardImageWrap = "_cardImageWrap_k09v9_46";
const brandLogo = "_brandLogo_k09v9_57";
const cardInfo = "_cardInfo_k09v9_65";
const cardName$1 = "_cardName_k09v9_69";
const cardMeta = "_cardMeta_k09v9_77";
const providerTag = "_providerTag_k09v9_84";
const dot$1 = "_dot_k09v9_91";
const typeTag = "_typeTag_k09v9_96";
const description = "_description_k09v9_102";
const priceRow = "_priceRow_k09v9_109";
const startingFrom = "_startingFrom_k09v9_116";
const price = "_price_k09v9_109";
const buyBtn = "_buyBtn_k09v9_135";
const footer$1 = "_footer_k09v9_155";
const footerItem = "_footerItem_k09v9_163";
const styles$l = {
  grid: grid$1,
  card,
  verifiedBadge,
  verifiedDot,
  cardImageWrap,
  brandLogo,
  cardInfo,
  cardName: cardName$1,
  cardMeta,
  providerTag,
  dot: dot$1,
  typeTag,
  description,
  priceRow,
  startingFrom,
  price,
  buyBtn,
  footer: footer$1,
  footerItem
};
function toVirtualCard(p) {
  const qty = Number(p.stock ?? 0);
  return {
    id: p.id,
    bin: p.bin,
    provider: p.provider,
    type: p.type,
    expiry: p.expiry,
    name: p.name,
    country: p.country,
    countryFlag: p.countryFlag,
    street: p.street,
    city: p.city,
    state: p.state,
    address: p.address,
    zip: p.zip,
    extras: p.extras ?? null,
    bank: p.bank,
    cardholderName: p.cardholder_name ?? null,
    price: Number(p.price) || 0,
    limit: Number(p.limit) || 0,
    validUntil: p.validUntil,
    inStock: p.status === "in_stock" && qty > 0,
    stock: qty,
    color: p.color || "#10154a",
    isValid: Boolean(p.is_100_valid ?? p.is_valid ?? false),
    tag: p.tag ?? null
  };
}
function ValidCcGrid() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function fetchValid() {
      try {
        const res = await fetch("/api/products?valid=1", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return;
        const next = (data?.products ?? []).map(toVirtualCard);
        if (!cancelled) setCards(next);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchValid();
    const id = window.setInterval(fetchValid, 2e3);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  const handleBuy = (card2) => {
    if (!card2.inStock) return;
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    addToCart(card2);
    navigate("/cart");
  };
  return /* @__PURE__ */ jsx("div", { className: styles$l.grid, children: loading && cards.length === 0 ? /* @__PURE__ */ jsx("div", { style: { color: "#888", padding: "2rem", fontSize: "0.9rem" }, children: "Loading…" }) : cards.length === 0 ? /* @__PURE__ */ jsx("div", { style: { color: "#888", padding: "2rem", fontSize: "0.9rem" }, children: "No 100% Valid cards available." }) : cards.map((card2) => /* @__PURE__ */ jsxs("div", { className: styles$l.card, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$l.verifiedBadge, children: [
      /* @__PURE__ */ jsx("span", { className: styles$l.verifiedDot }),
      "Verified"
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$l.cardImageWrap, children: /* @__PURE__ */ jsx("img", { className: styles$l.brandLogo, src: getCardBrandImage(card2.provider), alt: card2.provider }) }),
    /* @__PURE__ */ jsxs("div", { className: `${styles$l.cardInfo} card-data`, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$l.cardName, children: card2.provider }),
      /* @__PURE__ */ jsxs("div", { className: styles$l.cardMeta, children: [
        /* @__PURE__ */ jsx("span", { className: styles$l.providerTag, children: card2.provider.toUpperCase() }),
        /* @__PURE__ */ jsx("span", { className: styles$l.dot, children: "•" }),
        /* @__PURE__ */ jsx("span", { className: styles$l.typeTag, children: card2.type })
      ] }),
      /* @__PURE__ */ jsx("p", { className: styles$l.description, children: "Instant CC deliver to your Heaven card account after successful payment." }),
      /* @__PURE__ */ jsxs("div", { className: styles$l.priceRow, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: styles$l.startingFrom, children: "STARTING FROM" }),
          /* @__PURE__ */ jsxs("div", { className: styles$l.price, children: [
            "$",
            card2.price.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$l.buyBtn,
            onClick: () => handleBuy(card2),
            disabled: !card2.inStock,
            title: !card2.inStock ? "Sold out" : isAuthenticated() ? "Buy now" : "Login to buy",
            children: [
              /* @__PURE__ */ jsx(ShoppingCart, { size: 12 }),
              " Buy Now"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$l.footer, children: [
        /* @__PURE__ */ jsxs("span", { className: styles$l.footerItem, children: [
          /* @__PURE__ */ jsx(Zap, { size: 10 }),
          " Instant delivery"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: styles$l.footerItem, children: [
          /* @__PURE__ */ jsx(Shield, { size: 10 }),
          " Secure"
        ] })
      ] })
    ] })
  ] }, card2.id)) });
}
const page$6 = "_page_1cerz_1";
const inner$2 = "_inner_1cerz_7";
const styles$k = {
  page: page$6,
  inner: inner$2
};
const validCc = UNSAFE_withComponentProps(function ValidCcPage() {
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$k.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsx(ValidCcNav, {}), /* @__PURE__ */ jsxs("div", {
      className: styles$k.inner,
      children: [/* @__PURE__ */ jsx(ValidCcHero, {}), /* @__PURE__ */ jsx(ValidCcGrid, {})]
    })]
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: validCc
}, Symbol.toStringTag, { value: "Module" }));
const page$5 = "_page_1d0fv_1";
const inner$1 = "_inner_1d0fv_9";
const styles$j = {
  page: page$5,
  inner: inner$1
};
const validGuarantee = UNSAFE_withComponentProps(function ValidGuaranteePage() {
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$j.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsxs("div", {
      className: styles$j.inner,
      children: [/* @__PURE__ */ jsx(ValidCcHero, {}), /* @__PURE__ */ jsx(ValidCcGrid, {})]
    })]
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: validGuarantee
}, Symbol.toStringTag, { value: "Module" }));
const container$2 = "_container_q3k98_1";
const header$3 = "_header_q3k98_7";
const title$5 = "_title_q3k98_16";
const subtitle$2 = "_subtitle_q3k98_24";
const headerActions = "_headerActions_q3k98_30";
const statusSelect = "_statusSelect_q3k98_36";
const filterBtn = "_filterBtn_q3k98_51";
const resetBtn = "_resetBtn_q3k98_68";
const emptyCard = "_emptyCard_q3k98_88";
const emptyIcon = "_emptyIcon_q3k98_111";
const emptyTitle$1 = "_emptyTitle_q3k98_122";
const emptySubtitle$1 = "_emptySubtitle_q3k98_130";
const shopBtn = "_shopBtn_q3k98_136";
const ordersList = "_ordersList_q3k98_154";
const orderCard = "_orderCard_q3k98_160";
const orderRow = "_orderRow_q3k98_172";
const orderLeft = "_orderLeft_q3k98_181";
const orderIcon = "_orderIcon_q3k98_187";
const orderInfo = "_orderInfo_q3k98_198";
const orderName = "_orderName_q3k98_204";
const orderId = "_orderId_q3k98_210";
const orderRight = "_orderRight_q3k98_216";
const orderAmount = "_orderAmount_q3k98_223";
const statusBadge = "_statusBadge_q3k98_229";
const status_completed = "_status_completed_q3k98_238";
const status_pending = "_status_pending_q3k98_243";
const status_failed = "_status_failed_q3k98_248";
const orderDate = "_orderDate_q3k98_253";
const cardReveal$1 = "_cardReveal_q3k98_259";
const cardDetails$1 = "_cardDetails_q3k98_265";
const cardDetailItem = "_cardDetailItem_q3k98_271";
const styles$i = {
  container: container$2,
  header: header$3,
  title: title$5,
  subtitle: subtitle$2,
  headerActions,
  statusSelect,
  filterBtn,
  resetBtn,
  emptyCard,
  emptyIcon,
  emptyTitle: emptyTitle$1,
  emptySubtitle: emptySubtitle$1,
  shopBtn,
  ordersList,
  orderCard,
  orderRow,
  orderLeft,
  orderIcon,
  orderInfo,
  orderName,
  orderId,
  orderRight,
  orderAmount,
  statusBadge,
  status_completed,
  status_pending,
  status_failed,
  orderDate,
  cardReveal: cardReveal$1,
  cardDetails: cardDetails$1,
  cardDetailItem
};
const STATUS_OPTIONS = ["All Statuses", "completed", "pending", "failed"];
const STATUS_LABELS = {
  "All Statuses": "All Statuses",
  completed: "Completed",
  pending: "Pending",
  failed: "Failed"
};
function MyOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.ok ? r.json() : { orders: [] }).then((data) => setOrders(data.orders ?? [])).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);
  const filtered = statusFilter === "All Statuses" ? orders : orders.filter((o) => o.status === statusFilter);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: styles$i.container, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$i.header, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: styles$i.title, children: "My Orders" }),
        /* @__PURE__ */ jsxs("p", { className: styles$i.subtitle, children: [
          orders.length,
          " total order",
          orders.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$i.headerActions, children: [
        /* @__PURE__ */ jsx(
          "select",
          {
            className: styles$i.statusSelect,
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            children: STATUS_OPTIONS.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABELS[s] }, s))
          }
        ),
        /* @__PURE__ */ jsxs("button", { className: styles$i.resetBtn, onClick: () => setStatusFilter("All Statuses"), children: [
          /* @__PURE__ */ jsx(RotateCcw, { size: 13 }),
          " Reset"
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: styles$i.emptyCard, children: /* @__PURE__ */ jsx("p", { className: styles$i.emptySubtitle, children: "Loading orders..." }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$i.emptyCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$i.emptyIcon, children: /* @__PURE__ */ jsx(ShoppingBag, { size: 28, color: "#666" }) }),
      /* @__PURE__ */ jsx("p", { className: styles$i.emptyTitle, children: "No orders yet" }),
      /* @__PURE__ */ jsx("p", { className: styles$i.emptySubtitle, children: "Your order history will appear here" }),
      /* @__PURE__ */ jsxs(Link, { to: "/cards", className: styles$i.shopBtn, children: [
        /* @__PURE__ */ jsx(ShoppingBag, { size: 14 }),
        " Start Shopping"
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: styles$i.ordersList, children: filtered.map((order) => /* @__PURE__ */ jsxs("div", { className: styles$i.orderCard, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: styles$i.orderRow,
          onClick: () => setExpandedId(expandedId === order.id ? null : order.id),
          children: [
            /* @__PURE__ */ jsxs("div", { className: styles$i.orderLeft, children: [
              /* @__PURE__ */ jsx("div", { className: styles$i.orderIcon, children: /* @__PURE__ */ jsx(CreditCard, { size: 14, color: "#818cf8" }) }),
              /* @__PURE__ */ jsxs("div", { className: styles$i.orderInfo, children: [
                /* @__PURE__ */ jsx("span", { className: styles$i.orderName, children: order.product ? `${order.product.countryFlag} ${order.product.provider} ${order.product.type}` : "Card Purchase" }),
                /* @__PURE__ */ jsx("span", { className: styles$i.orderId, children: order.id })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles$i.orderRight, children: [
              /* @__PURE__ */ jsxs("span", { className: styles$i.orderAmount, children: [
                "$",
                order.amountUsd
              ] }),
              /* @__PURE__ */ jsx("span", { className: `${styles$i.statusBadge} ${styles$i[`status_${order.status}`]}`, children: order.status.charAt(0).toUpperCase() + order.status.slice(1) }),
              /* @__PURE__ */ jsx("span", { className: styles$i.orderDate, children: new Date(order.createdAt).toLocaleDateString() }),
              order.cardDetails && (expandedId === order.id ? /* @__PURE__ */ jsx(ChevronUp, { size: 14 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 14 }))
            ] })
          ]
        }
      ),
      expandedId === order.id && order.cardDetails && /* @__PURE__ */ jsx("div", { className: styles$i.cardReveal, children: /* @__PURE__ */ jsxs("div", { className: `${styles$i.cardDetails} card-data`, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$i.cardDetailItem, children: [
          /* @__PURE__ */ jsx("span", { children: "Card Number" }),
          /* @__PURE__ */ jsx("strong", { children: order.cardDetails.cardNumber })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$i.cardDetailItem, children: [
          /* @__PURE__ */ jsx("span", { children: "CVV" }),
          /* @__PURE__ */ jsx("strong", { children: order.cardDetails.cvv })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$i.cardDetailItem, children: [
          /* @__PURE__ */ jsx("span", { children: "Expiry" }),
          /* @__PURE__ */ jsx("strong", { children: order.cardDetails.expiry })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$i.cardDetailItem, children: [
          /* @__PURE__ */ jsx("span", { children: "Name" }),
          /* @__PURE__ */ jsx("strong", { children: order.cardDetails.fullName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$i.cardDetailItem, children: [
          /* @__PURE__ */ jsx("span", { children: "Bank" }),
          /* @__PURE__ */ jsx("strong", { children: order.cardDetails.bank })
        ] })
      ] }) })
    ] }, order.id)) })
  ] }) });
}
const page$4 = "_page_11mpi_1";
const styles$h = {
  page: page$4
};
const myOrders = UNSAFE_withComponentProps(function MyOrders() {
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$h.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsx(MyOrdersPage, {})]
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: myOrders
}, Symbol.toStringTag, { value: "Module" }));
const container$1 = "_container_plzlx_1";
const header$2 = "_header_plzlx_7";
const headerLeft$1 = "_headerLeft_plzlx_23";
const headerIcon$1 = "_headerIcon_plzlx_29";
const headerIconImage = "_headerIconImage_plzlx_38";
const title$4 = "_title_plzlx_44";
const subtitle$1 = "_subtitle_plzlx_52";
const backBtn$1 = "_backBtn_plzlx_58";
const statsRow = "_statsRow_plzlx_78";
const statCard$2 = "_statCard_plzlx_85";
const statLabel$2 = "_statLabel_plzlx_106";
const statValue$2 = "_statValue_plzlx_112";
const statValueGreen = "_statValueGreen_plzlx_123";
const statValueOrange = "_statValueOrange_plzlx_124";
const statIcon$1 = "_statIcon_plzlx_126";
const statIconBlue = "_statIconBlue_plzlx_135";
const statIconGreen = "_statIconGreen_plzlx_136";
const statIconOrange = "_statIconOrange_plzlx_137";
const tableCard = "_tableCard_plzlx_139";
const tableWrap$5 = "_tableWrap_plzlx_151";
const table$4 = "_table_plzlx_139";
const emptyState$1 = "_emptyState_plzlx_187";
const emptyTitle = "_emptyTitle_plzlx_209";
const emptySubtitle = "_emptySubtitle_plzlx_216";
const legend = "_legend_plzlx_222";
const legendItem = "_legendItem_plzlx_230";
const dot = "_dot_plzlx_238";
const dotGreen = "_dotGreen_plzlx_245";
const dotYellow = "_dotYellow_plzlx_246";
const dotRed = "_dotRed_plzlx_247";
const typeBadge = "_typeBadge_plzlx_250";
const type_deposit = "_type_deposit_plzlx_262";
const type_admin_credit = "_type_admin_credit_plzlx_262";
const type_purchase = "_type_purchase_plzlx_267";
const type_admin_debit = "_type_admin_debit_plzlx_267";
const amountCredit = "_amountCredit_plzlx_272";
const amountDebit = "_amountDebit_plzlx_273";
const balanceAfter = "_balanceAfter_plzlx_274";
const txId = "_txId_plzlx_275";
const desc = "_desc_plzlx_276";
const date = "_date_plzlx_277";
const styles$g = {
  container: container$1,
  header: header$2,
  headerLeft: headerLeft$1,
  headerIcon: headerIcon$1,
  headerIconImage,
  title: title$4,
  subtitle: subtitle$1,
  backBtn: backBtn$1,
  statsRow,
  statCard: statCard$2,
  statLabel: statLabel$2,
  statValue: statValue$2,
  statValueGreen,
  statValueOrange,
  statIcon: statIcon$1,
  statIconBlue,
  statIconGreen,
  statIconOrange,
  tableCard,
  tableWrap: tableWrap$5,
  table: table$4,
  emptyState: emptyState$1,
  emptyTitle,
  emptySubtitle,
  legend,
  legendItem,
  dot,
  dotGreen,
  dotYellow,
  dotRed,
  typeBadge,
  type_deposit,
  type_admin_credit,
  type_purchase,
  type_admin_debit,
  amountCredit,
  amountDebit,
  balanceAfter,
  txId,
  desc,
  date
};
const TYPE_LABELS = {
  deposit: "Deposit",
  purchase: "Purchase",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit"
};
function SkeletonRow$3() {
  const cell = (w) => /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        display: "inline-block",
        width: w,
        height: "0.85em",
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        animation: "txPulse 1.4s ease-in-out infinite"
      }
    }
  );
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx("td", { children: cell("8rem") }),
    /* @__PURE__ */ jsx("td", { children: cell("4rem") }),
    /* @__PURE__ */ jsx("td", { children: cell("3.5rem") }),
    /* @__PURE__ */ jsx("td", { children: cell("3.5rem") }),
    /* @__PURE__ */ jsx("td", { children: cell("10rem") }),
    /* @__PURE__ */ jsx("td", { children: cell("5rem") })
  ] });
}
function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/user", { credentials: "include" }).then((r) => r.ok ? r.json() : { transactions: [] }).then((data) => setTransactions(data.transactions ?? [])).catch(() => setTransactions([])).finally(() => setLoading(false));
  }, []);
  const completed = transactions.filter((t) => ["deposit", "admin_credit"].includes(t.type)).length;
  const purchases = transactions.filter((t) => t.type === "purchase").length;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes txPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: styles$g.container, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$g.header, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$g.headerLeft, children: [
          /* @__PURE__ */ jsx("div", { className: styles$g.headerIcon, children: /* @__PURE__ */ jsx("img", { src: "/assets/icons/transaction.png", className: styles$g.headerIconImage, alt: "Transaction history" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: styles$g.title, children: "Transaction History" }),
            /* @__PURE__ */ jsx("p", { className: styles$g.subtitle, children: "Complete wallet transaction ledger" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: styles$g.backBtn, children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 13 }),
          " Back"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$g.statsRow, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$g.statCard, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: styles$g.statLabel, children: "Total Transactions" }),
            /* @__PURE__ */ jsx("p", { className: styles$g.statValue, children: loading ? "—" : transactions.length })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `${styles$g.statIcon} ${styles$g.statIconBlue}`, children: /* @__PURE__ */ jsx(Wallet, { size: 18, color: "#3b82f6" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$g.statCard, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: styles$g.statLabel, children: "Credits" }),
            /* @__PURE__ */ jsx("p", { className: `${styles$g.statValue} ${styles$g.statValueGreen}`, children: loading ? "—" : completed })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `${styles$g.statIcon} ${styles$g.statIconGreen}`, children: /* @__PURE__ */ jsx(CheckCircle, { size: 18, color: "#22c55e" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$g.statCard, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: styles$g.statLabel, children: "Purchases" }),
            /* @__PURE__ */ jsx("p", { className: `${styles$g.statValue} ${styles$g.statValueOrange}`, children: loading ? "—" : purchases })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `${styles$g.statIcon} ${styles$g.statIconOrange}`, children: /* @__PURE__ */ jsx(AlertCircle, { size: 18, color: "#f97316" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$g.tableCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$g.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$g.table, children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "ID" }),
            /* @__PURE__ */ jsx("th", { children: "Type" }),
            /* @__PURE__ */ jsx("th", { children: "Amount" }),
            /* @__PURE__ */ jsx("th", { children: "Balance After" }),
            /* @__PURE__ */ jsx("th", { children: "Description" }),
            /* @__PURE__ */ jsx("th", { children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: loading ? (
            // Show 5 skeleton rows while data loads
            Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonRow$3, {}, i))
          ) : transactions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, children: /* @__PURE__ */ jsxs("div", { className: styles$g.emptyState, children: [
            /* @__PURE__ */ jsx(Inbox, { size: 32, color: "#555" }),
            /* @__PURE__ */ jsx("p", { className: styles$g.emptyTitle, children: "No transactions yet" }),
            /* @__PURE__ */ jsx("p", { className: styles$g.emptySubtitle, children: "Your transaction history will appear here" })
          ] }) }) }) : transactions.map((tx) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: styles$g.txId, children: [
              tx.id.slice(0, 16),
              "..."
            ] }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("span", { className: `${styles$g.typeBadge} ${styles$g[`type_${tx.type}`]}`, children: [
              tx.type === "purchase" ? /* @__PURE__ */ jsx(ArrowUpRight, { size: 10 }) : /* @__PURE__ */ jsx(ArrowDownLeft, { size: 10 }),
              TYPE_LABELS[tx.type] ?? tx.type
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: tx.type === "purchase" ? styles$g.amountDebit : styles$g.amountCredit, children: [
              tx.type === "purchase" ? "-" : "+",
              "$",
              tx.amount
            ] }),
            /* @__PURE__ */ jsxs("td", { className: styles$g.balanceAfter, children: [
              "$",
              tx.balanceAfter
            ] }),
            /* @__PURE__ */ jsx("td", { className: styles$g.desc, children: tx.description }),
            /* @__PURE__ */ jsx("td", { className: styles$g.date, children: new Date(tx.createdAt).toLocaleDateString() })
          ] }, tx.id)) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$g.legend, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$g.legendItem, children: [
            /* @__PURE__ */ jsx("span", { className: `${styles$g.dot} ${styles$g.dotGreen}` }),
            " Credit"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: styles$g.legendItem, children: [
            /* @__PURE__ */ jsx("span", { className: `${styles$g.dot} ${styles$g.dotRed}` }),
            " Purchase"
          ] })
        ] })
      ] })
    ] })
  ] });
}
const page$3 = "_page_11mpi_1";
const styles$f = {
  page: page$3
};
const transactionHistory = UNSAFE_withComponentProps(function TransactionHistory() {
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$f.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsx(TransactionHistoryPage, {})]
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: transactionHistory
}, Symbol.toStringTag, { value: "Module" }));
const INITIAL = {
  id: null,
  email: null,
  name: null,
  role: null,
  balanceUsd: "0.00",
  totalDeposited: "0.00",
  isLoading: true,
  error: null
};
const POLL_INTERVAL_MS = 1e4;
function useWallet() {
  const [state2, setState] = useState(INITIAL);
  const timerRef = useRef(null);
  const fetch_data = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet", {
        credentials: "include",
        // Bust any remaining browser cache
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
      });
      if (res.status === 401) {
        setState({ ...INITIAL, isLoading: false });
        return;
      }
      if (!res.ok) {
        setState((s) => ({ ...s, isLoading: false, error: "Failed to fetch wallet" }));
        return;
      }
      const data = await res.json();
      console.log("USER [cart/wallet]:", data.id);
      console.log("WALLET [cart/wallet]:", data.walletDisplay);
      setState({
        id: data.id ?? null,
        email: data.email ?? null,
        name: data.name ?? null,
        role: data.role ?? null,
        balanceUsd: data.walletDisplay ?? "0.00",
        totalDeposited: data.totalDepositedDisplay ?? "0.00",
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }));
    }
  }, []);
  useEffect(() => {
    setState((s) => ({ ...s, isLoading: true }));
    void fetch_data();
    timerRef.current = setInterval(() => {
      void fetch_data();
    }, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch_data]);
  return { ...state2, refresh: fetch_data };
}
const container = "_container_1bw5f_1";
const header$1 = "_header_1bw5f_7";
const headerLeft = "_headerLeft_1bw5f_18";
const headerIcon = "_headerIcon_1bw5f_24";
const title$3 = "_title_1bw5f_31";
const subtitle = "_subtitle_1bw5f_39";
const backBtn = "_backBtn_1bw5f_45";
const layout = "_layout_1bw5f_65";
const cartPanel = "_cartPanel_1bw5f_77";
const cartPanelHeader = "_cartPanelHeader_1bw5f_84";
const cartPanelTitle = "_cartPanelTitle_1bw5f_92";
const clearBtn$1 = "_clearBtn_1bw5f_98";
const itemsList = "_itemsList_1bw5f_111";
const cartItem = "_cartItem_1bw5f_118";
const itemLeft = "_itemLeft_1bw5f_128";
const itemIcon = "_itemIcon_1bw5f_134";
const itemInfo = "_itemInfo_1bw5f_141";
const itemName = "_itemName_1bw5f_147";
const itemMeta = "_itemMeta_1bw5f_153";
const metaBadge = "_metaBadge_1bw5f_159";
const itemRight = "_itemRight_1bw5f_168";
const itemPrice = "_itemPrice_1bw5f_175";
const removeBtn = "_removeBtn_1bw5f_185";
const emptyState = "_emptyState_1bw5f_201";
const shopLink = "_shopLink_1bw5f_212";
const summaryPanel = "_summaryPanel_1bw5f_219";
const summaryTitle = "_summaryTitle_1bw5f_229";
const summaryRow = "_summaryRow_1bw5f_237";
const summaryLabel = "_summaryLabel_1bw5f_244";
const summaryBalanceValue = "_summaryBalanceValue_1bw5f_248";
const summaryTotal = "_summaryTotal_1bw5f_253";
const summaryTotalValue = "_summaryTotalValue_1bw5f_259";
const insufficientBanner = "_insufficientBanner_1bw5f_269";
const addFundsLink = "_addFundsLink_1bw5f_281";
const termsRow = "_termsRow_1bw5f_287";
const termsCheck = "_termsCheck_1bw5f_294";
const termsText = "_termsText_1bw5f_301";
const termsLink = "_termsLink_1bw5f_306";
const purchaseBtn = "_purchaseBtn_1bw5f_311";
const purchaseNote = "_purchaseNote_1bw5f_335";
const purchasedWrap = "_purchasedWrap_1bw5f_343";
const purchasedHeader = "_purchasedHeader_1bw5f_354";
const cardReveal = "_cardReveal_1bw5f_363";
const cardRevealRow = "_cardRevealRow_1bw5f_373";
const cardRevealLabel = "_cardRevealLabel_1bw5f_379";
const cardDetails = "_cardDetails_1bw5f_385";
const cardDetailRow = "_cardDetailRow_1bw5f_395";
const orderIdRow = "_orderIdRow_1bw5f_415";
const styles$e = {
  container,
  header: header$1,
  headerLeft,
  headerIcon,
  title: title$3,
  subtitle,
  backBtn,
  layout,
  cartPanel,
  cartPanelHeader,
  cartPanelTitle,
  clearBtn: clearBtn$1,
  itemsList,
  cartItem,
  itemLeft,
  itemIcon,
  itemInfo,
  itemName,
  itemMeta,
  metaBadge,
  itemRight,
  itemPrice,
  removeBtn,
  emptyState,
  shopLink,
  summaryPanel,
  summaryTitle,
  summaryRow,
  summaryLabel,
  summaryBalanceValue,
  summaryTotal,
  summaryTotalValue,
  insufficientBanner,
  addFundsLink,
  termsRow,
  termsCheck,
  termsText,
  termsLink,
  purchaseBtn,
  purchaseNote,
  purchasedWrap,
  purchasedHeader,
  cardReveal,
  cardRevealRow,
  cardRevealLabel,
  cardDetails,
  cardDetailRow,
  orderIdRow
};
function MyCartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { balanceUsd, isLoading: walletLoading, refresh: refreshWallet } = useWallet();
  const [agreed, setAgreed] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchased, setPurchased] = useState([]);
  const walletBalance = parseFloat(balanceUsd) || 0;
  const total = cart.reduce((sum, item2) => sum + item2.price, 0);
  const insufficientBalance = walletBalance < total;
  const handleCompletePurchase = async () => {
    if (!agreed || cart.length === 0) return;
    setPurchaseError("");
    setPurchasing(true);
    const results = [];
    const failedItems = [];
    for (const item2 of cart) {
      try {
        const res = await fetch("/api/buy", {
          method: "POST",
          // credentials: "include" sends the HttpOnly session cookie
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item2.id })
        });
        const data = await res.json();
        if (res.status === 401) {
          setPurchaseError("Session expired. Please log in again.");
          setPurchasing(false);
          return;
        }
        if (res.ok) {
          results.push({ orderId: data.orderId, card: data.card, newBalance: data.newBalance });
          removeFromCart(item2.id);
        } else {
          failedItems.push(`${item2.name}: ${data.error ?? "Purchase failed"}`);
        }
      } catch {
        failedItems.push(`${item2.name}: Network error`);
      }
    }
    setPurchased(results);
    if (failedItems.length > 0) {
      setPurchaseError(failedItems.join(" | "));
    }
    setPurchasing(false);
    refreshWallet();
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$e.container, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$e.header, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$e.headerLeft, children: [
        /* @__PURE__ */ jsx("img", { src: "/assets/icons/cart-blue.png", className: styles$e.headerIcon, alt: "My cart" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: styles$e.title, children: "My Cart" }),
          /* @__PURE__ */ jsxs("p", { className: styles$e.subtitle, children: [
            cart.length,
            " item",
            cart.length !== 1 ? "s" : "",
            " in cart"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/cards", className: styles$e.backBtn, children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 13 }),
        " Continue Shopping"
      ] })
    ] }),
    purchased.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$e.purchasedWrap, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$e.purchasedHeader, children: [
        /* @__PURE__ */ jsx(CheckCircle, { size: 16, color: "#22c55e" }),
        /* @__PURE__ */ jsx("span", { children: "Purchase Successful! Your card details:" })
      ] }),
      purchased.map((p) => /* @__PURE__ */ jsxs("div", { className: styles$e.cardReveal, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$e.cardRevealRow, children: [
          /* @__PURE__ */ jsx(CreditCard, { size: 14, color: "#818cf8" }),
          /* @__PURE__ */ jsxs("span", { className: styles$e.cardRevealLabel, children: [
            p.card.provider,
            " ",
            p.card.countryFlag
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles$e.cardDetails} card-data`, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$e.cardDetailRow, children: [
            /* @__PURE__ */ jsx("span", { children: "Card Number:" }),
            /* @__PURE__ */ jsx("strong", { children: p.card.cardNumber })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$e.cardDetailRow, children: [
            /* @__PURE__ */ jsx("span", { children: "CVV:" }),
            /* @__PURE__ */ jsx("strong", { children: p.card.cvv })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$e.cardDetailRow, children: [
            /* @__PURE__ */ jsx("span", { children: "Expiry:" }),
            /* @__PURE__ */ jsx("strong", { children: p.card.expiry })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$e.cardDetailRow, children: [
            /* @__PURE__ */ jsx("span", { children: "Name:" }),
            /* @__PURE__ */ jsx("strong", { children: p.card.fullName })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$e.cardDetailRow, children: [
            /* @__PURE__ */ jsx("span", { children: "Bank:" }),
            /* @__PURE__ */ jsx("strong", { children: p.card.bank })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$e.orderIdRow, children: [
          "Order ID: ",
          p.orderId
        ] })
      ] }, p.orderId))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$e.layout, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$e.cartPanel, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$e.cartPanelHeader, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$e.cartPanelTitle, children: [
            "Cart Items (",
            cart.length,
            ")"
          ] }),
          cart.length > 0 && /* @__PURE__ */ jsx("button", { className: styles$e.clearBtn, onClick: clearCart, disabled: purchasing, children: "Clear Cart" })
        ] }),
        cart.length === 0 && purchased.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$e.emptyState, children: [
          /* @__PURE__ */ jsx(ShoppingCart, { size: 32, color: "#555" }),
          /* @__PURE__ */ jsx("p", { children: "Your cart is empty" }),
          /* @__PURE__ */ jsx(Link, { to: "/cards", className: styles$e.shopLink, children: "Browse Cards" })
        ] }) : cart.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$e.emptyState, children: [
          /* @__PURE__ */ jsx(CheckCircle, { size: 32, color: "#22c55e" }),
          /* @__PURE__ */ jsx("p", { children: "All items purchased! Check your orders." }),
          /* @__PURE__ */ jsx(Link, { to: "/orders", className: styles$e.shopLink, children: "View Orders" })
        ] }) : /* @__PURE__ */ jsx("div", { className: styles$e.itemsList, children: cart.map((item2) => /* @__PURE__ */ jsxs("div", { className: styles$e.cartItem, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$e.itemLeft, children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/assets/icons/card.png",
                className: styles$e.itemIcon,
                alt: "Card"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: styles$e.itemInfo, children: [
              /* @__PURE__ */ jsx("span", { className: styles$e.itemName, children: item2.name }),
              /* @__PURE__ */ jsxs("div", { className: styles$e.itemMeta, children: [
                /* @__PURE__ */ jsx("span", { className: styles$e.metaBadge, children: item2.brand }),
                /* @__PURE__ */ jsxs("span", { className: styles$e.metaBadge, children: [
                  item2.countryFlag,
                  " ",
                  item2.country
                ] }),
                /* @__PURE__ */ jsx("span", { className: styles$e.metaBadge, children: item2.type })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$e.itemRight, children: [
            /* @__PURE__ */ jsxs("span", { className: styles$e.itemPrice, children: [
              "$",
              item2.price.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: styles$e.removeBtn,
                onClick: () => removeFromCart(item2.id),
                disabled: purchasing,
                children: [
                  /* @__PURE__ */ jsx(Trash2, { size: 11 }),
                  " Remove"
                ]
              }
            )
          ] })
        ] }, item2.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$e.summaryPanel, children: [
        /* @__PURE__ */ jsx("h2", { className: styles$e.summaryTitle, children: "Order Summary" }),
        /* @__PURE__ */ jsxs("div", { className: styles$e.summaryRow, children: [
          /* @__PURE__ */ jsx("span", { className: styles$e.summaryLabel, children: "Wallet Balance" }),
          /* @__PURE__ */ jsx("span", { className: styles$e.summaryBalanceValue, children: walletLoading ? "Loading..." : `$${walletBalance.toFixed(2)}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles$e.summaryRow} ${styles$e.summaryTotal}`, children: [
          /* @__PURE__ */ jsx("span", { className: styles$e.summaryLabel, children: "Total" }),
          /* @__PURE__ */ jsxs("span", { className: styles$e.summaryTotalValue, children: [
            "$",
            total.toFixed(2)
          ] })
        ] }),
        insufficientBalance && cart.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$e.insufficientBanner, children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
          "Insufficient balance.",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/deposit", className: styles$e.addFundsLink, children: "Add funds" })
        ] }),
        purchaseError && /* @__PURE__ */ jsxs("div", { className: styles$e.insufficientBanner, children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 13 }),
          purchaseError
        ] }),
        /* @__PURE__ */ jsxs("label", { className: styles$e.termsRow, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: agreed,
              onChange: (e) => setAgreed(e.target.checked),
              className: styles$e.termsCheck,
              disabled: purchasing
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: styles$e.termsText, children: [
            "I agree to the",
            " ",
            /* @__PURE__ */ jsx(Link, { to: "/#", className: styles$e.termsLink, children: "Terms & Conditions." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$e.purchaseBtn,
            disabled: !agreed || insufficientBalance || cart.length === 0 || purchasing,
            onClick: handleCompletePurchase,
            children: [
              /* @__PURE__ */ jsx(ShieldCheck, { size: 14 }),
              " ",
              purchasing ? "Processing..." : "Complete Purchase"
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: styles$e.purchaseNote, children: "Order will appear in My Orders" })
      ] })
    ] })
  ] });
}
const page$2 = "_page_1qyn2_1";
const styles$d = {
  page: page$2
};
const myCart = UNSAFE_withComponentProps(function MyCart() {
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles$d.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsx(MyCartPage, {})]
  });
});
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: myCart
}, Symbol.toStringTag, { value: "Module" }));
const ADMIN_ENTRY_PATH = "/x9k7-secure-admin-core-portal-88421";
const ADMIN_LOGIN_PATH = `${ADMIN_ENTRY_PATH}/login`;
const page$1 = "_page_55nzm_1";
const videoBackground = "_videoBackground_55nzm_14";
const overlay = "_overlay_55nzm_25";
const videoFallback = "_videoFallback_55nzm_34";
const content = "_content_55nzm_40";
const contentExit = "_contentExit_55nzm_49";
const eyebrow = "_eyebrow_55nzm_54";
const heading = "_heading_55nzm_63";
const subtext = "_subtext_55nzm_73";
const getStartedButton = "_getStartedButton_55nzm_83";
const getStartedButtonVisible = "_getStartedButtonVisible_55nzm_106";
const getStartedButtonExit = "_getStartedButtonExit_55nzm_125";
const styles$c = {
  page: page$1,
  videoBackground,
  overlay,
  videoFallback,
  content,
  contentExit,
  eyebrow,
  heading,
  subtext,
  getStartedButton,
  getStartedButtonVisible,
  getStartedButtonExit
};
const CTA_REVEAL_DELAY_MS = 1900;
const REDIRECT_DELAY_MS = 420;
const CTA_REVEAL_TIME_S = 1.8;
function meta() {
  return [{
    title: "Heaven Admin Control"
  }, {
    name: "description",
    content: "Secure access. Powerful control."
  }];
}
const adminLanding = UNSAFE_withComponentProps(function AdminLandingPage() {
  const navigate = useNavigate();
  const revealTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isVideoFailed, setIsVideoFailed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const revealButton = useCallback(() => {
    setIsButtonVisible((visible2) => visible2 || true);
  }, []);
  const scheduleReveal = useCallback(() => {
    if (isButtonVisible) return;
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }
    revealTimerRef.current = window.setTimeout(() => {
      revealButton();
      revealTimerRef.current = null;
    }, CTA_REVEAL_DELAY_MS);
  }, [isButtonVisible, revealButton]);
  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
      if (redirectTimerRef.current !== null) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);
  function handleVideoError() {
    setIsVideoFailed(true);
    revealButton();
  }
  function handleVideoTimeUpdate(event) {
    if (isButtonVisible) return;
    if (event.currentTarget.currentTime >= CTA_REVEAL_TIME_S) {
      revealButton();
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    }
  }
  function handleGetStartedClick() {
    if (isRedirecting) return;
    setIsRedirecting(true);
    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current);
    }
    redirectTimerRef.current = window.setTimeout(() => {
      navigate(ADMIN_LOGIN_PATH);
    }, REDIRECT_DELAY_MS);
  }
  return /* @__PURE__ */ jsxs("main", {
    className: `${styles$c.page} ${isVideoFailed ? styles$c.videoFallback : ""}`,
    children: [!isVideoFailed && /* @__PURE__ */ jsx("video", {
      src: "/media/admin-get-start.mp4",
      className: styles$c.videoBackground,
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      preload: "metadata",
      onLoadedData: scheduleReveal,
      onPlay: scheduleReveal,
      onTimeUpdate: handleVideoTimeUpdate,
      onError: handleVideoError
    }), /* @__PURE__ */ jsx("div", {
      className: styles$c.overlay
    }), /* @__PURE__ */ jsxs("section", {
      className: `${styles$c.content} ${isRedirecting ? styles$c.contentExit : ""}`,
      children: [/* @__PURE__ */ jsx("p", {
        className: styles$c.eyebrow,
        children: "ADMIN PANEL"
      }), /* @__PURE__ */ jsx("h1", {
        className: styles$c.heading,
        children: "Heaven Admin Control"
      }), /* @__PURE__ */ jsx("p", {
        className: styles$c.subtext,
        children: "Secure access. Powerful control."
      }), /* @__PURE__ */ jsx("button", {
        type: "button",
        className: [styles$c.getStartedButton, isButtonVisible ? styles$c.getStartedButtonVisible : "", isRedirecting ? styles$c.getStartedButtonExit : ""].join(" "),
        onClick: handleGetStartedClick,
        disabled: isRedirecting,
        children: "Get Started"
      })]
    })]
  });
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLanding,
  meta
}, Symbol.toStringTag, { value: "Module" }));
function AdminLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Authentication failed.");
        return;
      }
      navigate("/x7k9-secure-panel-god", { replace: true });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.08) 0%, #0a0a0a 70%)",
    padding: "2rem"
  }, children: /* @__PURE__ */ jsxs("div", { style: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(230,57,70,0.2)",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 0 40px rgba(230,57,70,0.04)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        borderRadius: "12px",
        background: "rgba(230,57,70,0.1)",
        border: "1px solid rgba(230,57,70,0.25)",
        marginBottom: "1rem"
      }, children: /* @__PURE__ */ jsx(ShieldCheck, { size: 28, color: "#e63946" }) }),
      /* @__PURE__ */ jsx("h1", { style: { fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0 }, children: "Restricted Access" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }, children: "Admin credentials required" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
      error && /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0.65rem 0.85rem",
        borderRadius: "8px",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        fontSize: "0.8rem",
        marginBottom: "1rem"
      }, children: [
        /* @__PURE__ */ jsx(AlertCircle, { size: 14 }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }, children: "Admin Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            autoComplete: "username",
            placeholder: "admin@ccshop.io",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            style: {
              width: "100%",
              padding: "0.65rem 0.85rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }, children: "Password" }),
        /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: showPw ? "text" : "password",
              autoComplete: "current-password",
              placeholder: "Enter admin password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              style: {
                width: "100%",
                padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.88rem",
                outline: "none",
                boxSizing: "border-box"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPw((v) => !v),
              style: {
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "2px"
              },
              "aria-label": showPw ? "Hide password" : "Show password",
              children: showPw ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          disabled: loading,
          style: {
            width: "100%",
            padding: "0.75rem",
            background: loading ? "rgba(230,57,70,0.4)" : "rgba(230,57,70,0.85)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background 0.2s"
          },
          children: [
            /* @__PURE__ */ jsx(Lock, { size: 16 }),
            loading ? "Authenticating…" : "Access Admin Panel"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.7rem", color: "#334155", textAlign: "center", marginTop: "1.5rem" }, children: "This page is restricted. Unauthorized access attempts are logged." })
  ] }) });
}
async function loader$d({ request }) {
  const session = parseAdminSession(request);
  if (session) throw redirect("/x7k9-secure-panel-god");
  return null;
}
const adminLogin = UNSAFE_withComponentProps(function AdminLoginPage() {
  return /* @__PURE__ */ jsx(AdminLoginForm, {});
});
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLogin,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
async function loader$c(_) {
  throw new Response("Not Found", {
    status: 404,
    statusText: "Not Found"
  });
}
const adminLegacyRedirect = UNSAFE_withComponentProps(function AdminLegacyRedirectRoute() {
  return null;
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLegacyRedirect,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLegacyRedirect,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLegacyRedirect,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminLegacyRedirect,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const header = "_header_12k2s_1";
const left = "_left_12k2s_14";
const warningBadge = "_warningBadge_12k2s_20";
const title$2 = "_title_12k2s_36";
const sessionInfo = "_sessionInfo_12k2s_43";
const right = "_right_12k2s_48";
const adminPill = "_adminPill_12k2s_54";
const adminDot = "_adminDot_12k2s_67";
const logoutBtn$1 = "_logoutBtn_12k2s_75";
const styles$b = {
  header,
  left,
  warningBadge,
  title: title$2,
  sessionInfo,
  right,
  adminPill,
  adminDot,
  logoutBtn: logoutBtn$1
};
function AdminHeader() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState(null);
  const [sessionStart] = useState((/* @__PURE__ */ new Date()).toLocaleString());
  const [loggingOut, setLoggingOut] = useState(false);
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const runDiagnose = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch("/api/admin?action=diagnose", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDiag(data);
      }
    } catch {
    } finally {
      setDiagLoading(false);
    }
  };
  useEffect(() => {
    fetch("/api/admin-auth", { credentials: "include" }).then((r) => r.json()).then((d) => {
      if (d.authenticated && d.userId) {
        fetch("/api/admin?action=users", { credentials: "include" }).then((r) => r.json()).then((data) => {
          const me = data.users?.find((u) => u.id === d.userId);
          if (me) setAdminEmail(me.email);
        }).catch(() => {
        });
      }
    }).catch(() => {
    });
    void runDiagnose();
  }, []);
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin-auth?action=logout", { credentials: "include" });
    } catch {
    }
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: styles$b.header, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$b.left, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$b.warningBadge, children: [
          /* @__PURE__ */ jsx(ShieldAlert, { size: 12 }),
          " RESTRICTED ACCESS"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: styles$b.title, children: "Admin Control Panel" }),
        /* @__PURE__ */ jsxs("p", { className: styles$b.sessionInfo, children: [
          "Session started: ",
          sessionStart,
          " • Keep this URL confidential"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$b.right, children: [
        diag && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "9999px",
              fontSize: "0.68rem",
              fontWeight: 700,
              background: diag.writeOk ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: diag.writeOk ? "#4ade80" : "#f87171",
              border: `1px solid ${diag.writeOk ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`
            },
            children: diag.writeOk ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 11 }),
              " DB OK"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(AlertTriangle, { size: 11 }),
              " DB WRITE ERROR"
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: styles$b.adminPill, children: [
          /* @__PURE__ */ jsx("span", { className: styles$b.adminDot }),
          adminEmail ?? "admin"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$b.logoutBtn,
            onClick: handleLogout,
            disabled: loggingOut,
            children: [
              /* @__PURE__ */ jsx(LogOut, { size: 14 }),
              " ",
              loggingOut ? "Logging out…" : "Logout"
            ]
          }
        )
      ] })
    ] }),
    diag && !diag.writeOk && /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "10px",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          margin: "0 0 1rem 0",
          lineHeight: 1.5
        },
        children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 18, color: "#f87171", style: { flexShrink: 0, marginTop: "2px" } }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx("div", { style: { color: "#f87171", fontWeight: 700, fontSize: "0.85rem", marginBottom: "4px" }, children: "⚠ Database Write Permission Error — Add/Deduct will fail" }),
            /* @__PURE__ */ jsxs("div", { style: { color: "#fca5a5", fontSize: "0.78rem" }, children: [
              diag.writeError ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("strong", { children: "Error:" }),
                " ",
                diag.writeError,
                /* @__PURE__ */ jsx("br", {})
              ] }) : null,
              diag.serviceKey === "missing" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("strong", { children: "Fix:" }),
                " Add ",
                /* @__PURE__ */ jsx("code", { style: { background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }, children: "SUPABASE_SERVICE_KEY" }),
                " to your",
                " ",
                /* @__PURE__ */ jsx("code", { style: { background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }, children: ".env" }),
                " file.",
                " ",
                "Get it from",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: diag.fixUrl,
                    target: "_blank",
                    rel: "noreferrer",
                    style: { color: "#93c5fd", textDecoration: "underline" },
                    children: "Supabase → Settings → API → service_role key"
                  }
                ),
                ".",
                " ",
                "Then restart the dev server."
              ] }) : /* @__PURE__ */ jsx(Fragment, { children: diag.summary })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => void runDiagnose(),
              disabled: diagLoading,
              style: {
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "6px",
                color: "#aaa",
                fontSize: "0.72rem",
                cursor: "pointer"
              },
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { size: 11, style: { animation: diagLoading ? "spin 1s linear infinite" : "none" } }),
                "Re-check"
              ]
            }
          )
        ]
      }
    ),
    diag?.writeOk && /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "10px",
          padding: "0.55rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          margin: "0 0 0.75rem 0",
          fontSize: "0.75rem",
          color: "#4ade80"
        },
        children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }),
          "Database write permissions OK — Add/Deduct is fully operational."
        ]
      }
    )
  ] });
}
const tabs = "_tabs_fvgen_1";
const tab = "_tab_fvgen_1";
const tabActive = "_tabActive_fvgen_41";
const styles$a = {
  tabs,
  tab,
  tabActive
};
const TABS = [
  { id: "funds", label: "Virtual Funds", icon: /* @__PURE__ */ jsx(Wallet, { size: 16 }) },
  { id: "users", label: "Users", icon: /* @__PURE__ */ jsx(Users, { size: 16 }) },
  { id: "generator", label: "BIN Generator", icon: /* @__PURE__ */ jsx(CreditCard, { size: 16 }) },
  { id: "assets", label: "Asset Management", icon: /* @__PURE__ */ jsx(Package, { size: 16 }) },
  { id: "analytics", label: "Analytics", icon: /* @__PURE__ */ jsx(BarChart2, { size: 16 }) },
  { id: "ledger", label: "Transaction Ledger", icon: /* @__PURE__ */ jsx(FileText, { size: 16 }) },
  { id: "security", label: "IP Security", icon: /* @__PURE__ */ jsx(Shield, { size: 16 }) },
  { id: "support", label: "Support Tickets", icon: /* @__PURE__ */ jsx(LifeBuoy, { size: 16 }) }
];
function AdminNavigationTabs({ active: active2, onChange }) {
  return /* @__PURE__ */ jsx("div", { className: styles$a.tabs, children: TABS.map((t) => /* @__PURE__ */ jsxs(
    "button",
    {
      className: classNames(styles$a.tab, { [styles$a.tabActive]: active2 === t.id }),
      onClick: () => onChange(t.id),
      children: [
        t.icon,
        " ",
        t.label
      ]
    },
    t.id
  )) });
}
const wrap$6 = "_wrap_hba95_1";
const title$1 = "_title_hba95_8";
const searchRow = "_searchRow_hba95_16";
const searchInput$2 = "_searchInput_hba95_22";
const searchBtn = "_searchBtn_hba95_38";
const userCard = "_userCard_hba95_55";
const userInfo = "_userInfo_hba95_68";
const userEmail = "_userEmail_hba95_74";
const userId = "_userId_hba95_80";
const userBalance = "_userBalance_hba95_86";
const actionRow = "_actionRow_hba95_96";
const actionGroup = "_actionGroup_hba95_102";
const actionLabel = "_actionLabel_hba95_108";
const amountRow = "_amountRow_hba95_114";
const amountInput = "_amountInput_hba95_119";
const noteInput = "_noteInput_hba95_134";
const addBtn = "_addBtn_hba95_152";
const deductBtn = "_deductBtn_hba95_166";
const styles$9 = {
  wrap: wrap$6,
  title: title$1,
  searchRow,
  searchInput: searchInput$2,
  searchBtn,
  userCard,
  userInfo,
  userEmail,
  userId,
  userBalance,
  actionRow,
  actionGroup,
  actionLabel,
  amountRow,
  amountInput,
  noteInput,
  addBtn,
  deductBtn
};
function VirtualFundsManagement() {
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState(null);
  const [deductAmount, setDeductAmount] = useState("");
  const [deductNote, setDeductNote] = useState("");
  const [deductLoading, setDeductLoading] = useState(false);
  const [deductMsg, setDeductMsg] = useState(null);
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const runDiagnose = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const res = await fetch("/api/admin?action=diagnose", { credentials: "include" });
      if (res.ok) setDiagResult(await res.json());
      else setDiagResult({ writeOk: false, summary: `HTTP ${res.status}`, writeError: "Could not reach diagnose endpoint", serviceKey: "unknown", fixUrl: "" });
    } catch (e) {
      setDiagResult({ writeOk: false, summary: String(e), writeError: String(e), serviceKey: "unknown", fixUrl: "" });
    } finally {
      setDiagLoading(false);
    }
  };
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setFoundUser(null);
    setAddMsg(null);
    setDeductMsg(null);
    try {
      const res = await fetch(`/api/admin?action=search&q=${encodeURIComponent(q)}`, {
        credentials: "include"
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      if (res.status === 401) {
        setSearchError("⚠ Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setSearchError(
          typeof data.error === "string" ? `Error ${res.status}: ${data.error}` : `Server error ${res.status} — check the console.`
        );
        return;
      }
      setFoundUser(data.user);
    } catch (err) {
      setSearchError(
        `Network error: ${err instanceof Error ? err.message : String(err)}. Is the dev server running?`
      );
    } finally {
      setSearching(false);
    }
  };
  const adjustBalance = async (type, amount2, note, setLoading, setMsg) => {
    const val = parseFloat(amount2);
    if (!foundUser) return;
    if (isNaN(val) || val <= 0) {
      setMsg({ type: "err", text: "Enter a valid positive amount." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const currentCents = foundUser.walletUsd;
      const deltaCents = Math.round(val * 100);
      const newBalanceCents = type === "add" ? currentCents + deltaCents : Math.max(0, currentCents - deltaCents);
      console.log(`[funds-mgmt] ${type} userId=${foundUser.id} currentCents=${currentCents} deltaCents=${deltaCents} newBalanceCents=${newBalanceCents} amountUsd=${newBalanceCents / 100}`);
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_balance",
          userId: foundUser.id,
          amountUsd: newBalanceCents / 100,
          note: note || (type === "add" ? "Admin credit" : "Admin debit")
        })
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      console.log(`[funds-mgmt] set_balance HTTP ${res.status}`, data);
      if (res.status === 401) {
        setMsg({ type: "err", text: "⚠ Admin session expired. Please log out and log in again." });
        return;
      }
      if (!res.ok) {
        const errText = typeof data.error === "string" ? data.error : `Server error ${res.status} — check server console for details.`;
        const hint2 = errText.includes("RLS") || errText.includes("row-level security") ? " Tip: Add SUPABASE_SERVICE_KEY to your .env file." : errText.includes("permission") || res.status === 403 ? " Tip: The anon key may be blocked by RLS. Add SUPABASE_SERVICE_KEY to .env." : "";
        setMsg({ type: "err", text: errText + hint2 });
        return;
      }
      const serverBalance = typeof data.newBalance === "string" ? data.newBalance : null;
      try {
        const refreshRes = await fetch(
          `/api/admin?action=search&q=${encodeURIComponent(foundUser.id)}`,
          { credentials: "include" }
        );
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.user) {
            setFoundUser(refreshData.user);
          }
        }
      } catch {
        if (serverBalance) {
          setFoundUser(
            (prev) => prev ? { ...prev, walletUsd: Math.round(parseFloat(serverBalance) * 100), walletDisplay: parseFloat(serverBalance).toFixed(2) } : prev
          );
        }
      }
      setMsg({
        type: "ok",
        text: `✓ ${type === "add" ? "Added" : "Deducted"} $${val.toFixed(2)}. DB balance: $${serverBalance ?? "check above"}`
      });
      if (type === "add") {
        setAddAmount("");
        setAddNote("");
      } else {
        setDeductAmount("");
        setDeductNote("");
      }
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      setMsg({ type: "err", text: `Network error: ${msg2}. Is the dev server still running?` });
      console.error("[funds-mgmt] fetch threw:", err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$9.wrap, children: [
    /* @__PURE__ */ jsx("h2", { className: styles$9.title, children: "Virtual Funds Management" }),
    /* @__PURE__ */ jsxs("div", { className: styles$9.searchRow, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$9.searchInput,
          type: "text",
          placeholder: "Search by email or User ID (e.g. USR-1001)…",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && handleSearch()
        }
      ),
      /* @__PURE__ */ jsxs("button", { className: styles$9.searchBtn, onClick: handleSearch, disabled: searching, children: [
        searching ? /* @__PURE__ */ jsx(Loader2, { size: 14, style: { animation: "spin 1s linear infinite" } }) : /* @__PURE__ */ jsx(Search, { size: 14 }),
        searching ? "Searching…" : "Search User"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => void runDiagnose(),
          disabled: diagLoading,
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 12px",
            borderRadius: "6px",
            fontSize: "0.72rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#aaa",
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsx(Wrench, { size: 11, style: { animation: diagLoading ? "spin 1s linear infinite" : "none" } }),
            diagLoading ? "Testing…" : "Test DB Write"
          ]
        }
      ),
      diagResult && /* @__PURE__ */ jsx("span", { style: {
        fontSize: "0.75rem",
        color: diagResult.writeOk ? "#4ade80" : "#f87171",
        display: "flex",
        alignItems: "center",
        gap: "4px"
      }, children: diagResult.writeOk ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }),
        " DB write OK — Add/Deduct should work"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(AlertCircle, { size: 12 }),
        diagResult.serviceKey === "missing" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "SUPABASE_SERVICE_KEY missing in .env — ",
          /* @__PURE__ */ jsx("a", { href: diagResult.fixUrl, target: "_blank", rel: "noreferrer", style: { color: "#93c5fd" }, children: "Get it here" }),
          ", then restart server"
        ] }) : diagResult.writeError ?? diagResult.summary
      ] }) })
    ] }),
    searchError && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }, children: [
      /* @__PURE__ */ jsx(AlertCircle, { size: 14 }),
      " ",
      searchError
    ] }),
    foundUser && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: styles$9.userCard, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$9.userInfo, children: [
          /* @__PURE__ */ jsx("span", { className: styles$9.userEmail, children: foundUser.email }),
          /* @__PURE__ */ jsxs("span", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxs("span", { className: styles$9.userId, children: [
              "ID: ",
              foundUser.id
            ] }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.65rem", padding: "2px 6px", borderRadius: "9999px", background: foundUser.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(34,197,94,0.1)", color: foundUser.role === "admin" ? "#a855f7" : "#4ade80", fontWeight: 700 }, children: foundUser.role.toUpperCase() })
          ] }),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.72rem", color: "#888" }, children: [
            "Name: ",
            foundUser.name
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.userBalance, children: [
          "$",
          foundUser.walletDisplay
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$9.actionRow, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$9.actionGroup, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$9.actionLabel, children: [
            /* @__PURE__ */ jsx(Plus, { size: 13, style: { display: "inline", marginRight: "4px" } }),
            "Add USD to Wallet"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$9.amountRow, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$9.amountInput,
                type: "number",
                min: "0.01",
                step: "0.01",
                placeholder: "Amount (USD)",
                value: addAmount,
                onChange: (e) => setAddAmount(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: styles$9.addBtn,
                disabled: addLoading,
                onClick: () => adjustBalance("add", addAmount, addNote, setAddLoading, setAddMsg),
                children: addLoading ? "…" : "+ Add"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: styles$9.noteInput,
              placeholder: "Reason / Note",
              value: addNote,
              onChange: (e) => setAddNote(e.target.value)
            }
          ),
          addMsg && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: addMsg.type === "ok" ? "#4ade80" : "#ef4444", marginTop: "4px" }, children: [
            addMsg.type === "ok" ? /* @__PURE__ */ jsx(CheckCircle2, { size: 13 }) : /* @__PURE__ */ jsx(AlertCircle, { size: 13 }),
            addMsg.text
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.actionGroup, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$9.actionLabel, children: [
            /* @__PURE__ */ jsx(Minus, { size: 13, style: { display: "inline", marginRight: "4px" } }),
            "Deduct USD from Wallet"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$9.amountRow, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$9.amountInput,
                type: "number",
                min: "0.01",
                step: "0.01",
                placeholder: "Amount (USD)",
                value: deductAmount,
                onChange: (e) => setDeductAmount(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: styles$9.deductBtn,
                disabled: deductLoading,
                onClick: () => adjustBalance("deduct", deductAmount, deductNote, setDeductLoading, setDeductMsg),
                children: deductLoading ? "…" : "- Deduct"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: styles$9.noteInput,
              placeholder: "Reason / Note",
              value: deductNote,
              onChange: (e) => setDeductNote(e.target.value)
            }
          ),
          deductMsg && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: deductMsg.type === "ok" ? "#4ade80" : "#ef4444", marginTop: "4px" }, children: [
            deductMsg.type === "ok" ? /* @__PURE__ */ jsx(CheckCircle2, { size: 13 }) : /* @__PURE__ */ jsx(AlertCircle, { size: 13 }),
            deductMsg.text
          ] })
        ] })
      ] })
    ] })
  ] });
}
const wrap$5 = "_wrap_t9vih_1";
const formCard = "_formCard_t9vih_7";
const title = "_title_t9vih_14";
const grid = "_grid_t9vih_22";
const fieldGroup$2 = "_fieldGroup_t9vih_29";
const label$2 = "_label_t9vih_35";
const input$2 = "_input_t9vih_43";
const submitBtn$1 = "_submitBtn_t9vih_59";
const inventoryTitle = "_inventoryTitle_t9vih_76";
const tableWrap$4 = "_tableWrap_t9vih_84";
const table$3 = "_table_t9vih_84";
const countryCode = "_countryCode_t9vih_120";
const sectionLabel = "_sectionLabel_t9vih_128";
const autoTag = "_autoTag_t9vih_144";
const binBadge = "_binBadge_t9vih_158";
const spinIcon$1 = "_spinIcon_t9vih_188";
const bulkBinInfo = "_bulkBinInfo_t9vih_202";
const autoGenBtn = "_autoGenBtn_t9vih_254";
const genControls = "_genControls_t9vih_279";
const genBtn$1 = "_genBtn_t9vih_292";
const qtyBtn$1 = "_qtyBtn_t9vih_318";
const qtyBtnActive$1 = "_qtyBtnActive_t9vih_336";
const genCellInput = "_genCellInput_t9vih_343";
const bulkActions = "_bulkActions_t9vih_392";
const bulkBtn = "_bulkBtn_t9vih_399";
const bulkBtnDanger = "_bulkBtnDanger_t9vih_429";
const bulkBtnWarning = "_bulkBtnWarning_t9vih_441";
const bulkBtnSuccess = "_bulkBtnSuccess_t9vih_453";
const bulkBtnInfo = "_bulkBtnInfo_t9vih_465";
const modalOverlay$1 = "_modalOverlay_t9vih_477";
const modalCard = "_modalCard_t9vih_494";
const modalTitle = "_modalTitle_t9vih_510";
const modalDesc = "_modalDesc_t9vih_518";
const modalActions = "_modalActions_t9vih_525";
const modalCancel = "_modalCancel_t9vih_531";
const modalConfirm = "_modalConfirm_t9vih_546";
const modalConfirmDanger = "_modalConfirmDanger_t9vih_562";
const modalConfirmWarning = "_modalConfirmWarning_t9vih_563";
const modalConfirmSuccess = "_modalConfirmSuccess_t9vih_564";
const modalConfirmInfo = "_modalConfirmInfo_t9vih_565";
const toast = "_toast_t9vih_568";
const toastOk = "_toastOk_t9vih_593";
const toastErr = "_toastErr_t9vih_594";
const styles$8 = {
  wrap: wrap$5,
  formCard,
  title,
  grid,
  fieldGroup: fieldGroup$2,
  label: label$2,
  input: input$2,
  submitBtn: submitBtn$1,
  inventoryTitle,
  tableWrap: tableWrap$4,
  table: table$3,
  countryCode,
  sectionLabel,
  autoTag,
  binBadge,
  spinIcon: spinIcon$1,
  bulkBinInfo,
  autoGenBtn,
  genControls,
  genBtn: genBtn$1,
  qtyBtn: qtyBtn$1,
  qtyBtnActive: qtyBtnActive$1,
  genCellInput,
  bulkActions,
  bulkBtn,
  bulkBtnDanger,
  bulkBtnWarning,
  bulkBtnSuccess,
  bulkBtnInfo,
  modalOverlay: modalOverlay$1,
  modalCard,
  modalTitle,
  modalDesc,
  modalActions,
  modalCancel,
  modalConfirm,
  modalConfirmDanger,
  modalConfirmWarning,
  modalConfirmSuccess,
  modalConfirmInfo,
  toast,
  toastOk,
  toastErr
};
const BANKS_BY_COUNTRY = {
  US: [
    "Chase Bank",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "US Bank",
    "Capital One",
    "PNC Bank",
    "TD Bank",
    "Truist",
    "Goldman Sachs",
    "Fifth Third Bank",
    "Regions Bank",
    "Citizens Bank",
    "HSBC USA",
    "Santander Bank",
    "BMO Harris Bank",
    "Comerica Bank",
    "First Republic Bank",
    "Silicon Valley Bank",
    "American Express Bank",
    "Discover Bank"
  ],
  GB: [
    "Barclays",
    "HSBC UK",
    "Lloyds Bank",
    "NatWest",
    "Santander UK",
    "Standard Chartered UK",
    "Nationwide Building Society",
    "Metro Bank",
    "Virgin Money",
    "TSB Bank",
    "Co-operative Bank",
    "Monzo",
    "Starling Bank"
  ],
  CA: [
    "Royal Bank of Canada (RBC)",
    "Toronto-Dominion Bank (TD)",
    "Scotiabank",
    "Bank of Montreal (BMO)",
    "Canadian Imperial Bank of Commerce (CIBC)",
    "National Bank of Canada",
    "HSBC Canada",
    "Simplii Financial",
    "Tangerine Bank",
    "EQ Bank",
    "Motusbank",
    "Laurentian Bank"
  ],
  AU: [
    "Commonwealth Bank",
    "Westpac",
    "ANZ Bank",
    "National Australia Bank (NAB)",
    "Macquarie Bank",
    "Bendigo Bank",
    "Suncorp Bank",
    "Bankwest",
    "ING Australia",
    "Citibank Australia",
    "HSBC Australia"
  ],
  DE: [
    "Deutsche Bank",
    "Commerzbank",
    "KfW Bank",
    "DZ Bank",
    "HypoVereinsbank (UniCredit)",
    "Landesbank Baden-Württemberg",
    "Norddeutsche Landesbank",
    "ING Germany",
    "Comdirect Bank",
    "Targobank",
    "Postbank",
    "Sparkasse"
  ],
  FR: [
    "BNP Paribas",
    "Société Générale",
    "Crédit Agricole",
    "Natixis",
    "Banque Populaire",
    "Caisse d'Épargne",
    "HSBC France",
    "Crédit Mutuel",
    "La Banque Postale",
    "BNP Paribas Personal Finance"
  ],
  IT: [
    "UniCredit",
    "Intesa Sanpaolo",
    "Banca Monte dei Paschi di Siena",
    "UBI Banca",
    "Banco BPM",
    "Credito Valtellinese",
    "Banca Popolare di Sondrio",
    "Banca Mediolanum",
    "FinecoBank",
    "CheBanca!"
  ],
  ES: [
    "Banco Santander",
    "BBVA",
    "CaixaBank",
    "Banco Sabadell",
    "Bankinter",
    "Kutxabank",
    "Abanca",
    "Unicaja Banco",
    "Ibercaja Banco",
    "Banco Popular Español"
  ],
  NL: [
    "ING Bank",
    "ABN AMRO",
    "Rabobank",
    "De Volksbank (NN)",
    "Triodos Bank",
    "Van Lanschot Kempen",
    "Knab",
    "Bunq"
  ],
  BE: [
    "BNP Paribas Fortis",
    "KBC Bank",
    "ING Belgium",
    "Belfius",
    "Argenta",
    "AXA Bank Belgium",
    "Crelan",
    "VDK Bank"
  ],
  CH: [
    "UBS",
    "Credit Suisse",
    "Zürcher Kantonalbank",
    "Raiffeisen Switzerland",
    "PostFinance",
    "Julius Baer",
    "Vontobel",
    "Pictet Group"
  ],
  AT: [
    "Erste Group Bank",
    "Raiffeisen Bank International",
    "UniCredit Bank Austria",
    "Österreichische Postsparkasse (P.S.K.)",
    "BAWAG P.S.K.",
    "Oberbank"
  ],
  SE: [
    "Swedbank",
    "SEB",
    "Nordea Sweden",
    "Danske Bank Sweden",
    "Handelsbanken",
    "Länsförsäkringar Bank",
    "SBAB",
    "Skandiabanken"
  ],
  NO: [
    "DNB Bank",
    "Nordea Norway",
    "SpareBank 1",
    "Danske Bank Norway",
    "Handelsbanken Norway",
    "Storebrand Bank",
    "SR-Bank"
  ],
  DK: [
    "Danske Bank",
    "Nordea Denmark",
    "Jyske Bank",
    "Sydbank",
    "Nykredit Bank",
    "Arbejdernes Landsbank",
    "Saxo Bank"
  ],
  FI: [
    "Nordea Finland",
    "OP Financial Group",
    "Danske Bank Finland",
    "Handelsbanken Finland",
    "Ålandsbanken",
    "S-Pankki"
  ],
  PL: [
    "PKO BP",
    "Bank Pekao",
    "ING Bank Śląski",
    "mBank",
    "Santander Bank Polska",
    "Alior Bank",
    "Millennium Bank",
    "BNP Paribas Poland",
    "Credit Agricole Poland"
  ],
  PT: [
    "Caixa Geral de Depósitos",
    "Millennium BCP",
    "Banco Santander Portugal",
    "Novo Banco",
    "Banco BPI",
    "Montepio"
  ],
  GR: [
    "National Bank of Greece",
    "Piraeus Bank",
    "Alpha Bank",
    "Eurobank Ergasias",
    "Attica Bank",
    "Bank of Greece"
  ],
  CZ: [
    "Česká spořitelna",
    "ČSOB",
    "Komerční banka",
    "UniCredit Bank Czech Republic",
    "Raiffeisenbank",
    "Moneta Money Bank",
    "Air Bank"
  ],
  RO: [
    "Banca Transilvania",
    "BRD – Groupe Société Générale",
    "BCR (Erste Group)",
    "ING Bank Romania",
    "Raiffeisen Bank Romania",
    "OTP Bank Romania"
  ],
  HU: [
    "OTP Bank",
    "K&H Bank",
    "Erste Bank Hungary",
    "CIB Bank",
    "Raiffeisen Bank Hungary",
    "UniCredit Bank Hungary",
    "MKB Bank"
  ],
  SK: [
    "Slovenská sporiteľňa",
    "Všeobecná úverová banka (VÚB)",
    "Tatra banka",
    "ČSOB Slovakia",
    "Prima banka",
    "OTP Banka Slovensko"
  ],
  HR: [
    "Zagrebačka banka",
    "Privredna banka Zagreb (PBZ)",
    "Erste&Steiermärkische Bank",
    "Raiffeisen Bank Croatia",
    "OTP Bank Croatia",
    "Addiko Bank Croatia"
  ],
  IN: [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Axis Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "IDBI Bank",
    "IndusInd Bank",
    "Kotak Mahindra Bank",
    "Yes Bank"
  ],
  CN: [
    "Industrial and Commercial Bank of China (ICBC)",
    "China Construction Bank",
    "Agricultural Bank of China",
    "Bank of China",
    "Bank of Communications",
    "China Merchants Bank",
    "China CITIC Bank",
    "Shanghai Pudong Development Bank",
    "China Minsheng Banking Corp",
    "China Everbright Bank"
  ],
  JP: [
    "Mitsubishi UFJ Financial Group (MUFG)",
    "Sumitomo Mitsui Banking Corporation",
    "Mizuho Financial Group",
    "Japan Post Bank",
    "Resona Holdings",
    "Seven Bank",
    "Sony Bank",
    "Rakuten Bank"
  ],
  KR: [
    "Shinhan Bank",
    "Kookmin Bank (KB)",
    "Hana Bank",
    "Woori Bank",
    "Industrial Bank of Korea",
    "Nonghyup Bank",
    "SC Bank Korea"
  ],
  SG: [
    "DBS Bank",
    "OCBC Bank",
    "United Overseas Bank (UOB)",
    "Standard Chartered Singapore",
    "Citibank Singapore",
    "HSBC Singapore",
    "Maybank Singapore"
  ],
  HK: [
    "HSBC Hong Kong",
    "Standard Chartered Hong Kong",
    "Bank of China (Hong Kong)",
    "Hang Seng Bank",
    "Bank of East Asia",
    "OCBC Wing Hang",
    "Dah Sing Bank"
  ],
  TW: [
    "Bank of Taiwan",
    "CTBC Bank",
    "Cathay United Bank",
    "Mega International Commercial Bank",
    "Taipei Fubon Bank",
    "Land Bank of Taiwan",
    "Chang Hwa Bank"
  ],
  TH: [
    "Bangkok Bank",
    "Kasikornbank (KBank)",
    "Siam Commercial Bank (SCB)",
    "Krungthai Bank",
    "Bank of Ayudhya (Krungsri)",
    "Thanachart Bank",
    "TMBThanachart Bank (ttb)",
    "CIMB Thai"
  ],
  ID: [
    "Bank Central Asia (BCA)",
    "Bank Mandiri",
    "Bank Rakyat Indonesia (BRI)",
    "Bank Negara Indonesia (BNI)",
    "CIMB Niaga",
    "Bank Danamon",
    "Panin Bank",
    "Bank Permata"
  ],
  MY: [
    "Malayan Banking Berhad (Maybank)",
    "CIMB Bank",
    "Public Bank Berhad",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam Malaysia",
    "Standard Chartered Malaysia"
  ],
  PH: [
    "Banco de Oro (BDO)",
    "Metrobank",
    "Bank of the Philippine Islands (BPI)",
    "Land Bank of the Philippines",
    "Security Bank",
    "China Banking Corporation",
    "EastWest Bank",
    "UnionBank"
  ],
  VN: [
    "Vietcombank",
    "Bank for Investment and Development of Vietnam (BIDV)",
    "VietinBank",
    "Military Commercial Joint Stock Bank (MBBank)",
    "Asia Commercial Bank (ACB)",
    "Techcombank",
    "Sacombank"
  ],
  PK: [
    "Habib Bank Limited (HBL)",
    "National Bank of Pakistan (NBP)",
    "United Bank Limited (UBL)",
    "MCB Bank",
    "Allied Bank Limited (ABL)",
    "Bank Alfalah",
    "Meezan Bank"
  ],
  BD: [
    "Sonali Bank",
    "Janata Bank",
    "Agrani Bank",
    "Rupali Bank",
    "BRAC Bank",
    "Dutch-Bangla Bank",
    "Eastern Bank Limited",
    "United Commercial Bank"
  ],
  LK: [
    "Bank of Ceylon",
    "People's Bank",
    "Commercial Bank of Ceylon",
    "Hatton National Bank",
    "Sampath Bank",
    "Nations Trust Bank",
    "Seylan Bank"
  ],
  AE: [
    "Emirates NBD",
    "First Abu Dhabi Bank (FAB)",
    "Abu Dhabi Commercial Bank (ADCB)",
    "Dubai Islamic Bank",
    "Mashreq Bank",
    "Abu Dhabi Islamic Bank (ADIB)",
    "Emirates Islamic",
    "RAKBank"
  ],
  SA: [
    "National Commercial Bank (NCB)",
    "Riyad Bank",
    "Banque Saudi Fransi",
    "Saudi British Bank (SABB)",
    "Arab National Bank",
    "Al Rajhi Bank",
    "Saudi Investment Bank",
    "Samba Financial Group"
  ],
  IL: [
    "Bank Hapoalim",
    "Bank Leumi",
    "Israel Discount Bank",
    "Mizrahi Tefahot Bank",
    "First International Bank of Israel (FIBI)",
    "Bank Yahav",
    "Israel Postal Bank"
  ],
  TR: [
    "Türkiye İş Bankası",
    "Garanti BBVA",
    "Akbank",
    "Yapı Kredi",
    "Halkbank",
    "Ziraat Bankası",
    "VakıfBank",
    "QNB Finansbank"
  ],
  EG: [
    "National Bank of Egypt (NBE)",
    "Banque Misr",
    "Commercial International Bank (CIB)",
    "Qatar National Bank (QNB) Egypt",
    "Banque du Caire",
    "Alexandria Bank"
  ],
  ZA: [
    "Standard Bank South Africa",
    "First National Bank (FNB)",
    "Absa Bank",
    "Nedbank",
    "Capitec Bank",
    "Investec Bank",
    "African Bank"
  ],
  NG: [
    "First Bank of Nigeria",
    "Guaranty Trust Bank (GTBank)",
    "Access Bank",
    "United Bank for Africa (UBA)",
    "Zenith Bank",
    "Ecobank Nigeria",
    "Union Bank of Nigeria",
    "Sterling Bank"
  ],
  KE: [
    "Equity Bank",
    "KCB Bank",
    "Co-operative Bank of Kenya",
    "Standard Chartered Kenya",
    "Barclays Bank of Kenya (Absa)",
    "Diamond Trust Bank",
    "I&M Bank"
  ],
  GH: [
    "Ghana Commercial Bank (GCB)",
    "Ecobank Ghana",
    "Standard Chartered Ghana",
    "Barclays Ghana (Absa)",
    "Fidelity Bank Ghana",
    "CalBank",
    "Guaranty Trust Bank Ghana"
  ],
  MX: [
    "BBVA México",
    "Santander México",
    "Banorte",
    "Citibanamex",
    "HSBC México",
    "Scotiabank México",
    "Inbursa",
    "Banregio"
  ],
  BR: [
    "Itaú Unibanco",
    "Banco do Brasil",
    "Bradesco",
    "Caixa Econômica Federal",
    "Santander Brasil",
    "Banco Safra",
    "Nubank",
    "Inter"
  ],
  AR: [
    "Banco de la Nación Argentina",
    "Banco Santander Río",
    "Banco Galicia",
    "BBVA Banco Francés",
    "Banco Macro",
    "Banco Patagonia",
    "Banco Itaú Argentina"
  ],
  CO: [
    "Bancolombia",
    "Banco de Bogotá",
    "BBVA Colombia",
    "Davivienda",
    "Banco de Occidente",
    "Scotiabank Colpatria",
    "Itaú Colombia"
  ],
  CL: [
    "Banco de Chile",
    "Banco Santander Chile",
    "Banco Estado",
    "Scotiabank Chile",
    "Banco BCI",
    "Banco Itaú Chile",
    "Banco Security",
    "CorpBanca"
  ],
  PE: [
    "Banco de Crédito del Perú (BCP)",
    "BBVA Perú",
    "Scotiabank Perú",
    "Interbank",
    "Banco de la Nación",
    "Banco Falabella"
  ],
  VE: [
    "Banco de Venezuela",
    "Banesco",
    "Banco Mercantil",
    "BBVA Provincial",
    "Banco Nacional de Crédito",
    "Banco Exterior",
    "Banco Caroní"
  ],
  RU: [
    "Sberbank",
    "VTB Bank",
    "Gazprombank",
    "Alfa-Bank",
    "Tinkoff Bank",
    "Raiffeisenbank Russia",
    "Rosbank",
    "Promsvyazbank"
  ],
  UA: [
    "PrivatBank",
    "Oschadbank",
    "Ukreximbank",
    "Raiffeisen Bank Aval",
    "Ukrgasbank",
    "Sense Bank",
    "Credit Agricole Ukraine"
  ],
  NZ: [
    "ANZ Bank New Zealand",
    "ASB Bank",
    "Bank of New Zealand (BNZ)",
    "Westpac New Zealand",
    "Kiwibank",
    "Heartland Bank",
    "The Co-operative Bank"
  ]
};
const COUNTRY_CITIES = {
  US: [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Austin",
    "Jacksonville",
    "Fort Worth",
    "Columbus",
    "Charlotte",
    "San Francisco",
    "Indianapolis",
    "Seattle",
    "Denver",
    "Washington",
    "Boston",
    "El Paso",
    "Nashville",
    "Detroit",
    "Oklahoma City",
    "Las Vegas",
    "Louisville",
    "Baltimore",
    "Milwaukee",
    "Albuquerque",
    "Tucson",
    "Fresno",
    "Mesa",
    "Sacramento",
    "Atlanta",
    "Kansas City",
    "Colorado Springs",
    "Omaha",
    "Raleigh"
  ],
  GB: [
    "London",
    "Birmingham",
    "Manchester",
    "Leeds",
    "Glasgow",
    "Sheffield",
    "Bradford",
    "Liverpool",
    "Edinburgh",
    "Cardiff",
    "Belfast",
    "Leicester",
    "Coventry",
    "Nottingham",
    "Newcastle",
    "Sunderland",
    "Brighton",
    "Hull",
    "Plymouth",
    "Stoke-on-Trent",
    "Derby",
    "Southampton",
    "Wolverhampton",
    "Portsmouth",
    "York",
    "Oxford",
    "Cambridge",
    "Bristol",
    "Bath"
  ],
  CA: [
    "Toronto",
    "Montreal",
    "Vancouver",
    "Calgary",
    "Edmonton",
    "Ottawa",
    "Winnipeg",
    "Quebec City",
    "Hamilton",
    "Kitchener",
    "London",
    "Halifax",
    "St. Catharines",
    "Oshawa",
    "Victoria",
    "Windsor",
    "Saskatoon",
    "Regina",
    "Barrie",
    "St. John's",
    "Kelowna",
    "Abbotsford",
    "Trois-Rivières",
    "Kingston",
    "Guelph",
    "Moncton",
    "Brantford",
    "Thunder Bay",
    "Peterborough"
  ],
  AU: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Newcastle",
    "Canberra",
    "Sunshine Coast",
    "Wollongong",
    "Hobart",
    "Geelong",
    "Townsville",
    "Cairns",
    "Toowoomba",
    "Darwin",
    "Ballarat",
    "Bendigo",
    "Albury",
    "Launceston",
    "Mackay",
    "Rockhampton",
    "Bunbury",
    "Bundaberg",
    "Coffs Harbour",
    "Wagga Wagga",
    "Hervey Bay",
    "Port Macquarie"
  ],
  DE: [
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Leipzig",
    "Dortmund",
    "Essen",
    "Bremen",
    "Dresden",
    "Hanover",
    "Nuremberg",
    "Duisburg",
    "Bochum",
    "Wuppertal",
    "Bielefeld",
    "Bonn",
    "Münster",
    "Karlsruhe",
    "Mannheim",
    "Augsburg",
    "Wiesbaden",
    "Gelsenkirchen",
    "Mönchengladbach",
    "Braunschweig",
    "Chemnitz",
    "Kiel"
  ],
  FR: [
    "Paris",
    "Marseille",
    "Lyon",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
    "Lille",
    "Rennes",
    "Reims",
    "Le Havre",
    "Saint-Étienne",
    "Toulon",
    "Grenoble",
    "Dijon",
    "Angers",
    "Nîmes",
    "Villeurbanne",
    "Saint-Denis",
    "Le Mans",
    "Aix-en-Provence",
    "Brest",
    "Limoges",
    "Clermont-Ferrand",
    "Tours",
    "Amiens",
    "Perpignan"
  ],
  IT: [
    "Rome",
    "Milan",
    "Naples",
    "Turin",
    "Palermo",
    "Genoa",
    "Bologna",
    "Florence",
    "Bari",
    "Catania",
    "Venice",
    "Verona",
    "Messina",
    "Padua",
    "Trieste",
    "Taranto",
    "Brescia",
    "Prato",
    "Reggio Calabria",
    "Modena",
    "Parma",
    "Perugia",
    "Livorno",
    "Ravenna",
    "Cagliari",
    "Foggia",
    "Rimini",
    "Salerno",
    "Ferrara",
    "Sassari"
  ],
  ES: [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Seville",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Las Palmas",
    "Bilbao",
    "Alicante",
    "Córdoba",
    "Valladolid",
    "Vigo",
    "Gijón",
    "Hospitalet de Llobregat",
    "A Coruña",
    "Vitoria-Gasteiz",
    "Granada",
    "Elche",
    "Oviedo",
    "Santa Cruz de Tenerife",
    "Badalona",
    "Cartagena",
    "Terrassa",
    "Jerez de la Frontera",
    "Sabadell"
  ],
  NL: [
    "Amsterdam",
    "Rotterdam",
    "The Hague",
    "Utrecht",
    "Eindhoven",
    "Tilburg",
    "Groningen",
    "Almere",
    "Breda",
    "Nijmegen",
    "Enschede",
    "Haarlem",
    "Arnhem",
    "Zaanstad",
    "Amersfoort",
    "Apeldoorn",
    "Hoofddorp",
    "Maastricht",
    "Leiden",
    "Dordrecht",
    "Zoetermeer",
    "Zwolle",
    "Emmen",
    "Delft"
  ],
  BE: [
    "Brussels",
    "Antwerp",
    "Ghent",
    "Charleroi",
    "Liège",
    "Bruges",
    "Namur",
    "Leuven",
    "Mons",
    "Mechelen",
    "Aalst",
    "La Louvière",
    "Kortrijk",
    "Hasselt",
    "Ostend",
    "Sint-Niklaas",
    "Tournai",
    "Genk",
    "Seraing",
    "Roeselare",
    "Verviers",
    "Mouscron",
    "Dendermonde",
    "Beveren"
  ],
  CH: [
    "Zurich",
    "Geneva",
    "Basel",
    "Bern",
    "Lausanne",
    "Winterthur",
    "Lucerne",
    "St. Gallen",
    "Lugano",
    "Biel/Bienne",
    "Thun",
    "Köniz",
    "Bellinzona",
    "Fribourg",
    "Chur",
    "Uster",
    "Sion",
    "Emmen",
    "Zug",
    "Schaffhausen",
    "Frauenfeld",
    "Liestal",
    "Olten",
    "Solothurn"
  ],
  AT: [
    "Vienna",
    "Graz",
    "Linz",
    "Salzburg",
    "Innsbruck",
    "Klagenfurt",
    "Wels",
    "Villach",
    "Sankt Pölten",
    "Dornbirn",
    "Steyr",
    "Leonding",
    "Klosterneuburg",
    "Wolfsberg",
    "Leoben",
    "Traun",
    "Amstetten",
    "Ansfelden",
    "Baden bei Wien",
    "Stockerau",
    "Marchtrenk",
    "Korneuburg"
  ],
  SE: [
    "Stockholm",
    "Gothenburg",
    "Malmö",
    "Uppsala",
    "Linköping",
    "Västerås",
    "Örebro",
    "Norrköping",
    "Helsingborg",
    "Jönköping",
    "Umeå",
    "Lund",
    "Borås",
    "Sundsvall",
    "Gävle",
    "Växjö",
    "Karlstad",
    "Södertälje",
    "Trollhättan",
    "Kalmar",
    "Kristianstad",
    "Falun",
    "Skövde",
    "Östersund"
  ],
  NO: [
    "Oslo",
    "Bergen",
    "Trondheim",
    "Stavanger",
    "Bærum",
    "Drammen",
    "Fredrikstad",
    "Sandnes",
    "Tromsø",
    "Haugesund",
    "Gjøvik",
    "Porsgrunn",
    "Kristiansand",
    "Ålesund",
    "Tønsberg",
    "Moss",
    "Bodø",
    "Arendal",
    "Sandefjord",
    "Skien",
    "Molde",
    "Harstad",
    "Lillehammer",
    "Halden"
  ],
  DK: [
    "Copenhagen",
    "Aarhus",
    "Odense",
    "Aalborg",
    "Frederiksberg",
    "Esbjerg",
    "Horsens",
    "Randers",
    "Kolding",
    "Vejle",
    "Roskilde",
    "Helsingør",
    "Silkeborg",
    "Herning",
    "Næstved",
    "Greve Strand",
    "Tårnby",
    "Fredericia",
    "Ballerup",
    "Rødovre",
    "Vordingborg",
    "Lyngby-Taarbæk",
    "Gladsaxe",
    "Hvidovre"
  ],
  FI: [
    "Helsinki",
    "Espoo",
    "Tampere",
    "Vantaa",
    "Oulu",
    "Turku",
    "Jyväskylä",
    "Lahti",
    "Kuopio",
    "Kouvola",
    "Pori",
    "Joensuu",
    "Lappeenranta",
    "Vaasa",
    "Hämeenlinna",
    "Rovaniemi",
    "Seinäjoki",
    "Mikkeli",
    "Kotka",
    "Salo",
    "Kokkola",
    "Imatra",
    "Kajaani",
    "Nokia"
  ],
  PL: [
    "Warsaw",
    "Kraków",
    "Łódź",
    "Wrocław",
    "Poznań",
    "Gdańsk",
    "Szczecin",
    "Bydgoszcz",
    "Lublin",
    "Katowice",
    "Białystok",
    "Gdynia",
    "Częstochowa",
    "Radom",
    "Sosnowiec",
    "Toruń",
    "Kielce",
    "Rzeszów",
    "Olsztyn",
    "Gliwice",
    "Zabrze",
    "Bytom",
    "Zielona Góra",
    "Rybnik"
  ],
  PT: [
    "Lisbon",
    "Porto",
    "Amadora",
    "Braga",
    "Setúbal",
    "Coimbra",
    "Queluz",
    "Funchal",
    "Cacem",
    "Vila Nova de Gaia",
    "Algés",
    "Loures",
    "Felgueiras",
    "Evora",
    "Rio Tinto",
    "Barreiro",
    "Aveiro",
    "Odivelas",
    "Rio de Mouro",
    "Corroios",
    "Barcelos",
    "Guimarães",
    "Ermesinde",
    "Maia"
  ],
  GR: [
    "Athens",
    "Thessaloniki",
    "Patras",
    "Heraklion",
    "Larissa",
    "Volos",
    "Ioannina",
    "Trikala",
    "Chalcis",
    "Serres",
    "Karditsa",
    "Alexandroupoli",
    "Xanthi",
    "Komotini",
    "Agrinio",
    "Kalamata",
    "Kavala",
    "Drama",
    "Veria",
    "Kozani",
    "Katerini",
    "Ptolemaida",
    "Veroia",
    "Corfu"
  ],
  CZ: [
    "Prague",
    "Brno",
    "Ostrava",
    "Plzeň",
    "Liberec",
    "Olomouc",
    "České Budějovice",
    "Hradec Králové",
    "Ústí nad Labem",
    "Pardubice",
    "Zlín",
    "Havířov",
    "Kladno",
    "Most",
    "Opava",
    "Frýdek-Místek",
    "Jihlava",
    "Karlovy Vary",
    "Teplice",
    "Chomutov",
    "Karviná",
    "Jablonec nad Nisou"
  ],
  RO: [
    "Bucharest",
    "Cluj-Napoca",
    "Timișoara",
    "Iași",
    "Constanța",
    "Craiova",
    "Brașov",
    "Galați",
    "Ploiești",
    "Oradea",
    "Brăila",
    "Arad",
    "Pitești",
    "Sibiu",
    "Bacău",
    "Târgu Mureș",
    "Baia Mare",
    "Buzău",
    "Botoșani",
    "Satu Mare",
    "Râmnicu Vâlcea",
    "Suceava",
    "Drobeta-Turnu Severin"
  ],
  HU: [
    "Budapest",
    "Debrecen",
    "Szeged",
    "Miskolc",
    "Pécs",
    "Győr",
    "Nyíregyháza",
    "Kecskemét",
    "Székesfehérvár",
    "Szombathely",
    "Szolnok",
    "Tatabánya",
    "Kaposvár",
    "Érd",
    "Veszprém",
    "Békéscsaba",
    "Zalaegerszeg",
    "Sopron",
    "Eger",
    "Nagykanizsa",
    "Dunaújváros",
    "Hódmezővásárhely"
  ],
  SK: [
    "Bratislava",
    "Košice",
    "Prešov",
    "Žilina",
    "Nitra",
    "Banská Bystrica",
    "Trnava",
    "Martin",
    "Trenčín",
    "Poprad",
    "Prievidza",
    "Zvolen",
    "Michalovce",
    "Spišská Nová Ves",
    "Komárno",
    "Levice",
    "Humenné",
    "Bardejov",
    "Liptovský Mikuláš",
    "Lučenec",
    "Pezinok",
    "Ružomberok",
    "Piešťany"
  ],
  HR: [
    "Zagreb",
    "Split",
    "Rijeka",
    "Osijek",
    "Zadar",
    "Slavonski Brod",
    "Karlovac",
    "Varaždin",
    "Šibenik",
    "Dubrovnik",
    "Sisak",
    "Kaštela",
    "Vukovar",
    "Bjelovar",
    "Vinkovci",
    "Koprivnica",
    "Pula",
    "Đakovo",
    "Čakovec",
    "Požega",
    "Zaprešić",
    "Solin",
    "Kutina",
    "Metković"
  ],
  IN: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Surat",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik"
  ],
  CN: [
    "Shanghai",
    "Beijing",
    "Shenzhen",
    "Guangzhou",
    "Chengdu",
    "Hangzhou",
    "Wuhan",
    "Xi'an",
    "Suzhou",
    "Nanjing",
    "Chongqing",
    "Tianjin",
    "Wuxi",
    "Ningbo",
    "Zhengzhou",
    "Changsha",
    "Qingdao",
    "Foshan",
    "Dongguan",
    "Shenyang",
    "Dalian",
    "Kunming",
    "Hefei",
    "Shijiazhuang"
  ],
  JP: [
    "Tokyo",
    "Yokohama",
    "Osaka",
    "Nagoya",
    "Sapporo",
    "Fukuoka",
    "Kobe",
    "Kawasaki",
    "Kyoto",
    "Saitama",
    "Hiroshima",
    "Sendai",
    "Kitakyushu",
    "Chiba",
    "Sakai",
    "Niigata",
    "Hamamatsu",
    "Kumamoto",
    "Sagamihara",
    "Okayama",
    "Shizuoka",
    "Kanazawa",
    "Utsunomiya",
    "Matsuyama"
  ],
  KR: [
    "Seoul",
    "Busan",
    "Incheon",
    "Daegu",
    "Daejeon",
    "Gwangju",
    "Suwon",
    "Ulsan",
    "Changwon",
    "Goyang",
    "Yongin",
    "Seongnam",
    "Bucheon",
    "Cheongju",
    "Ansan",
    "Namyangju",
    "Hwaseong",
    "Anyang",
    "Cheonan",
    "Pohang",
    "Gimhae",
    "Jeonju",
    "Siheung",
    "Pyeongtaek"
  ],
  SG: [
    "Singapore",
    "Woodlands",
    "Tampines",
    "Pasir Ris",
    "Yishun",
    "Jurong West",
    "Choa Chu Kang",
    "Hougang",
    "Sengkang",
    "Punggol",
    "Ang Mo Kio",
    "Bedok",
    "Clementi",
    "Bukit Timah",
    "Bishan",
    "Toa Payoh",
    "Geylang",
    "Marine Parade",
    "Bukit Merah",
    "Queenstown",
    "Kallang",
    "Bukit Panjang",
    "Serangoon",
    "Novena"
  ],
  HK: [
    "Hong Kong Island",
    "Kowloon",
    "New Territories",
    "Victoria Peak",
    "Central",
    "Wan Chai",
    "Causeway Bay",
    "Tsim Sha Tsui",
    "Mong Kok",
    "Yau Ma Tei",
    "Sham Shui Po",
    "Kowloon Bay",
    "Kwun Tong",
    "Wong Tai Sin",
    "Sha Tin",
    "Tuen Mun",
    "Tseung Kwan O",
    "Tai Po",
    "Fanling",
    "Yuen Long",
    "Sheung Shui"
  ],
  TW: [
    "Taipei",
    "New Taipei City",
    "Taichung",
    "Kaohsiung",
    "Tainan",
    "Taoyuan",
    "Hsinchu",
    "Keelung",
    "Chiayi",
    "Changhua",
    "Pingtung",
    "Yunlin",
    "Nantou",
    "Hualien",
    "Ilan",
    "Taitung",
    "Miaoli",
    "Kinmen",
    "Penghu",
    "Lienchiang"
  ],
  TH: [
    "Bangkok",
    "Nonthaburi",
    "Nakhon Ratchasima",
    "Chiang Mai",
    "Hat Yai",
    "Udon Thani",
    "Pak Kret",
    "Khon Kaen",
    "Nakhon Si Thammarat",
    "Lampang",
    "Si Racha",
    "Phitsanulok",
    "Thon Buri",
    "Sattahip",
    "Yala",
    "Surat Thani",
    "Chon Buri",
    "Rayong",
    "Samut Prakan",
    "Ratchaburi",
    "Ayutthaya"
  ],
  ID: [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Bekasi",
    "Medan",
    "Tangerang",
    "Depok",
    "Semarang",
    "Palembang",
    "Makassar",
    "South Tangerang",
    "Batam",
    "Pekanbaru",
    "Bogor",
    "Bandar Lampung",
    "Padang",
    "Malang",
    "Samarinda",
    "Tasikmalaya",
    "Denpasar",
    "Pontianak",
    "Jambi",
    "Cimahi",
    "Surakarta"
  ],
  MY: [
    "Kuala Lumpur",
    "George Town",
    "Ipoh",
    "Shah Alam",
    "Petaling Jaya",
    "Johor Bahru",
    "Subang Jaya",
    "Iskandar Puteri",
    "Klang",
    "Kuantan",
    "Kota Kinabalu",
    "Kuching",
    "Malacca City",
    "Miri",
    "Alor Setar",
    "Sungai Petani",
    "Kuala Terengganu",
    "Muar",
    "Butterworth",
    "Seberang Perai"
  ],
  PH: [
    "Quezon City",
    "Manila",
    "Caloocan",
    "Davao City",
    "Cebu City",
    "Zamboanga City",
    "Antipolo",
    "Pasig",
    "Taguig",
    "Valenzuela",
    "Dasmariñas",
    "Makati",
    "Marikina",
    "Parañaque",
    "Muntinlupa",
    "Las Piñas",
    "Mandaluyong",
    "Bacolod",
    "Iloilo City",
    "General Santos",
    "Malolos",
    "Cainta"
  ],
  VN: [
    "Ho Chi Minh City",
    "Hanoi",
    "Can Tho",
    "Hai Phong",
    "Da Nang",
    "Bien Hoa",
    "Hue",
    "Nha Trang",
    "Vinh",
    "Qui Nhon",
    "My Tho",
    "Thai Nguyen",
    "Long Xuyen",
    "Buon Ma Thuot",
    "Nam Dinh",
    "Phan Thiet",
    "Cam Ranh",
    "Vung Tau",
    "Ha Long",
    "Thanh Hoa",
    "Play Cu",
    "Tuy Hoa"
  ],
  PK: [
    "Karachi",
    "Lahore",
    "Faisalabad",
    "Rawalpindi",
    "Gujranwala",
    "Multan",
    "Hyderabad",
    "Peshawar",
    "Quetta",
    "Islamabad",
    "Sargodha",
    "Sialkot",
    "Bahawalpur",
    "Sukkur",
    "Jhang",
    "Sheikhupura",
    "Larkana",
    "Gujrat",
    "Mardan",
    "Kasur",
    "Rahim Yar Khan",
    "Sahiwal",
    "Okara",
    "Wah"
  ],
  BD: [
    "Dhaka",
    "Chittagong",
    "Khulna",
    "Rajshahi",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Comilla",
    "Narayanganj",
    "Gazipur",
    "Mymensingh",
    "Jessore",
    "Kushtia",
    "Bogra",
    "Dinajpur",
    "Tangail",
    "Pabna",
    "Noakhali",
    "Brahmanbaria",
    "Feni",
    "Faridpur",
    "Jamalpur",
    "Naogaon",
    "Cox's Bazar"
  ],
  LK: [
    "Colombo",
    "Dehiwala-Mount Lavinia",
    "Moratuwa",
    "Negombo",
    "Pita Kotte",
    "Sri Jayewardenepura Kotte",
    "Kandy",
    "Galle",
    "Trincomalee",
    "Jaffna",
    "Batticaloa",
    "Katunayake",
    "Dambulla",
    "Kolonnawa",
    "Anuradhapura",
    "Ratnapura",
    "Gampaha",
    "Matara",
    "Badulla",
    "Homagama"
  ],
  AE: [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Al Ain",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
    "Dibba Al-Fujairah",
    "Khor Fakkan",
    "Jebel Ali",
    "Madinat Zayed",
    "Ruwais",
    "Dhaid",
    "Ghayathi",
    "Liwa Oasis",
    "Kalba",
    "Dibba Al-Hisn"
  ],
  SA: [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "Ta'if",
    "Tabuk",
    "Buraidah",
    "Khobar",
    "Hofuf",
    "Jubail",
    "Khamis Mushait",
    "Ha'il",
    "Najran",
    "Yanbu",
    "Abha",
    "Qatif",
    "Muhayil",
    "Arar",
    "Sakaka",
    "Hafar Al-Batin",
    "Jizan",
    "Unaizah"
  ],
  IL: [
    "Jerusalem",
    "Tel Aviv",
    "Haifa",
    "Ashdod",
    "Rishon LeZion",
    "Petah Tikva",
    "Beersheba",
    "Netanya",
    "Holon",
    "Bnei Brak",
    "Ramat Gan",
    "Bat Yam",
    "Rehovot",
    "Herzliya",
    "Kfar Saba",
    "Modi'in",
    "Hadera",
    "Ra'anana",
    "Lod",
    "Nazareth",
    "Nahariya",
    "Givatayim",
    "Eilat"
  ],
  TR: [
    "Istanbul",
    "Ankara",
    "Izmir",
    "Bursa",
    "Adana",
    "Gaziantep",
    "Konya",
    "Antalya",
    "Mersin",
    "Diyarbakır",
    "Kayseri",
    "Eskişehir",
    "Samsun",
    "Denizli",
    "Şanlıurfa",
    "Malatya",
    "Kahramanmaraş",
    "Erzurum",
    "Van",
    "Batman",
    "Elazığ",
    "Sivas",
    "Manisa",
    "Hatay"
  ],
  EG: [
    "Cairo",
    "Alexandria",
    "Giza",
    "Shubra El Kheima",
    "Port Said",
    "Suez",
    "Luxor",
    "Mansoura",
    "El Mahalla El Kubra",
    "Tanta",
    "Asyut",
    "Ismailia",
    "Fayyum",
    "Zagazig",
    "Aswan",
    "Damietta",
    "Minya",
    "Beni Suef",
    "Qena",
    "Sohag",
    "Hurghada",
    "Arish",
    "Mallawi"
  ],
  ZA: [
    "Johannesburg",
    "Cape Town",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "Nelspruit",
    "Kimberley",
    "Polokwane",
    "Pietermaritzburg",
    "Rustenburg",
    "East London",
    "Soweto",
    "Tembisa",
    "Katlehong",
    "Umlazi",
    "Khayelitsha",
    "Randburg",
    "Sandton",
    "Midrand"
  ],
  NG: [
    "Lagos",
    "Kano",
    "Ibadan",
    "Abuja",
    "Port Harcourt",
    "Benin City",
    "Maiduguri",
    "Zaria",
    "Aba",
    "Ilorin",
    "Oyo",
    "Enugu",
    "Abeokuta",
    "Onitsha",
    "Warri",
    "Kaduna",
    "Calabar",
    "Uyo",
    "Sokoto",
    "Ogbomosho",
    "Akure",
    "Osogbo",
    "Bauchi",
    "Ilesha"
  ],
  KE: [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Kehancha",
    "Ruiru",
    "Kikuyu",
    "Kangundo-Tala",
    "Malindi",
    "Naivasha",
    "Thika",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Kilifi",
    "Machakos",
    "Athi River",
    "Nyeri",
    "Wajir",
    "Mandera",
    "Migori",
    "Bungoma",
    "Vihiga"
  ],
  GH: [
    "Accra",
    "Kumasi",
    "Tamale",
    "Sekondi-Takoradi",
    "Ashaiman",
    "Tema",
    "Cape Coast",
    "Koforidua",
    "Sunyani",
    "Ho",
    "Techiman",
    "Obuasi",
    "Wa",
    "Bolgatanga",
    "Dunkwa",
    "Nsawam",
    "Oda",
    "Winneba",
    "Ejura",
    "Tafo",
    "Yendi",
    "Savelugu",
    "Kpandu"
  ],
  MX: [
    "Mexico City",
    "Guadalajara",
    "Monterrey",
    "Puebla",
    "Tijuana",
    "León",
    "Juárez",
    "Zapopan",
    "Monclova",
    "Cancún",
    "Querétaro",
    "Mérida",
    "Chihuahua",
    "San Luis Potosí",
    "Aguascalientes",
    "Toluca",
    "Cuernavaca",
    "Acapulco",
    "Hermosillo",
    "Saltillo",
    "Morelia",
    "Veracruz",
    "Culiacán"
  ],
  BR: [
    "São Paulo",
    "Rio de Janeiro",
    "Brasília",
    "Salvador",
    "Fortaleza",
    "Belo Horizonte",
    "Manaus",
    "Curitiba",
    "Recife",
    "Porto Alegre",
    "Belém",
    "Goiânia",
    "Guarulhos",
    "Campinas",
    "São Luís",
    "São Gonçalo",
    "Maceió",
    "Duque de Caxias",
    "Natal",
    "Campo Grande",
    "Teresina",
    "São Bernardo do Campo"
  ],
  AR: [
    "Buenos Aires",
    "Córdoba",
    "Rosario",
    "Mendoza",
    "La Plata",
    "Tucumán",
    "Mar del Plata",
    "Salta",
    "Santa Fe",
    "San Juan",
    "Resistencia",
    "Santiago del Estero",
    "Corrientes",
    "Bahía Blanca",
    "Neuquén",
    "Posadas",
    "San Salvador de Jujuy",
    "Paraná",
    "Formosa",
    "San Luis",
    "Catamarca"
  ],
  CO: [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Cúcuta",
    "Soledad",
    "Ibagué",
    "Bucaramanga",
    "Soacha",
    "Villavicencio",
    "Santa Marta",
    "Bello",
    "Valledupar",
    "Montería",
    "Pereira",
    "Manizales",
    "Pasto",
    "Neiva",
    "Armenia",
    "Popayán",
    "Sincelejo",
    "Floridablanca"
  ],
  CL: [
    "Santiago",
    "Valparaíso",
    "Concepción",
    "La Serena",
    "Antofagasta",
    "Iquique",
    "Temuco",
    "Puerto Montt",
    "Rancagua",
    "Talca",
    "Arica",
    "Chillán",
    "Los Ángeles",
    "Calama",
    "Copiapó",
    "Valdivia",
    "Quillota",
    "Osorno",
    "Curicó",
    "Punta Arenas",
    "San Antonio",
    "San Bernardo"
  ],
  PE: [
    "Lima",
    "Arequipa",
    "Callao",
    "Trujillo",
    "Chiclayo",
    "Piura",
    "Chimbote",
    "Huancayo",
    "Cusco",
    "Tacna",
    "Iquitos",
    "Pucallpa",
    "Juliaca",
    "Sullana",
    "Chincha Alta",
    "Tarapoto",
    "Paita",
    "Ica",
    "Ayacucho",
    "Huánuco",
    "Huaraz",
    "Puno",
    "Huaral"
  ],
  VE: [
    "Caracas",
    "Maracaibo",
    "Valencia",
    "Barquisimeto",
    "Maracay",
    "Ciudad Guayana",
    "San Cristóbal",
    "Maturín",
    "Puerto La Cruz",
    "Barcelona",
    "Cumaná",
    "Barinas",
    "San Fernando de Apure",
    "Los Teques",
    "Cabimas",
    "Coro",
    "Guanare",
    "Valera",
    "Acarigua",
    "Ciudad Bolívar",
    "Punto Fijo"
  ],
  RU: [
    "Moscow",
    "Saint Petersburg",
    "Novosibirsk",
    "Yekaterinburg",
    "Kazan",
    "Nizhny Novgorod",
    "Chelyabinsk",
    "Samara",
    "Omsk",
    "Rostov-on-Don",
    "Ufa",
    "Krasnoyarsk",
    "Voronezh",
    "Perm",
    "Volgograd",
    "Krasnodar",
    "Saratov",
    "Tyumen",
    "Tolyatti",
    "Barnaul",
    "Tver",
    "Izhevsk"
  ],
  UA: [
    "Kyiv",
    "Kharkiv",
    "Odesa",
    "Dnipro",
    "Donetsk",
    "Zaporizhzhia",
    "Lviv",
    "Kryvyi Rih",
    "Mykolaiv",
    "Mariupol",
    "Sevastopol",
    "Luhansk",
    "Vinnytsia",
    "Simferopol",
    "Chernihiv",
    "Kherson",
    "Poltava",
    "Khmelnytskyi",
    "Cherkasy",
    "Chernivtsi",
    "Zhytomyr",
    "Sumy",
    "Rivne"
  ],
  NZ: [
    "Auckland",
    "Wellington",
    "Christchurch",
    "Hamilton",
    "Tauranga",
    "Napier-Hastings",
    "Dunedin",
    "Palmerston North",
    "Nelson",
    "New Plymouth",
    "Whangarei",
    "Rotorua",
    "Invercargill",
    "Kapiti",
    "Whanganui",
    "Gisborne",
    "Blenheim",
    "Pukekohe",
    "Timaru",
    "Masterton"
  ]
};
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
function getRandomCountry() {
  return pickRandom(COUNTRIES);
}
function getRandomBankForCountry(countryCode2) {
  const banks = BANKS_BY_COUNTRY[countryCode2];
  if (!banks || banks.length === 0) return "";
  return pickRandom(banks);
}
function getRandomStateForCountry(countryCode2) {
  const states = COUNTRY_STATES[countryCode2];
  if (!states || states.length === 0) return "";
  return pickRandom(states);
}
function getRandomCityForCountry(countryCode2) {
  const cities = COUNTRY_CITIES[countryCode2];
  if (!cities || cities.length === 0) return "";
  return pickRandom(cities);
}
const GEO_DATA = {
  US: {
    states: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri", "Maryland", "Wisconsin"],
    cities: {
      "California": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
      "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
      "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
      "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Albany", "Warner Robins"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Clinton Township"],
      "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton"],
      "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Yakima", "Federal Way"],
      "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Gilbert", "Glendale", "Scottsdale", "Tempe", "Peoria", "Surprise"],
      "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River"],
      "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett"],
      "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette"],
      "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "St. Peters"],
      "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Laurel"],
      "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Oshkosh", "Eau Claire", "Janesville"]
    }
  },
  NL: {
    states: ["North Holland", "South Holland", "Utrecht", "North Brabant", "Limburg", "Groningen", "Friesland", "Drenthe", "Overijssel", "Gelderland", "Flevoland", "Zeeland"],
    cities: {
      "North Holland": ["Amsterdam", "Haarlem", "Zaanstad", "Hilversum", "Purmerend", "Amstelveen", "Hoofddorp", "Zaandam", "Aalsmeer", "Heemskerk"],
      "South Holland": ["The Hague", "Rotterdam", "Zoetermeer", "Dordrecht", "Leiden", "Delft", "Gouda", "Spijkenisse", "Capelle aan den IJssel", "Vlaardingen"],
      "Utrecht": ["Utrecht", "Amersfoort", "Nieuwegein", "Veenendaal", "Zeist", "Houten", "Woerden", "IJsselstein", "Bilthoven", "Leusden"],
      "North Brabant": ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Helmond", "Roosendaal", "Oss", "Bergen op Zoom", "Oosterhout", "Valkenswaard"],
      "Limburg": ["Maastricht", "Venlo", "Sittard", "Heerlen", "Roermond", "Kerkrade", "Weert", "Geleen", "Stein", "Brunssum"],
      "Groningen": ["Groningen", "Delfzijl", "Hoogezand", "Veendam", "Stadskanaal", "Winschoten", "Haren", "Leek", "Zuidhorn", "Ten Boer"],
      "Friesland": ["Leeuwarden", "Drachten", "Sneek", "Heerenveen", "Harlingen", "Dokkum", "Franeker", "Joure", "Wolvega", "Bolsward"],
      "Drenthe": ["Assen", "Emmen", "Hoogeveen", "Meppel", "Coevorden", "Roden", "Beilen", "Haren", "Anloo", "Zuidlaren"],
      "Overijssel": ["Zwolle", "Enschede", "Deventer", "Almelo", "Hengelo", "Kampen", "Raalte", "Wierden", "Rijssen", "Oldenzaal"],
      "Gelderland": ["Nijmegen", "Arnhem", "Apeldoorn", "Ede", "Doetinchem", "Zutphen", "Harderwijk", "Tiel", "Wageningen", "Culemborg"],
      "Flevoland": ["Almere", "Lelystad", "Dronten", "Zeewolde", "Noordoostpolder", "Urk", "Emmeloord", "Biddinghuizen", "Swifterbant", "Luttelgeest"],
      "Zeeland": ["Middelburg", "Vlissingen", "Goes", "Terneuzen", "Zierikzee", "Tholen", "Sint Maartensdijk", "Kruiningen", "Borsele", "Kapelle"]
    }
  },
  GB: {
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    cities: {
      "England": ["London", "Birmingham", "Manchester", "Leeds", "Newcastle", "Sheffield", "Liverpool", "Nottingham", "Bristol", "Leicester"],
      "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Paisley", "East Kilbride", "Livingston", "Hamilton", "Cumbernauld", "Kirkcaldy"],
      "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Neath", "Cwmbran", "Bridgend", "Llanelli", "Merthyr Tydfil"],
      "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newtownards", "Carrickfergus"]
    }
  },
  CA: {
    states: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"],
    cities: {
      "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Levis", "Trois-Rivieres", "Terrebonne"],
      "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Langley", "Saanich", "Delta"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Lloydminster"],
      "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Portage la Prairie", "Thompson", "Winkler", "Selkirk", "Morden", "Dauphin", "The Pas"],
      "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton", "North Battleford", "Estevan", "Weyburn", "Coteau-du-Lac"],
      "Nova Scotia": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow", "Glace Bay", "Kentville", "Amherst", "Bridgewater", "Yarmouth"],
      "New Brunswick": ["Fredericton", "Saint John", "Moncton", "Dieppe", "Miramichi", "Edmundston", "Bathurst", "Campbellton", "Oromocto", "Shediac"],
      "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South", "Paradise", "Grand Falls-Windsor", "Gander", "Happy Valley-Goose Bay", "Labrador City", "Carbonear"],
      "Prince Edward Island": ["Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague", "Kensington", "Souris", "Alberton", "Tignish", "Georgetown"]
    }
  },
  AU: {
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
    cities: {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Maitland", "Tweed Heads", "Coffs Harbour", "Port Macquarie", "Orange", "Dubbo", "Bathurst"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Melton", "Mildura", "Warrnambool", "Sunbury", "Traralgon"],
      "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay"],
      "Western Australia": ["Perth", "Mandurah", "Bunbury", "Kalgoorlie", "Geraldton", "Albany", "Busselton", "Karratha", "Broome", "Port Hedland"],
      "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Lincoln", "Port Pirie", "Victor Harbor", "Gawler", "Naracoorte", "Renmark"],
      "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "New Norfolk", "Wynyard", "Smithton", "Scottsdale", "Bridport"],
      "Australian Capital Territory": ["Canberra", "Queanbeyan"],
      "Northern Territory": ["Darwin", "Alice Springs", "Palmerston", "Katherine", "Tennant Creek", "Nhulunbuy", "Yulara", "Jabiru", "Maningrida", "Ngukurr"]
    }
  },
  DE: {
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein", "Brandenburg"],
    cities: {
      "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen", "Bayreuth", "Bamberg"],
      "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"],
      "Baden-Württemberg": ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg", "Pforzheim", "Reutlingen", "Ulm", "Heilbronn", "Esslingen"],
      "Lower Saxony": ["Hanover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen", "Salzgitter", "Hildesheim", "Delmenhorst", "Celle"],
      "Hesse": ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel", "Offenbach", "Hanau", "Marburg", "Giessen", "Fulda", "Rüsselsheim"],
      "Saxony": ["Dresden", "Leipzig", "Chemnitz", "Zwickau", "Plauen", "Görlitz", "Freiberg", "Bautzen", "Pirna", "Riesa"],
      "Rhineland-Palatinate": ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern", "Neustadt", "Speyer", "Frankenthal", "Bitburg", "Zweibrücken"],
      "Berlin": ["Berlin"],
      "Schleswig-Holstein": ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt", "Elmshorn", "Pinneberg", "Itzehoe", "Wedel", "Geesthacht"],
      "Brandenburg": ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)", "Oranienburg", "Eberswalde", "Schwedt", "Königs Wusterhausen", "Falkensee", "Bernau"]
    }
  }
};
function getRandomStateAndCityForCountry(countryCode2) {
  const geo = GEO_DATA[countryCode2];
  if (!geo || geo.states.length === 0) {
    const state22 = getRandomStateForCountry(countryCode2) || "N/A";
    const city2 = getRandomCityForCountry(countryCode2) || "N/A";
    return { state: state22, city: city2 };
  }
  const state2 = pickRandom(geo.states);
  const cities = geo.cities[state2];
  const city = cities && cities.length > 0 ? pickRandom(cities) : "N/A";
  return { state: state2, city };
}
const COUNTRY_STATES = {
  US: [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia"
  ],
  GB: [
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "Greater London",
    "West Midlands",
    "Greater Manchester",
    "West Yorkshire",
    "Merseyside",
    "South Yorkshire",
    "Tyne and Wear"
  ],
  CA: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon"
  ],
  AU: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Australian Capital Territory",
    "Northern Territory"
  ],
  DE: [
    "Baden-Württemberg",
    "Bavaria",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hesse",
    "Lower Saxony",
    "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia",
    "Rhineland-Palatinate",
    "Saarland",
    "Saxony",
    "Saxony-Anhalt",
    "Schleswig-Holstein",
    "Thuringia"
  ],
  FR: [
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Île-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur"
  ],
  IN: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi"
  ],
  MX: [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Mexico City",
    "Mexico State",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas"
  ],
  BR: [
    "Acre",
    "Alagoas",
    "Amapá",
    "Amazonas",
    "Bahia",
    "Ceará",
    "Distrito Federal",
    "Espírito Santo",
    "Goiás",
    "Maranhão",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Minas Gerais",
    "Pará",
    "Paraíba",
    "Paraná",
    "Pernambuco",
    "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte",
    "Rio Grande do Sul",
    "Rondônia",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins"
  ],
  NG: [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Federal Capital Territory",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara"
  ]
};
const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" }
];
const FLAG_MAP = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.flag]));
async function lookupBin(bin2) {
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin2}`, {
      headers: { "Accept-Version": "3" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const scheme = (data.scheme ?? "").toUpperCase();
    const rawType = (data.type ?? "").toUpperCase();
    const type = rawType === "PREPAID" ? "PREPAID" : rawType === "CREDIT" ? "CREDIT" : "DEBIT";
    const brand2 = (data.brand ?? scheme) || "UNKNOWN";
    const bank2 = data.bank?.name ?? "";
    const countryCode2 = (data.country?.alpha2 ?? "").toUpperCase();
    const countryName = data.country?.name ?? "";
    return { scheme, type, brand: brand2, bank: bank2, country: countryCode2, countryName };
  } catch {
    return null;
  }
}
function schemeToProvider$1(scheme) {
  const s = scheme.toUpperCase();
  if (s.includes("VISA")) return "VISA";
  if (s.includes("MASTER")) return "MASTERCARD";
  if (s.includes("AMEX") || s.includes("AMERICAN")) return "AMEX";
  if (s.includes("DISCOVER")) return "DISCOVER";
  if (s.includes("UNIONPAY") || s.includes("CUP")) return "UNIONPAY";
  if (s.includes("JCB")) return "JCB";
  if (s.includes("MAESTRO")) return "MAESTRO";
  return scheme || "VISA";
}
function guessBinProvider(bin2) {
  if (!bin2) return "VISA";
  const n = parseInt(bin2.slice(0, 2), 10);
  if (bin2[0] === "4") return "VISA";
  if (n >= 51 && n <= 55 || parseInt(bin2.slice(0, 4), 10) >= 2221 && parseInt(bin2.slice(0, 4), 10) <= 2720)
    return "MASTERCARD";
  if (bin2[0] === "3" && (bin2[1] === "4" || bin2[1] === "7")) return "AMEX";
  if (bin2.startsWith("6011") || bin2.startsWith("65") || parseInt(bin2.slice(0, 4), 10) >= 6440 && parseInt(bin2.slice(0, 4), 10) <= 6599)
    return "DISCOVER";
  if (bin2.startsWith("62")) return "UNIONPAY";
  if (bin2.startsWith("35")) return "JCB";
  return "VISA";
}
function expectedCardLength(provider2) {
  if (provider2 === "AMEX") return 15;
  if (provider2 === "DISCOVER") return 16;
  if (provider2 === "MAESTRO") return 18;
  return 16;
}
function extractBinFromLine(line) {
  const parts = line.split("|");
  if (parts.length > 0 && parts[0].trim().length >= 6) {
    return parts[0].trim().slice(0, 6);
  }
  const digits = line.replace(/\D/g, "");
  return digits.slice(0, 6);
}
function luhnCheckDigit$1(partial) {
  const digits = partial.split("").map(Number).reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - sum % 10) % 10);
}
function generateCardNumber$1(bin2, provider2) {
  const totalLen = provider2 === "AMEX" ? 15 : 16;
  const fillLen = totalLen - bin2.length - 1;
  let middle = "";
  for (let i = 0; i < fillLen; i++) middle += String(Math.floor(Math.random() * 10));
  const partial = bin2 + middle;
  return partial + luhnCheckDigit$1(partial);
}
function generateCvv$1(provider2 = "VISA") {
  const len = provider2 === "AMEX" ? 4 : 3;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}
function generateExpiry$1() {
  const now = /* @__PURE__ */ new Date();
  const yearsAhead = 1 + Math.floor(Math.random() * 5);
  const monthOffset = Math.floor(Math.random() * 12);
  const target = new Date(now.getFullYear() + yearsAhead, now.getMonth() + monthOffset, 1);
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const yy = String(target.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}
const FIRST_NAMES = [
  "JAMES",
  "JOHN",
  "ROBERT",
  "MICHAEL",
  "WILLIAM",
  "DAVID",
  "RICHARD",
  "JOSEPH",
  "THOMAS",
  "CHARLES",
  "CHRISTOPHER",
  "DANIEL",
  "MATTHEW",
  "ANTHONY",
  "MARK",
  "DONALD",
  "STEVEN",
  "PAUL",
  "ANDREW",
  "KENNETH",
  "JENNIFER",
  "PATRICIA",
  "LINDA",
  "BARBARA",
  "ELIZABETH",
  "SUSAN",
  "JESSICA",
  "SARAH",
  "KAREN",
  "LISA",
  "NANCY",
  "BETTY",
  "MARGARET",
  "SANDRA",
  "ASHLEY",
  "EMILY"
];
const LAST_NAMES = [
  "SMITH",
  "JOHNSON",
  "WILLIAMS",
  "BROWN",
  "JONES",
  "GARCIA",
  "MILLER",
  "DAVIS",
  "RODRIGUEZ",
  "MARTINEZ",
  "HERNANDEZ",
  "LOPEZ",
  "GONZALEZ",
  "WILSON",
  "ANDERSON",
  "THOMAS",
  "TAYLOR",
  "MOORE",
  "JACKSON",
  "MARTIN",
  "LEE",
  "PEREZ",
  "THOMPSON",
  "WHITE",
  "HARRIS",
  "SANCHEZ",
  "CLARK"
];
function generateName$1() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
const ADDRESS_DATA = {
  US: {
    streets: [
      "Main St",
      "Oak Ave",
      "Maple Dr",
      "Cedar Ln",
      "Pine Rd",
      "Elm St",
      "Park Blvd",
      "Lake View Dr",
      "Sunset Blvd",
      "Broadway"
    ],
    cities: [
      "Los Angeles",
      "New York",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "Dallas",
      "San Diego",
      "San Jose",
      "Austin",
      "Jacksonville",
      "Fort Worth",
      "Columbus",
      "Charlotte"
    ],
    states: [
      "California",
      "Texas",
      "Florida",
      "New York",
      "Illinois",
      "Pennsylvania",
      "Ohio",
      "Georgia",
      "North Carolina",
      "Michigan"
    ],
    zips: () => String(1e4 + Math.floor(Math.random() * 89999))
  },
  GB: {
    streets: [
      "High Street",
      "Church Road",
      "Station Road",
      "London Road",
      "Park Lane",
      "Victoria Road",
      "King Street",
      "Queen Street",
      "Mill Lane",
      "The Grove"
    ],
    cities: [
      "London",
      "Birmingham",
      "Manchester",
      "Leeds",
      "Glasgow",
      "Liverpool",
      "Bristol",
      "Sheffield",
      "Edinburgh",
      "Cardiff",
      "Leicester",
      "Coventry",
      "Bradford"
    ],
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    zips: () => {
      const letters = "ABCDEFGHIJKLMNOPRSTUW";
      return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(10 + Math.random() * 90)} ${Math.floor(1 + Math.random() * 9)}${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}`;
    }
  },
  CA: {
    streets: [
      "Main St",
      "Yonge St",
      "Bloor St",
      "Queen St",
      "King St",
      "Bay St",
      "Dundas St",
      "College St",
      "Harbourfront",
      "Rideau St"
    ],
    cities: [
      "Toronto",
      "Vancouver",
      "Montreal",
      "Calgary",
      "Edmonton",
      "Ottawa",
      "Winnipeg",
      "Quebec City",
      "Hamilton",
      "Kitchener"
    ],
    states: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba", "Nova Scotia", "Saskatchewan"],
    zips: () => {
      const a = "ABCEGHJKLMNPRSTVXY";
      const d = "0123456789";
      const l = (s) => s[Math.floor(Math.random() * s.length)];
      return `${l(a)}${l(d)}${l(a)} ${l(d)}${l(a)}${l(d)}`;
    }
  },
  AU: {
    streets: [
      "George St",
      "Collins St",
      "Pitt St",
      "Elizabeth St",
      "King St",
      "Queen St",
      "Flinders St",
      "Bourke St",
      "Market St",
      "Castlereagh St"
    ],
    cities: [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Gold Coast",
      "Canberra",
      "Newcastle",
      "Hobart",
      "Darwin"
    ],
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    zips: () => String(1e3 + Math.floor(Math.random() * 8999))
  },
  DE: {
    streets: [
      "Hauptstraße",
      "Schulstraße",
      "Gartenstraße",
      "Bahnhofstraße",
      "Bergstraße",
      "Kirchstraße",
      "Feldstraße",
      "Lindenstraße",
      "Ringstraße",
      "Dorfstraße"
    ],
    cities: [
      "Berlin",
      "Hamburg",
      "Munich",
      "Cologne",
      "Frankfurt",
      "Stuttgart",
      "Düsseldorf",
      "Leipzig",
      "Dresden",
      "Nuremberg"
    ],
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse", "Saxony", "Berlin"],
    zips: () => String(1e4 + Math.floor(Math.random() * 89999))
  },
  FR: {
    streets: [
      "Rue de la Paix",
      "Avenue des Champs",
      "Rue du Faubourg",
      "Boulevard Haussmann",
      "Rue Royale",
      "Avenue Montaigne",
      "Rue de Rivoli",
      "Rue Saint-Honoré"
    ],
    cities: [
      "Paris",
      "Marseille",
      "Lyon",
      "Toulouse",
      "Nice",
      "Nantes",
      "Strasbourg",
      "Montpellier",
      "Bordeaux",
      "Lille"
    ],
    states: [
      "Île-de-France",
      "Provence-Alpes-Côte d'Azur",
      "Auvergne-Rhône-Alpes",
      "Hauts-de-France",
      "Nouvelle-Aquitaine"
    ],
    zips: () => String(1e4 + Math.floor(Math.random() * 89999))
  },
  IN: {
    streets: [
      "MG Road",
      "Nehru Street",
      "Gandhi Nagar",
      "Rajaji Street",
      "Connaught Place",
      "Linking Road",
      "Bandra",
      "Juhu Lane",
      "Sector 15",
      "Civil Lines"
    ],
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan", "West Bengal"],
    zips: () => String(1e5 + Math.floor(Math.random() * 899999))
  },
  NG: {
    streets: [
      "Broad Street",
      "Marina Road",
      "Victoria Island",
      "Lekki Phase",
      "Allen Avenue",
      "Awolowo Road",
      "Ikorodu Road",
      "Oshodi Express"
    ],
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Kaduna"],
    states: ["Lagos", "Abuja FCT", "Kano", "Oyo", "Rivers", "Edo", "Enugu", "Delta"],
    zips: () => String(1e5 + Math.floor(Math.random() * 899999))
  }
};
const STREET_NUMS = () => String(1 + Math.floor(Math.random() * 9999));
function generateAddress$1(country2) {
  const data = ADDRESS_DATA[country2];
  const pick2 = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (!data) {
    const geo = GEO_DATA[country2];
    if (geo && geo.states.length > 0) {
      const state2 = pick2(geo.states);
      const cities2 = geo.cities[state2];
      const city = cities2 && cities2.length > 0 ? pick2(cities2) : "N/A";
      const zip22 = country2 === "US" ? String(1e4 + Math.floor(Math.random() * 89999)) : String(1e3 + Math.floor(Math.random() * 8999));
      return {
        street: `${STREET_NUMS()} Main Street`,
        city,
        state: state2,
        zip: zip22
      };
    }
    const cities = COUNTRY_CITIES[country2];
    const states = COUNTRY_STATES[country2];
    const zip2 = country2 === "US" ? String(1e4 + Math.floor(Math.random() * 89999)) : String(1e3 + Math.floor(Math.random() * 8999));
    return {
      street: `${STREET_NUMS()} Main Street`,
      city: cities ? pick2(cities) : "N/A",
      state: states ? pick2(states) : "N/A",
      zip: zip2
    };
  }
  return {
    street: `${STREET_NUMS()} ${pick2(data.streets)}`,
    city: pick2(data.cities),
    state: pick2(data.states),
    zip: data.zips()
  };
}
function isExpiryValid(expiry) {
  const m = expiry.match(/^(\d{1,2})\/(\d{2})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year = 2e3 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = /* @__PURE__ */ new Date();
  const exp = new Date(year, month - 1, 1);
  const cur = new Date(now.getFullYear(), now.getMonth(), 1);
  return exp > cur;
}
function generateBatch$1(bin2, info2, qty, defaults) {
  const seen = /* @__PURE__ */ new Set();
  const cards = [];
  let attempts = 0;
  const MAX_ATTEMPTS = qty * 20;
  while (cards.length < qty && attempts < MAX_ATTEMPTS) {
    attempts++;
    const cardNumber2 = generateCardNumber$1(bin2, info2.provider);
    if (seen.has(cardNumber2)) continue;
    seen.add(cardNumber2);
    const addr = generateAddress$1(info2.country);
    const cardBank = info2.bank || getRandomBankForCountry(info2.country);
    const { state: cardState, city: cardCity } = getRandomStateAndCityForCountry(info2.country);
    cards.push({
      id: crypto.randomUUID(),
      bin: bin2,
      provider: info2.provider,
      type: info2.type,
      bank: cardBank,
      country: info2.country,
      countryFlag: info2.countryFlag,
      cardNumber: cardNumber2,
      cvv: generateCvv$1(info2.provider),
      expiry: generateExpiry$1(),
      fullName: generateName$1(),
      street: addr.street,
      city: cardCity,
      state: cardState,
      zip: addr.zip,
      priceUsd: defaults.priceUsd,
      limitUsd: defaults.limitUsd,
      isValid: defaults.isValid
    });
  }
  return cards;
}
const EMPTY_FORM = {
  bin: "",
  provider: "VISA",
  type: "DEBIT",
  expiry: "",
  name: "",
  country: "US",
  countryFlag: "🇺🇸",
  street: "",
  city: "",
  state: "",
  zip: "",
  extras: "",
  bank: "",
  priceUsd: "",
  limitUsd: "",
  stock: "1",
  cardNumber: "",
  cvv: "",
  fullName: "",
  color: "#3b82f6",
  isValid: false
};
function ConfirmModal({ title: title2, desc: desc2, variant, confirmLabel, onCancel, onConfirm }) {
  const confirmCls = {
    danger: styles$8.modalConfirmDanger,
    warning: styles$8.modalConfirmWarning,
    success: styles$8.modalConfirmSuccess,
    info: styles$8.modalConfirmInfo
  }[variant];
  return /* @__PURE__ */ jsx("div", { className: styles$8.modalOverlay, onClick: onCancel, children: /* @__PURE__ */ jsxs("div", { className: styles$8.modalCard, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsx("div", { className: styles$8.modalTitle, children: title2 }),
    /* @__PURE__ */ jsx("div", { className: styles$8.modalDesc, children: desc2 }),
    /* @__PURE__ */ jsxs("div", { className: styles$8.modalActions, children: [
      /* @__PURE__ */ jsx("button", { className: styles$8.modalCancel, onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { className: `${styles$8.modalConfirm} ${confirmCls}`, onClick: onConfirm, children: confirmLabel })
    ] })
  ] }) });
}
function AssetManagement() {
  const [products, setProducts] = useState([]);
  const [stockDraft, setStockDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form2, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [bulkModal, setBulkModal] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast2, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (text, ok) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };
  const [binStatus2, setBinStatus] = useState("idle");
  const [binInfo, setBinInfo] = useState(null);
  const [binAutoFilled, setBinAutoFilled] = useState(false);
  const binTimerRef = useRef(null);
  const lastLookedUpBin = useRef("");
  const [cvvGenerated, setCvvGenerated] = useState(false);
  const [expiryGenerated, setExpiryGenerated] = useState(false);
  const [nameGenerated, setNameGenerated] = useState(false);
  const [cardNumError, setCardNumError] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkValid, setBulkValid] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMsg, setBulkMsg] = useState(null);
  const [bulkBinStatus, setBulkBinStatus] = useState(null);
  const [globalPrice, setGlobalPrice] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [useRandomPrice, setUseRandomPrice] = useState(false);
  const [globalLimit, setGlobalLimit] = useState("");
  const [limitMin, setLimitMin] = useState("");
  const [limitMax, setLimitMax] = useState("");
  const [useRandomLimit, setUseRandomLimit] = useState(false);
  const [useRandomType, setUseRandomType] = useState(false);
  const [useRandomStock, setUseRandomStock] = useState(false);
  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");
  const [useRandomExpiry, setUseRandomExpiry] = useState(false);
  const [useRandomBank, setUseRandomBank] = useState(false);
  const [useRandomCountry, setUseRandomCountry] = useState(false);
  const [useRandomAddressFlag, setUseRandomAddressFlag] = useState(false);
  const [genManualMode, setGenManualMode] = useState(false);
  const [genBin, setGenBin] = useState("");
  const [genQty, setGenQty] = useState(10);
  const [genPrice, setGenPrice] = useState("");
  const [genLimit, setGenLimit] = useState("");
  const [genIsValid, setGenIsValid] = useState(false);
  const [genCards, setGenCards] = useState([]);
  const [genBinStatus, setGenBinStatus] = useState("idle");
  const [genBinInfo, setGenBinInfo] = useState(null);
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [genMsg, setGenMsg] = useState(null);
  const genBinTimer = useRef(null);
  const lastGenBin = useRef("");
  const availableStates = COUNTRY_STATES[form2.country] ?? [];
  const availableBanks = BANKS_BY_COUNTRY[form2.country] ?? [];
  const availableCities = COUNTRY_CITIES[form2.country] ?? [];
  const triggerGenBinLookup = useCallback((bin2) => {
    if (genBinTimer.current) clearTimeout(genBinTimer.current);
    if (bin2.length < 6) {
      setGenBinStatus("idle");
      setGenBinInfo(null);
      if (bin2.length >= 1) {
        const g = guessBinProvider(bin2);
        setGenBinInfo((prev) => prev ? { ...prev, scheme: g, brand: g } : null);
      }
      return;
    }
    if (bin2.length === 6) {
      if (lastGenBin.current === bin2) return;
      setGenBinStatus("loading");
      genBinTimer.current = setTimeout(async () => {
        const info2 = await lookupBin(bin2);
        lastGenBin.current = bin2;
        if (info2) {
          setGenBinInfo(info2);
          setGenBinStatus("ok");
        } else {
          const provider2 = guessBinProvider(bin2);
          setGenBinInfo({ scheme: provider2, brand: provider2, type: "DEBIT", bank: "", country: "", countryName: "" });
          setGenBinStatus("error");
        }
      }, 500);
    }
  }, []);
  const handleGenBinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setGenBin(val);
    setGenCards([]);
    setGenMsg(null);
    triggerGenBinLookup(val);
  };
  const handleGenerate = useCallback(() => {
    if (!genPrice) {
      setGenMsg({ type: "err", text: "Enter a price per card before generating." });
      return;
    }
    if (genManualMode) {
      const randomCountry = pickRandom(COUNTRIES);
      const randomBank = getRandomBankForCountry(randomCountry.code);
      const { state: randomState, city: randomCity } = getRandomStateAndCityForCountry(randomCountry.code);
      const batch2 = Array.from({ length: genQty }).map(() => ({
        id: crypto.randomUUID(),
        bin: genBin || "",
        provider: "VISA",
        type: "DEBIT",
        bank: randomBank,
        country: randomCountry.code,
        countryFlag: randomCountry.flag,
        cardNumber: "",
        cvv: "",
        expiry: "",
        fullName: "",
        street: "",
        city: randomCity,
        state: randomState,
        zip: "",
        priceUsd: genPrice,
        limitUsd: genLimit,
        isValid: genIsValid
      }));
      setGenCards((prev) => [...prev, ...batch2]);
      setGenMsg(null);
      return;
    }
    if (genBin.length !== 6) {
      setGenMsg({ type: "err", text: "Enter a valid 6-digit BIN first." });
      return;
    }
    const provider2 = genBinInfo ? schemeToProvider$1(genBinInfo.scheme || genBinInfo.brand) : guessBinProvider(genBin);
    const type = genBinInfo?.type || "DEBIT";
    const country2 = genBinInfo?.country || pickRandom(COUNTRIES).code;
    const countryFlag = FLAG_MAP[country2] || "";
    const bank2 = genBinInfo?.bank || getRandomBankForCountry(country2);
    const batch = generateBatch$1(genBin, { provider: provider2, type, bank: bank2, country: country2, countryFlag }, genQty, {
      priceUsd: genPrice,
      limitUsd: genLimit,
      isValid: genIsValid
    });
    setGenCards(batch);
    setGenMsg(null);
  }, [genBin, genBinInfo, genQty, genPrice, genLimit, genIsValid, genManualMode]);
  const updateGenCard = (id, key, value2) => {
    setGenCards((prev) => prev.map((c) => c.id === id ? { ...c, [key]: value2 } : c));
  };
  const removeGenCard = (id) => setGenCards((prev) => prev.filter((c) => c.id !== id));
  const regenCard = (id) => {
    setGenCards(
      (prev) => prev.map((c) => {
        if (c.id !== id) return c;
        const newNum = generateCardNumber$1(c.bin, c.provider);
        const addr = generateAddress$1(c.country);
        const { state: cardState, city: cardCity } = getRandomStateAndCityForCountry(c.country);
        const cardBank = c.bank || getRandomBankForCountry(c.country);
        return {
          ...c,
          cardNumber: newNum,
          cvv: generateCvv$1(c.provider),
          expiry: generateExpiry$1(),
          fullName: generateName$1(),
          street: addr.street,
          city: cardCity,
          state: cardState,
          zip: addr.zip,
          bank: cardBank
        };
      })
    );
  };
  const handleGenSubmit = async () => {
    if (genCards.length === 0) {
      setGenMsg({ type: "err", text: "No cards to submit." });
      return;
    }
    if (!genPrice) {
      setGenMsg({ type: "err", text: "Price is required." });
      return;
    }
    setGenSubmitting(true);
    setGenMsg(null);
    const lines = genCards.map((c) => {
      const finalPrice = c.priceUsd || genPrice || "0";
      console.log(`[handleGenSubmit] Card ${c.id}: priceUsd=${c.priceUsd}, genPrice=${genPrice}, final=${finalPrice}`);
      return [
        c.cardNumber,
        c.expiry,
        c.cvv,
        c.fullName,
        c.bank,
        c.country,
        c.state,
        c.city,
        c.zip,
        c.limitUsd || "0",
        finalPrice,
        c.type,
        c.street
      ].join("|");
    }).join("\n");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid: genIsValid })
      });
      const data = await res.json();
      if (!res.ok) {
        setGenMsg({ type: "err", text: data.error ?? "Submit failed." });
        return;
      }
      const created = data.created ?? 0;
      const errCount = data.errors?.length ?? 0;
      setGenMsg({
        type: "ok",
        text: `${created} card(s) added to inventory.${errCount ? ` ${errCount} skipped.` : ""}`
      });
      setGenCards([]);
      fetchProducts();
    } catch {
      setGenMsg({ type: "err", text: "Network error." });
    } finally {
      setGenSubmitting(false);
    }
  };
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      const list2 = data.products ?? [];
      setProducts(list2);
      const next = {};
      for (const p of list2) next[p.id] = String(p.stock);
      setStockDraft(next);
    } catch {
      setError("Could not load product inventory.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const field = (key, value2) => setForm((prev) => ({ ...prev, [key]: value2 }));
  const triggerBinLookup = useCallback((bin2) => {
    if (binTimerRef.current) clearTimeout(binTimerRef.current);
    if (bin2.length < 6) {
      setBinStatus("idle");
      setBinInfo(null);
      setBinAutoFilled(false);
      if (bin2.length >= 1) {
        const guessed = guessBinProvider(bin2);
        setForm((prev) => ({ ...prev, provider: guessed }));
      }
      return;
    }
    if (bin2.length === 6) {
      const guessed = guessBinProvider(bin2);
      setForm((prev) => ({ ...prev, provider: guessed }));
      if (lastLookedUpBin.current === bin2) return;
      setBinStatus("loading");
      binTimerRef.current = setTimeout(async () => {
        const info2 = await lookupBin(bin2);
        lastLookedUpBin.current = bin2;
        if (info2) {
          setBinInfo(info2);
          setBinStatus("ok");
          setBinAutoFilled(true);
          const provider2 = schemeToProvider$1(info2.scheme || info2.brand);
          const countryCode2 = info2.country || "";
          const countryFlag = FLAG_MAP[countryCode2] ?? "";
          const newBank = info2.bank || (countryCode2 ? getRandomBankForCountry(countryCode2) : "");
          setForm((prev) => {
            const countryChanged = countryCode2 !== "" && countryCode2 !== prev.country;
            return {
              ...prev,
              provider: provider2,
              type: info2.type || prev.type,
              bank: newBank || prev.bank,
              country: countryCode2 || prev.country,
              countryFlag: countryFlag || prev.countryFlag,
              // Reset state and city if country changed
              state: countryChanged ? "" : prev.state,
              city: countryChanged ? "" : prev.city
            };
          });
        } else {
          setBinStatus("error");
          setBinInfo(null);
          setBinAutoFilled(false);
        }
      }, 500);
    }
  }, []);
  const handleBinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    field("bin", val);
    triggerBinLookup(val);
  };
  const handleAutoGenerate = useCallback(() => {
    const newCvv = generateCvv$1(form2.provider);
    const newExpiry = generateExpiry$1();
    const newName = generateName$1();
    const randomCountry = getRandomCountry();
    const randomBank = getRandomBankForCountry(randomCountry.code);
    const { state: randomState, city: randomCity } = getRandomStateAndCityForCountry(randomCountry.code);
    setForm((prev) => ({
      ...prev,
      cvv: newCvv,
      expiry: newExpiry,
      fullName: prev.fullName || newName,
      country: randomCountry.code,
      countryFlag: randomCountry.flag,
      bank: randomBank,
      state: randomState,
      city: randomCity
    }));
    setCvvGenerated(true);
    setExpiryGenerated(true);
    setNameGenerated(true);
  }, [form2.provider]);
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    field("cardNumber", val);
    if (val.length === 0) {
      setCardNumError("");
      return;
    }
    const expected = expectedCardLength(form2.provider);
    if (val.length !== expected) {
      setCardNumError(`${form2.provider} cards require ${expected} digits (got ${val.length})`);
    } else {
      setCardNumError("");
      setForm((prev) => {
        const newCvv = prev.cvv ? prev.cvv : generateCvv$1(prev.provider);
        const newExpiry = prev.expiry ? prev.expiry : generateExpiry$1();
        const didCvv = !prev.cvv;
        const didExpiry = !prev.expiry;
        if (didCvv) setCvvGenerated(true);
        if (didExpiry) setExpiryGenerated(true);
        return { ...prev, cvv: newCvv, expiry: newExpiry };
      });
    }
  };
  const handleCountryChange = (e) => {
    const code = e.target.value;
    const flag = FLAG_MAP[code] ?? "";
    setForm((prev) => ({
      ...prev,
      country: code,
      countryFlag: flag,
      state: "",
      city: "",
      bank: ""
      // Reset bank when country changes
    }));
  };
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!form2.bin || !form2.provider || !form2.priceUsd || !form2.expiry) {
      setSubmitMsg({ type: "err", text: "BIN, Provider, Expiry, and Price are required." });
      return;
    }
    if (!isExpiryValid(form2.expiry)) {
      setSubmitMsg({ type: "err", text: "Expiry must be a future date in MM/YY format." });
      return;
    }
    if (form2.cvv && !/^\d{3,4}$/.test(form2.cvv)) {
      setSubmitMsg({ type: "err", text: "CVV must be 3 or 4 digits." });
      return;
    }
    if (cardNumError) {
      setSubmitMsg({ type: "err", text: cardNumError });
      return;
    }
    const stockNum = Math.max(0, Math.floor(parseInt(form2.stock, 10) || 0));
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          product: {
            bin: form2.bin,
            provider: form2.provider,
            type: form2.type,
            expiry: form2.expiry,
            name: form2.name || `${form2.provider}Card`,
            country: form2.country,
            countryFlag: form2.countryFlag,
            street: form2.street,
            city: form2.city,
            state: form2.state,
            zip: form2.zip,
            extras: form2.extras || null,
            bank: form2.bank,
            priceUsdCents: Math.round(parseFloat(form2.priceUsd) * 100),
            limitUsd: parseFloat(form2.limitUsd) || 0,
            validUntil: form2.expiry,
            stock: stockNum,
            isValid: form2.isValid,
            color: form2.color,
            cardNumber: form2.cardNumber || void 0,
            cvv: form2.cvv || void 0,
            fullName: form2.fullName || void 0
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg({ type: "err", text: data.error ?? "Failed to add card." });
        return;
      }
      setSubmitMsg({ type: "ok", text: `Card added successfully! Product ID: ${data.productId}` });
      setForm(EMPTY_FORM);
      setBinInfo(null);
      setBinStatus("idle");
      setBinAutoFilled(false);
      lastLookedUpBin.current = "";
      setCardNumError("");
      setCvvGenerated(false);
      setExpiryGenerated(false);
      setNameGenerated(false);
      fetchProducts();
    } catch {
      setSubmitMsg({ type: "err", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdateStock = async (productId) => {
    const raw = stockDraft[productId] ?? "0";
    const n = Math.max(0, Math.floor(parseInt(raw, 10)));
    if (Number.isNaN(n)) {
      setError("Stock must be a non-negative integer.");
      return;
    }
    setBusyId(productId);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_stock", productId, stock: n })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update stock.");
        return;
      }
      await fetchProducts();
    } catch {
      setError("Network error updating stock.");
    } finally {
      setBusyId(null);
    }
  };
  const handleBulkFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(String(reader.result ?? ""));
    reader.readAsText(f);
    e.target.value = "";
  };
  function enrichBulkText(raw) {
    return raw.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      const parts = trimmed.split("|");
      if (parts.length < 2) return line;
      const expiryRaw = (parts[1] ?? "").trim();
      const cvvRaw = (parts[2] ?? "").trim();
      const isMissingExpiry = !expiryRaw || /^x+$/i.test(expiryRaw) || !isExpiryValid(expiryRaw);
      const isMissingCvv = !cvvRaw || /^x+$/i.test(cvvRaw) || !/^\d{3,4}$/.test(cvvRaw);
      if (isMissingExpiry) parts[1] = generateExpiry$1();
      if (isMissingCvv) parts[2] = generateCvv$1();
      return parts.join("|");
    }).join("\n");
  }
  useEffect(() => {
    if (!bulkText.trim()) {
      setBulkBinStatus(null);
      return;
    }
    const lines = bulkText.trim().split("\n").filter((l) => l.trim());
    const total = lines.length;
    const parsed = lines.filter((l) => extractBinFromLine(l).length === 6).length;
    setBulkBinStatus({ total, parsed });
  }, [bulkText]);
  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setBulkMsg({ type: "err", text: "Paste card lines or upload a .txt file." });
      return;
    }
    setBulkSubmitting(true);
    setBulkMsg(null);
    try {
      const enrichedText = enrichBulkText(bulkText);
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_import_products",
          text: enrichedText,
          isValid: bulkValid,
          pricing: { globalPrice, priceMin, priceMax, useRandomPrice, globalLimit, limitMin, limitMax, useRandomLimit, useRandomType, useRandomStock, stockMin, stockMax, useRandomExpiry, useRandomBank, useRandomCountry, useRandomAddressFlag }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkMsg({ type: "err", text: data.error ?? "Bulk import failed." });
        return;
      }
      const errCount = data.errors?.length ?? 0;
      const created = data.created ?? 0;
      const errs = Array.isArray(data.errors) ? data.errors : [];
      const errPreview = errs.length > 0 ? ` Failures: ${errs.slice(0, 3).map((e2) => `line ${e2.line}: ${e2.message}`).join(" · ")}${errs.length > 3 ? " …" : ""}` : "";
      setBulkMsg({
        type: errCount && created === 0 ? "err" : "ok",
        text: `Imported ${created} card(s).${errCount ? ` ${errCount} line(s) skipped.${errPreview}` : ""}`
      });
      if (errs.length) console.warn("[bulk import errors]", errs);
      setBulkText("");
      setBulkBinStatus(null);
      fetchProducts();
    } catch {
      setBulkMsg({ type: "err", text: "Network error." });
    } finally {
      setBulkSubmitting(false);
    }
  };
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure?")) return;
    setBusyId(productId);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", productId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete product.");
        return;
      }
      await fetchProducts();
    } catch {
      setError("Network error deleting product.");
    } finally {
      setBusyId(null);
    }
  };
  const BULK_CONFIGS = {
    bulk_delete_all: {
      title: "Delete All Cards?",
      desc: "All active inventory will be soft-deleted. No data is permanently lost — use Recover Deleted to undo.",
      variant: "danger",
      confirmLabel: "Delete All",
      toast: "✓ All cards deleted (recoverable)"
    },
    bulk_mark_sold_out: {
      title: "Mark All as Sold Out?",
      desc: "Sets stock = 0 and status = sold_out for every active card in inventory.",
      variant: "warning",
      confirmLabel: "Mark Sold Out",
      toast: "✓ All cards marked as sold out"
    },
    bulk_restore_all: {
      title: "Restore All Cards?",
      desc: "Resets stock = 1 and status = in_stock for every active (non-deleted) card.",
      variant: "success",
      confirmLabel: "Restore All",
      toast: "✓ All cards restored to in stock"
    },
    bulk_recover_deleted: {
      title: "Recover Deleted Cards?",
      desc: "Restores all previously soft-deleted cards back into active inventory.",
      variant: "info",
      confirmLabel: "Recover All",
      toast: "✓ Deleted cards recovered successfully"
    }
  };
  const openBulkModal = (action2) => {
    const cfg = BULK_CONFIGS[action2];
    if (!cfg) return;
    setBulkModal({ action: action2, title: cfg.title, desc: cfg.desc, variant: cfg.variant, confirmLabel: cfg.confirmLabel });
  };
  const executeBulkAction = async () => {
    if (!bulkModal) return;
    const { action: action2 } = bulkModal;
    const toastText = BULK_CONFIGS[action2]?.toast ?? "Done";
    setBulkModal(null);
    setBulkBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action2 })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.error ?? "Bulk action failed.";
        setError(errMsg);
        showToast(`✗ ${errMsg}`, false);
      } else {
        const n = data.affected ?? 0;
        showToast(`${toastText}${n ? ` (${n})` : ""}`, true);
        await fetchProducts();
      }
    } catch (e) {
      const msg2 = e instanceof Error ? e.message : "Network error";
      setError(msg2);
      showToast(`✗ ${msg2}`, false);
    } finally {
      setBulkBusy(false);
    }
  };
  const binBadge2 = () => {
    if (binStatus2 === "loading")
      return /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "loading", children: [
        /* @__PURE__ */ jsx(Loader2, { size: 11, className: styles$8.spinIcon }),
        " Looking up BIN…"
      ] });
    if (binStatus2 === "ok" && binInfo)
      return /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "ok", children: [
        /* @__PURE__ */ jsx(CheckCircle, { size: 11 }),
        " ",
        binInfo.scheme || binInfo.brand,
        " · ",
        binInfo.countryName || binInfo.country,
        " ·",
        " ",
        binInfo.bank || "—"
      ] });
    if (binStatus2 === "error")
      return /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "error", children: [
        /* @__PURE__ */ jsx(AlertCircle, { size: 11 }),
        " BIN not found — manual entry enabled"
      ] });
    return null;
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$8.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$8.formCard, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$8.title, children: "Add New Card Asset" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleAddCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$8.sectionLabel, children: "BIN & Auto-fill" }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.grid, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "BIN (6 digits) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                inputMode: "numeric",
                maxLength: 6,
                placeholder: "e.g. 547383",
                value: form2.bin,
                onChange: handleBinChange
              }
            ),
            binBadge2()
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Provider *",
              binAutoFilled && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "auto" })
            ] }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: styles$8.input,
                value: form2.provider,
                onChange: (e) => field("provider", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { children: "VISA" }),
                  /* @__PURE__ */ jsx("option", { children: "MASTERCARD" }),
                  /* @__PURE__ */ jsx("option", { children: "AMEX" }),
                  /* @__PURE__ */ jsx("option", { children: "DISCOVER" }),
                  /* @__PURE__ */ jsx("option", { children: "UNIONPAY" }),
                  /* @__PURE__ */ jsx("option", { children: "JCB" }),
                  /* @__PURE__ */ jsx("option", { children: "MAESTRO" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Type",
              binAutoFilled && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "auto" })
            ] }),
            /* @__PURE__ */ jsxs("select", { className: styles$8.input, value: form2.type, onChange: (e) => field("type", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { children: "DEBIT" }),
              /* @__PURE__ */ jsx("option", { children: "CREDIT" }),
              /* @__PURE__ */ jsx("option", { children: "PREPAID" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Bank",
              binAutoFilled && form2.bank && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "auto" })
            ] }),
            availableBanks.length > 0 ? /* @__PURE__ */ jsxs("select", { className: styles$8.input, value: form2.bank, onChange: (e) => field("bank", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "— Select bank —" }),
              availableBanks.map((b) => /* @__PURE__ */ jsx("option", { value: b, children: b }, b))
            ] }) : /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "Chase",
                value: form2.bank,
                onChange: (e) => field("bank", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.sectionLabel, children: [
          "Card Details",
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: styles$8.autoGenBtn,
              onClick: handleAutoGenerate,
              title: "Auto-generate CVV, expiry, and cardholder name (never from BIN)",
              children: [
                /* @__PURE__ */ jsx(Wand2, { size: 11, style: { display: "inline", marginRight: "4px" } }),
                "Auto Generate Details"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.grid, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Full Card Number" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                inputMode: "numeric",
                placeholder: "4111111111111111",
                value: form2.cardNumber,
                onChange: handleCardNumberChange,
                maxLength: 19,
                style: { borderColor: cardNumError ? "rgba(239,68,68,0.6)" : void 0 }
              }
            ),
            cardNumError && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }, children: cardNumError })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "CVV ",
              form2.provider === "AMEX" ? "(4 digits)" : "(3 digits)",
              cvvGenerated && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "generated" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                inputMode: "numeric",
                maxLength: 4,
                placeholder: form2.provider === "AMEX" ? "1234" : "123",
                value: form2.cvv,
                onChange: (e) => {
                  field("cvv", e.target.value.replace(/\D/g, ""));
                  setCvvGenerated(false);
                },
                style: { borderColor: form2.cvv && !/^\d{3,4}$/.test(form2.cvv) ? "rgba(239,68,68,0.6)" : void 0 }
              }
            ),
            form2.cvv && !/^\d{3,4}$/.test(form2.cvv) && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }, children: "CVV must be 3–4 digits" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Expiry (MM/YY) *",
              expiryGenerated && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "generated" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "12/28",
                value: form2.expiry,
                onChange: (e) => {
                  field("expiry", e.target.value);
                  setExpiryGenerated(false);
                },
                style: { borderColor: form2.expiry && !isExpiryValid(form2.expiry) ? "rgba(239,68,68,0.6)" : void 0 }
              }
            ),
            form2.expiry && !isExpiryValid(form2.expiry) && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }, children: "Must be a future date (MM/YY)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Cardholder Name",
              nameGenerated && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "generated" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "JOHN DOE",
                value: form2.fullName,
                onChange: (e) => {
                  field("fullName", e.target.value);
                  setNameGenerated(false);
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.sectionLabel, children: [
          "Billing Address",
          binAutoFilled && form2.country && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "country auto-detected" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: styles$8.autoGenBtn,
              onClick: () => {
                const addr = generateAddress$1(form2.country);
                setForm((prev) => ({
                  ...prev,
                  street: addr.street,
                  city: addr.city,
                  state: addr.state || prev.state,
                  zip: addr.zip
                }));
              },
              title: "Generate a random address for the detected country",
              children: [
                /* @__PURE__ */ jsx(Wand2, { size: 11, style: { display: "inline", marginRight: "4px" } }),
                "Generate Address"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.grid, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
              "Country",
              binAutoFilled && /* @__PURE__ */ jsx("span", { className: styles$8.autoTag, children: "auto" })
            ] }),
            /* @__PURE__ */ jsx("select", { className: styles$8.input, value: form2.country, onChange: handleCountryChange, children: COUNTRIES.map((c) => /* @__PURE__ */ jsxs("option", { value: c.code, children: [
              c.flag,
              " ",
              c.name,
              " (",
              c.code,
              ")"
            ] }, c.code)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "State / Region" }),
            availableStates.length > 0 ? /* @__PURE__ */ jsxs("select", { className: styles$8.input, value: form2.state, onChange: (e) => field("state", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "— Select state —" }),
              availableStates.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
            ] }) : /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "State / Province",
                value: form2.state,
                onChange: (e) => field("state", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Street Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "123 Main St",
                value: form2.street,
                onChange: (e) => field("street", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "City" }),
            availableCities.length > 0 ? /* @__PURE__ */ jsxs("select", { className: styles$8.input, value: form2.city, onChange: (e) => field("city", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "— Select city —" }),
              availableCities.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
            ] }) : /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "Los Angeles",
                value: form2.city,
                onChange: (e) => field("city", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "ZIP / Postal" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "text",
                placeholder: "90001",
                value: form2.zip,
                onChange: (e) => field("zip", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$8.sectionLabel, children: "Pricing & Stock" }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.grid, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Price (USD) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "number",
                min: "0.01",
                step: "0.01",
                placeholder: "36.00",
                value: form2.priceUsd,
                onChange: (e) => field("priceUsd", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Stock (qty) *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "number",
                min: "0",
                step: "1",
                placeholder: "1",
                value: form2.stock,
                onChange: (e) => field("stock", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, children: [
            /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Limit (USD)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "number",
                min: "0",
                placeholder: "500",
                value: form2.limitUsd,
                onChange: (e) => field("limitUsd", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: styles$8.fieldGroup, style: { display: "flex", alignItems: "flex-end" }, children: /* @__PURE__ */ jsxs("label", { className: styles$8.label, style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form2.isValid, onChange: (e) => field("isValid", e.target.checked) }),
            "Show in 100% Valid section"
          ] }) })
        ] }),
        submitMsg && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              fontSize: "0.8rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              marginTop: "0.5rem",
              background: submitMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              color: submitMsg.type === "ok" ? "#4ade80" : "#ef4444"
            },
            children: submitMsg.text
          }
        ),
        /* @__PURE__ */ jsxs("button", { type: "submit", className: styles$8.submitBtn, disabled: submitting, children: [
          /* @__PURE__ */ jsx(Plus, { size: 14, style: { display: "inline", marginRight: "4px" } }),
          submitting ? "Adding…" : "Add Card"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$8.formCard, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("h2", { className: styles$8.title, style: { marginBottom: 0 }, children: "Smart Batch Card Generator" }),
        /* @__PURE__ */ jsxs("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer", color: "#e2e8f0" }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: genManualMode,
              onChange: (e) => setGenManualMode(e.target.checked),
              style: { cursor: "pointer" }
            }
          ),
          "Manual Mode"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "#888", marginBottom: "1rem", lineHeight: 1.5 }, children: "Enter a BIN to auto-detect provider/bank/country, choose quantity, then generate realistic test cards with unique numbers, random CVV, future expiry, names, and addresses. All data is synthetic — never real." }),
      /* @__PURE__ */ jsxs("div", { className: styles$8.genControls, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, style: { flex: "0 0 140px" }, children: [
          /* @__PURE__ */ jsxs("label", { className: styles$8.label, children: [
            "BIN (6 digits) ",
            !genManualMode && "*"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$8.input,
              type: "text",
              inputMode: "numeric",
              maxLength: 6,
              placeholder: "547383",
              value: genBin,
              onChange: handleGenBinChange
            }
          ),
          genBinStatus === "loading" && /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "loading", children: [
            /* @__PURE__ */ jsx(Loader2, { size: 11, className: styles$8.spinIcon }),
            " Looking up…"
          ] }),
          genBinStatus === "ok" && genBinInfo && /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "ok", children: [
            /* @__PURE__ */ jsx(CheckCircle, { size: 11 }),
            " ",
            genBinInfo.scheme || genBinInfo.brand,
            genBinInfo.country ? ` · ${genBinInfo.country}` : "",
            genBinInfo.bank ? ` · ${genBinInfo.bank}` : ""
          ] }),
          genBinStatus === "error" && /* @__PURE__ */ jsxs("span", { className: styles$8.binBadge, "data-status": "error", children: [
            /* @__PURE__ */ jsx(AlertCircle, { size: 11 }),
            " Manual mode"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, style: { flex: "0 0 220px" }, children: [
          /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Quantity" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" }, children: [
            [10, 25, 50, 100].map((n) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `${styles$8.qtyBtn} ${genQty === n ? styles$8.qtyBtnActive : ""}`,
                onClick: () => setGenQty(n),
                children: n
              },
              n
            )),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "number",
                min: 1,
                max: 500,
                style: { width: "60px", padding: "0.3rem 0.5rem", fontSize: "0.75rem" },
                value: genQty,
                onChange: (e) => setGenQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, style: { flex: "0 0 110px" }, children: [
          /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Price (USD) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$8.input,
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "36.00",
              value: genPrice,
              onChange: (e) => setGenPrice(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.fieldGroup, style: { flex: "0 0 110px" }, children: [
          /* @__PURE__ */ jsx("label", { className: styles$8.label, children: "Limit (USD)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$8.input,
              type: "number",
              min: "0",
              placeholder: "500",
              value: genLimit,
              onChange: (e) => setGenLimit(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$8.fieldGroup, style: { justifyContent: "flex-end" }, children: /* @__PURE__ */ jsxs("label", { className: styles$8.label, style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: genIsValid, onChange: (e) => setGenIsValid(e.target.checked) }),
          "100% Valid section"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: styles$8.genBtn,
            onClick: handleGenerate,
            disabled: !genManualMode && genBin.length !== 6 || !genPrice,
            children: [
              /* @__PURE__ */ jsx(Wand2, { size: 14, style: { display: "inline", marginRight: "6px" } }),
              "Generate ",
              genQty,
              " Card",
              genQty !== 1 ? "s" : ""
            ]
          }
        ),
        genCards.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("button", { type: "button", className: styles$8.submitBtn, onClick: handleGenSubmit, disabled: genSubmitting, children: [
            /* @__PURE__ */ jsx(Plus, { size: 13, style: { display: "inline", marginRight: "5px" } }),
            genSubmitting ? "Submitting…" : `Submit all ${genCards.length} to Inventory`
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setGenCards([]),
              style: {
                fontSize: "0.72rem",
                color: "#888",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline"
              },
              children: "Clear"
            }
          )
        ] })
      ] }),
      genMsg && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            fontSize: "0.8rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            marginBottom: "0.75rem",
            background: genMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            color: genMsg.type === "ok" ? "#4ade80" : "#ef4444"
          },
          children: genMsg.text
        }
      ),
      genCards.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$8.tableWrap, style: { overflowX: "auto" }, children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              fontSize: "0.7rem",
              color: "#666",
              padding: "0.4rem 1rem",
              borderBottom: "1px solid var(--color-border)"
            },
            children: [
              genCards.length,
              " card",
              genCards.length !== 1 ? "s" : "",
              " generated — all data is synthetic test data only"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("table", { className: styles$8.table, style: { minWidth: "900px", width: "100%" }, children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "#" }),
            /* @__PURE__ */ jsx("th", { children: "Card Number" }),
            /* @__PURE__ */ jsx("th", { children: "Provider" }),
            /* @__PURE__ */ jsx("th", { children: "Type" }),
            /* @__PURE__ */ jsx("th", { children: "CVV" }),
            /* @__PURE__ */ jsx("th", { children: "Expiry" }),
            /* @__PURE__ */ jsx("th", { children: "Name" }),
            /* @__PURE__ */ jsx("th", { children: "Country" }),
            /* @__PURE__ */ jsx("th", { children: "State" }),
            /* @__PURE__ */ jsx("th", { children: "City" }),
            /* @__PURE__ */ jsx("th", { children: "ZIP" }),
            /* @__PURE__ */ jsx("th", { children: "Price" }),
            /* @__PURE__ */ jsx("th", { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: genCards.map((c, idx) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { style: { color: "#666", fontSize: "0.7rem" }, children: idx + 1 }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.cardNumber,
                onChange: (e) => updateGenCard(c.id, "cardNumber", e.target.value.replace(/\D/g, "")),
                maxLength: 19,
                style: { width: "160px", fontFamily: "ui-monospace, monospace", fontSize: "0.72rem" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
              "select",
              {
                className: styles$8.genCellInput,
                value: c.provider,
                onChange: (e) => updateGenCard(c.id, "provider", e.target.value),
                style: { width: "110px" },
                children: [
                  /* @__PURE__ */ jsx("option", { children: "VISA" }),
                  /* @__PURE__ */ jsx("option", { children: "MASTERCARD" }),
                  /* @__PURE__ */ jsx("option", { children: "AMEX" }),
                  /* @__PURE__ */ jsx("option", { children: "DISCOVER" }),
                  /* @__PURE__ */ jsx("option", { children: "UNIONPAY" }),
                  /* @__PURE__ */ jsx("option", { children: "JCB" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
              "select",
              {
                className: styles$8.genCellInput,
                value: c.type,
                onChange: (e) => updateGenCard(c.id, "type", e.target.value),
                style: { width: "90px" },
                children: [
                  /* @__PURE__ */ jsx("option", { children: "DEBIT" }),
                  /* @__PURE__ */ jsx("option", { children: "CREDIT" }),
                  /* @__PURE__ */ jsx("option", { children: "PREPAID" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.cvv,
                onChange: (e) => updateGenCard(c.id, "cvv", e.target.value.replace(/\D/g, "")),
                maxLength: 4,
                style: { width: "50px", fontFamily: "ui-monospace, monospace" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.expiry,
                onChange: (e) => updateGenCard(c.id, "expiry", e.target.value),
                placeholder: "MM/YY",
                maxLength: 5,
                style: { width: "60px", fontFamily: "ui-monospace, monospace" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.fullName,
                onChange: (e) => updateGenCard(c.id, "fullName", e.target.value),
                style: { width: "130px" }
              }
            ) }),
            /* @__PURE__ */ jsxs("td", { style: { fontSize: "0.72rem" }, children: [
              c.countryFlag,
              " ",
              c.country
            ] }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.state,
                onChange: (e) => updateGenCard(c.id, "state", e.target.value),
                style: { width: "100px" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.city,
                onChange: (e) => updateGenCard(c.id, "city", e.target.value),
                style: { width: "100px" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                value: c.zip,
                onChange: (e) => updateGenCard(c.id, "zip", e.target.value),
                style: { width: "70px" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.genCellInput,
                type: "number",
                value: c.priceUsd,
                onChange: (e) => updateGenCard(c.id, "priceUsd", e.target.value),
                style: { width: "60px" }
              }
            ) }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "5px" }, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  title: "Re-generate this row",
                  onClick: () => regenCard(c.id),
                  style: {
                    fontSize: "0.65rem",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    border: "1px solid rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.12)",
                    color: "#a5b4fc",
                    cursor: "pointer"
                  },
                  children: /* @__PURE__ */ jsx(RefreshCw, { size: 10 })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  title: "Remove row",
                  onClick: () => removeGenCard(c.id),
                  style: {
                    fontSize: "0.65rem",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#f87171",
                    cursor: "pointer"
                  },
                  children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
                }
              )
            ] }) })
          ] }, c.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$8.formCard, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$8.title, children: "Bulk Upload Cards" }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.75rem", color: "#888", marginBottom: "0.75rem", lineHeight: 1.5 }, children: [
        "Paste one card per line or load a ",
        /* @__PURE__ */ jsx("strong", { children: ".txt" }),
        " file. Pipe-separated fields (12):",
        " ",
        /* @__PURE__ */ jsx("code", { style: { fontSize: "0.68rem", wordBreak: "break-all" }, children: "card_number|expiry|cvv|name|bank|country|state|city|zip|limit|price|type" }),
        /* @__PURE__ */ jsx("br", {}),
        "Optional (13): add ",
        /* @__PURE__ */ jsx("strong", { children: "street" }),
        " after zip —",
        " ",
        /* @__PURE__ */ jsx("code", { style: { fontSize: "0.68rem" }, children: "…|zip|street|limit|price|type" }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { style: { color: "#6366f1" }, children: "BIN is auto-extracted from card number for each line." })
      ] }),
      bulkBinStatus && /* @__PURE__ */ jsxs("div", { className: styles$8.bulkBinInfo, children: [
        /* @__PURE__ */ jsx(CheckCircle, { size: 12, style: { color: "#4ade80" } }),
        bulkBinStatus.total,
        " line(s) detected · ",
        bulkBinStatus.parsed,
        " BIN(s) parseable"
      ] }),
      /* @__PURE__ */ jsx("div", { style: { marginBottom: "0.6rem" }, children: /* @__PURE__ */ jsxs(
        "label",
        {
          style: {
            fontSize: "0.75rem",
            color: "#aaa",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          },
          children: [
            /* @__PURE__ */ jsx(Upload, { size: 14 }),
            /* @__PURE__ */ jsx("span", { children: "Load from file" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".txt,text/plain",
                onChange: handleBulkFile,
                style: { fontSize: "0.7rem", maxWidth: "200px" }
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleBulkImport, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }, children: "Set Price For All" }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
              !useRandomPrice ? /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Price", value: globalPrice, onChange: (e) => setGlobalPrice(e.target.value), className: styles$8.input, style: { width: "80px", padding: "4px 8px" } }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Min", value: priceMin, onChange: (e) => setPriceMin(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } }),
                /* @__PURE__ */ jsx("span", { style: { color: "#888" }, children: "-" }),
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Max", value: priceMax, onChange: (e) => setPriceMax(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } })
              ] }),
              /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }, children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomPrice, onChange: (e) => setUseRandomPrice(e.target.checked) }),
                "Random Price"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: "1px", background: "rgba(255,255,255,0.1)" } }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }, children: "Set Limit For All" }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
              !useRandomLimit ? /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Limit", value: globalLimit, onChange: (e) => setGlobalLimit(e.target.value), className: styles$8.input, style: { width: "80px", padding: "4px 8px" } }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Min", value: limitMin, onChange: (e) => setLimitMin(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } }),
                /* @__PURE__ */ jsx("span", { style: { color: "#888" }, children: "-" }),
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Max", value: limitMax, onChange: (e) => setLimitMax(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } })
              ] }),
              /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }, children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomLimit, onChange: (e) => setUseRandomLimit(e.target.checked) }),
                "Random Limit"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: "1px", background: "rgba(255,255,255,0.1)" } }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }, children: [
            /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomType, onChange: (e) => setUseRandomType(e.target.checked) }),
              "Random Card Type (Debit/Credit)"
            ] }),
            /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomExpiry, onChange: (e) => setUseRandomExpiry(e.target.checked) }),
              "Random Expiry Date"
            ] }),
            /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomBank, onChange: (e) => setUseRandomBank(e.target.checked) }),
              "Random Bank Assign"
            ] }),
            /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomCountry, onChange: (e) => setUseRandomCountry(e.target.checked) }),
              "Random Country + State"
            ] }),
            /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomAddressFlag, onChange: (e) => setUseRandomAddressFlag(e.target.checked) }),
              "Random Address Flag (YES/NO)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: "1px", background: "rgba(255,255,255,0.1)" } }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }, children: "Random Stock" }),
            /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: !useRandomStock ? /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomStock, onChange: (e) => setUseRandomStock(e.target.checked) }),
              "Enable"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Min", value: stockMin, onChange: (e) => setStockMin(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } }),
              /* @__PURE__ */ jsx("span", { style: { color: "#888" }, children: "-" }),
              /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Max", value: stockMax, onChange: (e) => setStockMax(e.target.value), className: styles$8.input, style: { width: "70px", padding: "4px 8px" } }),
              /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }, children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: useRandomStock, onChange: (e) => setUseRandomStock(e.target.checked) }),
                "Enable"
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: styles$8.input,
            rows: 12,
            style: {
              width: "100%",
              minHeight: "180px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              lineHeight: 1.4
            },
            placeholder: "4111111111111111|12/28|123|JOHN DOE|Chase|US|California|Los Angeles|90001|500|36.00|DEBIT\n5555555555554444|11/27|456|MIKE SMITH|Bank of America|US|Texas|Houston|77001|1000|50.00|CREDIT",
            value: bulkText,
            onChange: (e) => setBulkText(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.65rem", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs("label", { style: { display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: bulkValid, onChange: (e) => setBulkValid(e.target.checked) }),
            "Show in 100% Valid section"
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: styles$8.submitBtn, disabled: bulkSubmitting, children: bulkSubmitting ? "Importing…" : "Import all lines" })
        ] }),
        bulkMsg && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              fontSize: "0.8rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              marginTop: "0.65rem",
              background: bulkMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              color: bulkMsg.type === "ok" ? "#4ade80" : "#ef4444"
            },
            children: bulkMsg.text
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" },
          children: [
            /* @__PURE__ */ jsx("h2", { className: styles$8.inventoryTitle, children: "Current Inventory" }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs("div", { className: styles$8.bulkActions, children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: `${styles$8.bulkBtn} ${styles$8.bulkBtnDanger}`,
                    disabled: bulkBusy || loading,
                    onClick: () => openBulkModal("bulk_delete_all"),
                    title: "Soft-delete all active cards",
                    children: [
                      /* @__PURE__ */ jsx(ShieldOff, { size: 11 }),
                      " Delete All"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: `${styles$8.bulkBtn} ${styles$8.bulkBtnWarning}`,
                    disabled: bulkBusy || loading,
                    onClick: () => openBulkModal("bulk_mark_sold_out"),
                    title: "Mark all cards as sold out",
                    children: [
                      /* @__PURE__ */ jsx(MinusCircle, { size: 11 }),
                      " Mark Sold Out"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: `${styles$8.bulkBtn} ${styles$8.bulkBtnSuccess}`,
                    disabled: bulkBusy || loading,
                    onClick: () => openBulkModal("bulk_restore_all"),
                    title: "Restore all active cards to in stock",
                    children: [
                      /* @__PURE__ */ jsx(RotateCcw, { size: 11 }),
                      " Restore All"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: `${styles$8.bulkBtn} ${styles$8.bulkBtnInfo}`,
                    disabled: bulkBusy || loading,
                    onClick: () => openBulkModal("bulk_recover_deleted"),
                    title: "Recover previously soft-deleted cards",
                    children: [
                      /* @__PURE__ */ jsx(Undo2, { size: 11 }),
                      " Recover Deleted"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: fetchProducts,
                  disabled: loading || bulkBusy,
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ccc",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsx(RefreshCw, { size: 11, style: { animation: loading ? "spin 1s linear infinite" : "none" } }),
                    " Refresh"
                  ]
                }
              )
            ] })
          ]
        }
      ),
      error && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }, children: error }),
      /* @__PURE__ */ jsx("div", { className: styles$8.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$8.table, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "Provider / BIN" }),
          /* @__PURE__ */ jsx("th", { children: "Type" }),
          /* @__PURE__ */ jsx("th", { children: "Bank" }),
          /* @__PURE__ */ jsx("th", { children: "Country" }),
          /* @__PURE__ */ jsx("th", { children: "Expiry" }),
          /* @__PURE__ */ jsx("th", { children: "Limit" }),
          /* @__PURE__ */ jsx("th", { children: "Price" }),
          /* @__PURE__ */ jsx("th", { children: "Stock" }),
          /* @__PURE__ */ jsx("th", { children: "Status" }),
          /* @__PURE__ */ jsx("th", { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: loading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 10, style: { textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }, children: "Loading inventory…" }) }) : products.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 10, style: { textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }, children: "No products in inventory. Add one above." }) }) : products.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { children: [
            /* @__PURE__ */ jsx("strong", { children: p.provider }),
            " ",
            /* @__PURE__ */ jsx("span", { style: { color: "#888", fontSize: "0.7rem" }, children: p.bin })
          ] }),
          /* @__PURE__ */ jsx("td", { children: p.type }),
          /* @__PURE__ */ jsx("td", { children: p.bank }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$8.countryCode, children: String(p.country ?? "").trim().toUpperCase() }) }),
          /* @__PURE__ */ jsx("td", { children: p.expiry }),
          /* @__PURE__ */ jsxs("td", { children: [
            "$",
            p.limitUsd
          ] }),
          /* @__PURE__ */ jsxs("td", { children: [
            "$",
            (p.priceUsdCents / 100).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxs("td", { children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$8.input,
                type: "number",
                min: 0,
                step: 1,
                style: { width: "4.5rem", padding: "0.25rem 0.4rem", fontSize: "0.75rem" },
                value: stockDraft[p.id] ?? String(p.stock),
                onChange: (e) => setStockDraft((prev) => ({ ...prev, [p.id]: e.target.value })),
                disabled: busyId === p.id
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleUpdateStock(p.id),
                disabled: busyId === p.id,
                style: {
                  marginLeft: "6px",
                  fontSize: "0.65rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  cursor: "pointer"
                },
                children: "Update"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
                background: p.status === "in_stock" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                color: p.status === "in_stock" ? "#4ade80" : "#f87171"
              },
              children: p.status === "in_stock" ? "in_stock" : "sold_out"
            }
          ) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleDelete(p.id),
              disabled: busyId === p.id,
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.65rem",
                padding: "0.25rem 0.55rem",
                borderRadius: "4px",
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                color: "#f87171",
                cursor: "pointer"
              },
              children: [
                /* @__PURE__ */ jsx(Trash2, { size: 11 }),
                " Delete"
              ]
            }
          ) })
        ] }, p.id)) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.72rem", color: "#666", marginTop: "0.5rem", textAlign: "right" }, children: [
        products.filter((p) => p.status === "in_stock").length,
        " in stock ·",
        " ",
        products.filter((p) => p.status === "sold_out").length,
        " sold out"
      ] })
    ] }),
    bulkModal && /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        title: bulkModal.title,
        desc: bulkModal.desc,
        variant: bulkModal.variant,
        confirmLabel: bulkModal.confirmLabel,
        onCancel: () => setBulkModal(null),
        onConfirm: executeBulkAction
      }
    ),
    toast2 && /* @__PURE__ */ jsxs("div", { className: `${styles$8.toast} ${toast2.ok ? styles$8.toastOk : styles$8.toastErr}`, children: [
      toast2.ok ? /* @__PURE__ */ jsx(CheckCircle, { size: 14, style: { color: "#4ade80", flexShrink: 0 } }) : /* @__PURE__ */ jsx(AlertCircle, { size: 14, style: { color: "#f87171", flexShrink: 0 } }),
      toast2.text
    ] })
  ] });
}
const wrap$4 = "_wrap_1nxnp_1";
const statsGrid = "_statsGrid_1nxnp_7";
const statCard$1 = "_statCard_1nxnp_13";
const statIcon = "_statIcon_1nxnp_29";
const statValue$1 = "_statValue_1nxnp_39";
const statLabel$1 = "_statLabel_1nxnp_48";
const chartCard = "_chartCard_1nxnp_53";
const chartTitle = "_chartTitle_1nxnp_60";
const styles$7 = {
  wrap: wrap$4,
  statsGrid,
  statCard: statCard$1,
  statIcon,
  statValue: statValue$1,
  statLabel: statLabel$1,
  chartCard,
  chartTitle
};
function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { credentials: "include" });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      if (res.status === 401) {
        setError("Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? `Error ${res.status}: ${data.error}` : `Analytics load failed (HTTP ${res.status}). Check server console.`
        );
        return;
      }
      setStats(data);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);
  const cards = stats ? [
    {
      icon: /* @__PURE__ */ jsx(DollarSign, { size: 20 }),
      color: "rgba(34,197,94,0.15)",
      textColor: "#22c55e",
      value: `$${stats.totalRevenue}`,
      label: "Total Earnings"
    },
    {
      icon: /* @__PURE__ */ jsx(Users, { size: 20 }),
      color: "rgba(59,130,246,0.15)",
      textColor: "#3b82f6",
      value: stats.totalUsers.toString(),
      label: "Registered Users"
    },
    {
      icon: /* @__PURE__ */ jsx(ShoppingBag, { size: 20 }),
      color: "rgba(249,115,22,0.15)",
      textColor: "#f97316",
      value: stats.productsSold.toString(),
      label: "Cards Sold"
    },
    {
      icon: /* @__PURE__ */ jsx(TrendingUp, { size: 20 }),
      color: "rgba(168,85,247,0.15)",
      textColor: "#a855f7",
      value: `$${stats.totalDeposited}`,
      label: "Volume Processed"
    }
  ] : null;
  return /* @__PURE__ */ jsxs("div", { className: styles$7.wrap, children: [
    /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }, children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: fetchStats,
        disabled: loading,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#ccc",
          padding: "0.35rem 0.85rem",
          borderRadius: "9999px",
          fontSize: "0.72rem",
          fontWeight: 600,
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ jsx(RefreshCw, { size: 12, style: { animation: loading ? "spin 1s linear infinite" : "none" } }),
          "Refresh"
        ]
      }
    ) }),
    error && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }, children: error }),
    /* @__PURE__ */ jsx("div", { className: styles$7.statsGrid, children: loading ? [1, 2, 3, 4].map((k) => /* @__PURE__ */ jsxs("div", { className: styles$7.statCard, style: { opacity: 0.4, pointerEvents: "none" }, children: [
      /* @__PURE__ */ jsx("div", { className: styles$7.statIcon, style: { background: "rgba(255,255,255,0.05)", color: "#666" }, children: /* @__PURE__ */ jsx(DollarSign, { size: 20 }) }),
      /* @__PURE__ */ jsx("div", { className: styles$7.statValue, style: { color: "#555" }, children: "—" }),
      /* @__PURE__ */ jsx("div", { className: styles$7.statLabel, children: "Loading…" })
    ] }, k)) : cards?.map((s) => /* @__PURE__ */ jsxs("div", { className: styles$7.statCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$7.statIcon, style: { background: s.color, color: s.textColor }, children: s.icon }),
      /* @__PURE__ */ jsx("div", { className: styles$7.statValue, style: { color: s.textColor }, children: s.value }),
      /* @__PURE__ */ jsx("div", { className: styles$7.statLabel, children: s.label })
    ] }, s.label)) }),
    stats && /* @__PURE__ */ jsxs("div", { className: styles$7.chartCard, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$7.chartTitle, children: "Order Summary" }),
      /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", padding: "0.5rem 0" }, children: [
        { label: "Total Orders", val: stats.totalOrders },
        { label: "Completed", val: stats.completedOrders },
        { label: "Cards Available", val: stats.productsAvailable }
      ].map(({ label: label2, val }) => /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "1.6rem", fontWeight: 800, color: "#fff" }, children: val }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.72rem", color: "#888", marginTop: "4px" }, children: label2 })
      ] }, label2)) })
    ] })
  ] });
}
const wrap$3 = "_wrap_15ols_1";
const toolbar$2 = "_toolbar_15ols_7";
const searchInput$1 = "_searchInput_15ols_15";
const exportBtn = "_exportBtn_15ols_32";
const tableWrap$3 = "_tableWrap_15ols_49";
const table$2 = "_table_15ols_49";
const amount = "_amount_15ols_88";
const statusDelivered = "_statusDelivered_15ols_104";
const styles$6 = {
  wrap: wrap$3,
  toolbar: toolbar$2,
  searchInput: searchInput$1,
  exportBtn,
  tableWrap: tableWrap$3,
  table: table$2,
  amount,
  statusDelivered
};
const PAGE_SIZE$2 = 20;
function SkeletonRow$2({ cols }) {
  return /* @__PURE__ */ jsx("tr", { children: Array.from({ length: cols }).map((_, i) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", { style: {
    height: "12px",
    borderRadius: "6px",
    background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    width: i === 0 ? "70%" : i === 2 ? "50%" : "85%"
  } }) }, i)) });
}
function TransactionLedger() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page2, setPage] = useState(0);
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=orders&limit=200", { credentials: "include" });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      if (res.status === 401) {
        setError("Session expired — please log in again.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}: ${typeof data.error === "string" ? data.error : "Failed to load orders. Check server console."}`);
        return;
      }
      setOrders(data.orders ?? []);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);
  const filtered = useMemo(
    () => orders.filter(
      (o) => o.userEmail.toLowerCase().includes(search.toLowerCase()) || o.productName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    ),
    [orders, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE$2));
  const safePage = Math.min(page2, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE$2, (safePage + 1) * PAGE_SIZE$2);
  const exportCsv = () => {
    const rows = [
      ["Order ID", "User Email", "Product", "Amount (USD)", "Status", "Date"],
      ...filtered.map((o) => [
        o.id,
        o.userEmail,
        o.productName,
        o.amountUsd,
        o.status,
        new Date(o.createdAt).toLocaleString()
      ])
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url2 = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url2;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url2);
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$6.wrap, children: [
    /* @__PURE__ */ jsx("style", { children: `@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}` }),
    /* @__PURE__ */ jsxs("div", { className: styles$6.toolbar, children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsx(Search, { size: 13, style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" } }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$6.searchInput,
            type: "text",
            placeholder: "Search by email, product or order ID…",
            value: search,
            onChange: (e) => {
              setSearch(e.target.value);
              setPage(0);
            },
            style: { paddingLeft: "30px" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => void fetchOrders(),
          disabled: loading,
          style: { display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.72rem", cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { size: 12, style: { animation: loading ? "spin 1s linear infinite" : "none" } }),
            "Refresh"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("button", { className: styles$6.exportBtn, onClick: exportCsv, disabled: filtered.length === 0, children: [
        /* @__PURE__ */ jsx(Download, { size: 14 }),
        " Export CSV"
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginBottom: "0.75rem" }, children: error }),
    /* @__PURE__ */ jsx("div", { className: styles$6.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$6.table, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Order ID" }),
        /* @__PURE__ */ jsx("th", { children: "User Email" }),
        /* @__PURE__ */ jsx("th", { children: "Product" }),
        /* @__PURE__ */ jsx("th", { children: "Date" }),
        /* @__PURE__ */ jsx("th", { children: "Amount (USD)" }),
        /* @__PURE__ */ jsx("th", { children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonRow$2, { cols: 6 }, i)) : pageRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, style: { textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }, children: search ? "No orders match your search." : "No orders yet." }) }) : pageRows.map((o) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { style: { fontFamily: "monospace", fontSize: "0.72rem", color: "#999" }, children: o.id }),
        /* @__PURE__ */ jsx("td", { children: o.userEmail }),
        /* @__PURE__ */ jsx("td", { children: o.productName }),
        /* @__PURE__ */ jsx("td", { children: new Date(o.createdAt).toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("span", { className: styles$6.amount, children: [
          "$",
          o.amountUsd
        ] }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
          "span",
          {
            className: o.status === "completed" ? styles$6.statusDelivered : void 0,
            style: { textTransform: "capitalize" },
            children: o.status
          }
        ) })
      ] }, o.id)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.72rem", color: "#666" }, children: loading ? "Loading…" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} · page ${safePage + 1}/${totalPages}` }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.35rem" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage === 0 || loading,
            onClick: () => setPage((p) => Math.max(0, p - 1)),
            style: { display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage === 0 ? 0.35 : 1 },
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }),
              " Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage >= totalPages - 1 || loading,
            onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
            style: { display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage >= totalPages - 1 ? 0.35 : 1 },
            children: [
              "Next ",
              /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
            ]
          }
        )
      ] })
    ] })
  ] });
}
const tableWrap$2 = "_tableWrap_le84x_5";
const styles$5 = {
  tableWrap: tableWrap$2
};
const PAGE_SIZE$1 = 25;
function SkeletonRow$1({ cols }) {
  return /* @__PURE__ */ jsx("tr", { children: Array.from({ length: cols }).map((_, i) => /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem" }, children: /* @__PURE__ */ jsx("div", { style: {
    height: "12px",
    borderRadius: "6px",
    background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    width: i === 0 ? "60%" : i === 2 ? "75%" : "85%"
  } }) }, i)) });
}
function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page2, setPage] = useState(0);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=users", { credentials: "include" });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      if (res.status === 401) {
        setError("Session expired — please log in to the admin panel again.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}: ${typeof data.error === "string" ? data.error : "Failed to load users. Check server console."}`);
        return;
      }
      setUsers(data.users ?? []);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);
  const filtered = useMemo(
    () => users.filter(
      (u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE$1));
  const safePage = Math.min(page2, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE$1, (safePage + 1) * PAGE_SIZE$1);
  const regularCount = useMemo(() => users.filter((u) => u.role === "user").length, [users]);
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    /* @__PURE__ */ jsx("style", { children: `@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}` }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative", flex: 1 }, children: [
        /* @__PURE__ */ jsx(Search, { size: 13, style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" } }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search by email, name, or User ID…",
            value: search,
            onChange: (e) => {
              setSearch(e.target.value);
              setPage(0);
            },
            style: {
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 30px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
              outline: "none"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => void fetchUsers(),
          disabled: loading,
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#ccc",
            padding: "0.5rem 0.9rem",
            borderRadius: "8px",
            fontSize: "0.75rem",
            cursor: "pointer",
            flexShrink: 0
          },
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { size: 12, style: { animation: loading ? "spin 1s linear infinite" : "none" } }),
            "Refresh"
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px" }, children: error }),
    /* @__PURE__ */ jsx("div", { className: styles$5.tableWrap, style: { overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { style: { background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }, children: ["User ID", "Name", "Email", "Role", "Wallet (USD)", "Total Deposited", "Joined"].map((h) => /* @__PURE__ */ jsx("th", { style: { padding: "0.65rem 0.85rem", textAlign: "left", color: "#888", fontWeight: 600, whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonRow$1, { cols: 7 }, i)) : pageRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, style: { textAlign: "center", color: "#888", padding: "2.5rem", fontSize: "0.82rem" }, children: search ? "No users match your search." : "No users registered yet." }) }) : pageRows.map((u) => /* @__PURE__ */ jsxs(
        "tr",
        {
          style: { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" },
          onMouseEnter: (e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)",
          onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
          children: [
            /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem", fontFamily: "monospace", color: "#a78bfa", fontSize: "0.78rem" }, children: u.id }),
            /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem", color: "#e2e8f0" }, children: u.name }),
            /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem", color: "#94a3b8" }, children: u.email }),
            /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem" }, children: /* @__PURE__ */ jsx("span", { style: {
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "9999px",
              background: u.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(34,197,94,0.1)",
              color: u.role === "admin" ? "#a855f7" : "#4ade80"
            }, children: u.role.toUpperCase() }) }),
            /* @__PURE__ */ jsxs("td", { style: { padding: "0.65rem 0.85rem", color: "#4ade80", fontWeight: 700 }, children: [
              "$",
              u.walletDisplay
            ] }),
            /* @__PURE__ */ jsxs("td", { style: { padding: "0.65rem 0.85rem", color: "#94a3b8" }, children: [
              "$",
              u.totalDepositedDisplay
            ] }),
            /* @__PURE__ */ jsx("td", { style: { padding: "0.65rem 0.85rem", color: "#64748b", fontSize: "0.75rem" }, children: new Date(u.createdAt).toLocaleDateString() })
          ]
        },
        u.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.72rem", color: "#555" }, children: loading ? "Loading…" : `${filtered.length} of ${users.length} user${users.length !== 1 ? "s" : ""} · ${regularCount} regular · page ${safePage + 1}/${totalPages}` }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.35rem" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage === 0 || loading,
            onClick: () => setPage((p) => Math.max(0, p - 1)),
            style: { display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage === 0 ? 0.35 : 1 },
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }),
              " Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage >= totalPages - 1 || loading,
            onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
            style: { display: "inline-flex", alignItems: "center", gap: "3px", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage >= totalPages - 1 ? 0.35 : 1 },
            children: [
              "Next ",
              /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
            ]
          }
        )
      ] })
    ] })
  ] });
}
const wrap$2 = "_wrap_ofu6p_3";
const hero = "_hero_ofu6p_14";
const heroIcon = "_heroIcon_ofu6p_25";
const heroText = "_heroText_ofu6p_38";
const panel$1 = "_panel_ofu6p_72";
const panelTitle = "_panelTitle_ofu6p_79";
const titleBadge = "_titleBadge_ofu6p_90";
const panelSubtitle = "_panelSubtitle_ofu6p_102";
const binInfoCard = "_binInfoCard_ofu6p_110";
const binProviderLogo = "_binProviderLogo_ofu6p_127";
const binDetails = "_binDetails_ofu6p_132";
const binScheme = "_binScheme_ofu6p_136";
const binMeta = "_binMeta_ofu6p_145";
const binMetaChip = "_binMetaChip_ofu6p_151";
const typeChip = "_typeChip_ofu6p_161";
const controls = "_controls_ofu6p_168";
const fieldGroup$1 = "_fieldGroup_ofu6p_177";
const label$1 = "_label_ofu6p_183";
const input$1 = "_input_ofu6p_191";
const qtyGroup = "_qtyGroup_ofu6p_211";
const qtyBtn = "_qtyBtn_ofu6p_217";
const qtyBtnActive = "_qtyBtnActive_ofu6p_236";
const qtyCustom = "_qtyCustom_ofu6p_243";
const actionBar = "_actionBar_ofu6p_250";
const genBtn = "_genBtn_ofu6p_258";
const submitBtn = "_submitBtn_ofu6p_286";
const clearBtn = "_clearBtn_ofu6p_312";
const msg$1 = "_msg_ofu6p_326";
const msgOk$1 = "_msgOk_ofu6p_335";
const msgErr$1 = "_msgErr_ofu6p_341";
const cardsGrid = "_cardsGrid_ofu6p_348";
const cardPreview = "_cardPreview_ofu6p_356";
const cardCircles = "_cardCircles_ofu6p_381";
const cardTopRow = "_cardTopRow_ofu6p_392";
const cardIndex = "_cardIndex_ofu6p_399";
const cardProviderLogo = "_cardProviderLogo_ofu6p_409";
const providerIcon = "_providerIcon_ofu6p_420";
const cardNumber = "_cardNumber_ofu6p_424";
const cardMidRow = "_cardMidRow_ofu6p_434";
const cardField = "_cardField_ofu6p_441";
const cardFieldLabel = "_cardFieldLabel_ofu6p_447";
const cardFieldValue = "_cardFieldValue_ofu6p_455";
const cardName = "_cardName_ofu6p_462";
const cardAddress = "_cardAddress_ofu6p_472";
const cardStatusRow = "_cardStatusRow_ofu6p_479";
const cardStatusBadge = "_cardStatusBadge_ofu6p_486";
const badgeInStock = "_badgeInStock_ofu6p_495";
const badgeSold = "_badgeSold_ofu6p_501";
const cardActions = "_cardActions_ofu6p_507";
const iconBtn = "_iconBtn_ofu6p_512";
const iconBtnBlue = "_iconBtnBlue_ofu6p_527";
const iconBtnPurple = "_iconBtnPurple_ofu6p_535";
const iconBtnRed = "_iconBtnRed_ofu6p_543";
const editOverlay = "_editOverlay_ofu6p_552";
const editTitle = "_editTitle_ofu6p_567";
const editGrid = "_editGrid_ofu6p_576";
const editInput = "_editInput_ofu6p_582";
const editFieldLabel = "_editFieldLabel_ofu6p_600";
const editDoneBtn = "_editDoneBtn_ofu6p_609";
const bulkArea = "_bulkArea_ofu6p_626";
const bulkParsed = "_bulkParsed_ofu6p_648";
const bulkLine = "_bulkLine_ofu6p_655";
const bulkLineQty = "_bulkLineQty_ofu6p_669";
const statsBar$1 = "_statsBar_ofu6p_675";
const statItem = "_statItem_ofu6p_686";
const statValue = "_statValue_ofu6p_692";
const statLabel = "_statLabel_ofu6p_699";
const spinIcon = "_spinIcon_ofu6p_708";
const toggleLabel = "_toggleLabel_ofu6p_786";
const binStatus = "_binStatus_ofu6p_819";
const binStatusOk = "_binStatusOk_ofu6p_836";
const styles$4 = {
  wrap: wrap$2,
  hero,
  heroIcon,
  heroText,
  panel: panel$1,
  panelTitle,
  titleBadge,
  panelSubtitle,
  binInfoCard,
  binProviderLogo,
  binDetails,
  binScheme,
  binMeta,
  binMetaChip,
  typeChip,
  controls,
  fieldGroup: fieldGroup$1,
  label: label$1,
  input: input$1,
  qtyGroup,
  qtyBtn,
  qtyBtnActive,
  qtyCustom,
  actionBar,
  genBtn,
  submitBtn,
  clearBtn,
  msg: msg$1,
  msgOk: msgOk$1,
  msgErr: msgErr$1,
  cardsGrid,
  cardPreview,
  cardCircles,
  cardTopRow,
  cardIndex,
  cardProviderLogo,
  providerIcon,
  cardNumber,
  cardMidRow,
  cardField,
  cardFieldLabel,
  cardFieldValue,
  cardName,
  cardAddress,
  cardStatusRow,
  cardStatusBadge,
  badgeInStock,
  badgeSold,
  cardActions,
  iconBtn,
  iconBtnBlue,
  iconBtnPurple,
  iconBtnRed,
  editOverlay,
  editTitle,
  editGrid,
  editInput,
  editFieldLabel,
  editDoneBtn,
  bulkArea,
  bulkParsed,
  bulkLine,
  bulkLineQty,
  statsBar: statsBar$1,
  statItem,
  statValue,
  statLabel,
  spinIcon,
  toggleLabel,
  binStatus,
  binStatusOk
};
const PROVIDER_ICON = {
  VISA: "💳",
  MASTERCARD: "🔴",
  AMEX: "🟦",
  DISCOVER: "🟠",
  UNIONPAY: "🇨🇳",
  JCB: "🇯🇵",
  MAESTRO: "🎵",
  CARD: "💳"
};
const COUNTRY_FLAGS = {
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  NL: "🇳🇱",
  BE: "🇧🇪",
  CH: "🇨🇭",
  SE: "🇸🇪",
  NO: "🇳🇴",
  DK: "🇩🇰",
  FI: "🇫🇮",
  PL: "🇵🇱",
  PT: "🇵🇹",
  IN: "🇮🇳",
  JP: "🇯🇵",
  KR: "🇰🇷",
  SG: "🇸🇬",
  HK: "🇭🇰",
  AE: "🇦🇪",
  SA: "🇸🇦",
  BR: "🇧🇷",
  MX: "🇲🇽",
  AR: "🇦🇷",
  ZA: "🇿🇦",
  NG: "🇳🇬",
  RU: "🇷🇺",
  CN: "🇨🇳",
  TR: "🇹🇷",
  IL: "🇮🇱",
  NZ: "🇳🇿",
  MY: "🇲🇾",
  PH: "🇵🇭",
  TH: "🇹🇭",
  ID: "🇮🇩",
  PK: "🇵🇰",
  EG: "🇪🇬",
  CO: "🇨🇴",
  CL: "🇨🇱",
  UA: "🇺🇦",
  GH: "🇬🇭",
  KE: "🇰🇪"
};
const BIN_COUNTRY_3 = {
  // VISA 4xx
  "400": "US",
  "401": "US",
  "402": "CA",
  "403": "GB",
  "404": "AE",
  "405": "AE",
  "406": "SA",
  "407": "TR",
  "408": "AU",
  "409": "ZA",
  "410": "US",
  "411": "US",
  "412": "US",
  "413": "US",
  "414": "US",
  "415": "US",
  "416": "US",
  "417": "US",
  "418": "US",
  "419": "US",
  "420": "GB",
  "421": "GB",
  "422": "GB",
  "423": "FR",
  "424": "FR",
  "425": "DE",
  "426": "DE",
  "427": "NL",
  "428": "BE",
  "429": "CH",
  "430": "CA",
  "431": "CA",
  "432": "CA",
  "433": "CA",
  "434": "CA",
  "435": "CA",
  "436": "CA",
  "437": "CA",
  "438": "CA",
  "439": "CA",
  "440": "AU",
  "441": "AU",
  "442": "AU",
  "443": "NZ",
  "444": "SG",
  "445": "MY",
  "446": "PH",
  "447": "TH",
  "448": "ID",
  "449": "IN",
  "450": "US",
  "451": "US",
  "452": "US",
  "453": "US",
  "454": "US",
  "455": "US",
  "456": "US",
  "457": "US",
  "458": "US",
  "459": "US",
  "460": "CN",
  "461": "CN",
  "462": "JP",
  "463": "KR",
  "464": "HK",
  "465": "SG",
  "466": "TW",
  "467": "IN",
  "468": "PK",
  "469": "BR",
  "470": "MX",
  "471": "AR",
  "472": "CO",
  "473": "CL",
  "474": "BR",
  "475": "US",
  "476": "US",
  "477": "US",
  "478": "US",
  "479": "US",
  "480": "DE",
  "481": "FR",
  "482": "IT",
  "483": "ES",
  "484": "PT",
  "485": "SE",
  "486": "NO",
  "487": "DK",
  "488": "FI",
  "489": "PL",
  "490": "US",
  "491": "US",
  "492": "US",
  "493": "US",
  "494": "US",
  "495": "US",
  "496": "US",
  "497": "US",
  "498": "US",
  "499": "US",
  // MASTERCARD 5xx
  "510": "US",
  "511": "US",
  "512": "US",
  "513": "US",
  "514": "US",
  "515": "US",
  "516": "US",
  "517": "US",
  "518": "US",
  "519": "US",
  "520": "CA",
  "521": "CA",
  "522": "CA",
  "523": "CA",
  "524": "CA",
  "525": "CA",
  "526": "CA",
  "527": "CA",
  "528": "CA",
  "529": "CA",
  "530": "AE",
  "531": "AE",
  "532": "SA",
  "533": "SA",
  "534": "TR",
  "535": "TR",
  "536": "EG",
  "537": "NG",
  "538": "KE",
  "539": "GH",
  "540": "US",
  "541": "GB",
  "542": "DE",
  "543": "FR",
  "544": "IT",
  "545": "ES",
  "546": "NL",
  "547": "US",
  "548": "US",
  "549": "US",
  "550": "SA",
  "551": "US",
  "552": "US",
  "553": "AU",
  "554": "AU",
  "555": "AU",
  // MASTERCARD 2xxx
  "222": "US",
  "223": "US",
  "224": "GB",
  "225": "DE",
  "226": "FR",
  "227": "CA",
  "228": "AU",
  "229": "US",
  "230": "US",
  "231": "US",
  "232": "US",
  "233": "US",
  "234": "US",
  "235": "US",
  "236": "US",
  "237": "US",
  "238": "US",
  "239": "US",
  "240": "US",
  "241": "US",
  "242": "US",
  "243": "US",
  "244": "US",
  "245": "US",
  "246": "US",
  "247": "US",
  "248": "US",
  "249": "US",
  "250": "US",
  "251": "US",
  "252": "US",
  "253": "US",
  "254": "US",
  "255": "US",
  "256": "US",
  "257": "US",
  "258": "US",
  "259": "US",
  "260": "US",
  "261": "US",
  "262": "US",
  "263": "US",
  "264": "US",
  "265": "US",
  "266": "US",
  "267": "US",
  "268": "US",
  "269": "US",
  "270": "US",
  "271": "US",
  // AMEX 3xx
  "340": "US",
  "341": "US",
  "342": "US",
  "343": "US",
  "344": "US",
  "345": "US",
  "346": "GB",
  "347": "US",
  "348": "AU",
  "370": "US",
  "371": "US",
  "372": "US",
  "373": "US",
  "374": "US",
  "375": "US",
  "376": "CA",
  "377": "GB",
  "378": "DE",
  "379": "FR",
  // DISCOVER 6xx
  "601": "US",
  "602": "US",
  "603": "US",
  "604": "US",
  "605": "US",
  "606": "US",
  "607": "US",
  "608": "US",
  "609": "US",
  "644": "US",
  "645": "US",
  "646": "US",
  "647": "US",
  "648": "US",
  "649": "US",
  "650": "US",
  "651": "US",
  "652": "US",
  "653": "US",
  "654": "US",
  "655": "US",
  "656": "US",
  "657": "US",
  "658": "US",
  "659": "US",
  // UNIONPAY 62x
  "620": "CN",
  "621": "CN",
  "622": "CN",
  "623": "CN",
  "624": "CN",
  "625": "CN",
  "626": "CN",
  "627": "CN",
  "628": "CN",
  "629": "CN",
  // JCB 35x
  "352": "JP",
  "353": "JP",
  "354": "JP",
  "355": "JP",
  "356": "JP",
  "357": "JP",
  "358": "JP"
};
const BIN_BANK_4 = {
  // VISA — US
  "4111": "Chase Bank",
  "4012": "Bank of America",
  "4024": "Wells Fargo",
  "4532": "Citibank",
  "4539": "US Bank",
  "4916": "Capital One",
  "4929": "Barclays",
  "4000": "Bank of America",
  "4128": "TD Bank",
  "4147": "PNC Bank",
  "4744": "SunTrust Bank",
  "4234": "Regions Bank",
  "4556": "Wells Fargo",
  "4485": "Chase Bank",
  "4658": "Fifth Third Bank",
  // VISA — UK / EU
  "4026": "Barclays",
  "4041": "HSBC",
  "4508": "Lloyds Bank",
  "4569": "NatWest",
  "4600": "Deutsche Bank",
  "4607": "BNP Paribas",
  "4619": "Société Générale",
  "4715": "ING Bank",
  "4814": "Rabobank",
  // VISA — Canada
  "4300": "Royal Bank of Canada",
  "4317": "TD Canada Trust",
  "4335": "CIBC",
  "4344": "Scotiabank",
  "4360": "BMO Bank",
  // VISA — AUS
  "4400": "Commonwealth Bank",
  "4418": "Westpac",
  "4427": "ANZ Bank",
  "4433": "NAB",
  // VISA — Intl
  "4040": "HSBC",
  "4050": "Standard Chartered",
  "4060": "Citi International",
  "4070": "Emirates NBD",
  "4080": "Saudi National Bank",
  "4090": "First National Bank",
  // MASTERCARD — US
  "5100": "Chase Bank",
  "5110": "Citibank",
  "5120": "Bank of America",
  "5130": "Wells Fargo",
  "5140": "Capital One",
  "5150": "US Bank",
  "5160": "TD Bank",
  "5170": "PNC Bank",
  "5180": "American Express",
  "5190": "Discover Bank",
  "5200": "Royal Bank of Canada",
  "5210": "TD Canada Trust",
  "5220": "CIBC",
  "5230": "Scotiabank",
  "5300": "Emirates NBD",
  "5310": "Abu Dhabi Commercial Bank",
  "5320": "Saudi National Bank",
  "5330": "Riyad Bank",
  "5340": "Garanti Bank",
  "5350": "İş Bankası",
  "5400": "Chase Bank",
  "5410": "Barclays",
  "5420": "Deutsche Bank",
  "5430": "BNP Paribas",
  "5440": "Intesa Sanpaolo",
  "5450": "Santander",
  "5473": "Bank of America",
  "5474": "Bank of America",
  "5500": "Saudi National Bank",
  "5530": "Commonwealth Bank",
  "5540": "Westpac",
  // AMEX — US
  "3400": "American Express",
  "3411": "American Express",
  "3700": "American Express",
  "3711": "American Express",
  "3714": "American Express",
  // DISCOVER
  "6011": "Discover Bank",
  "6500": "Discover Bank",
  // UNIONPAY
  "6221": "Bank of China",
  "6225": "China Construction Bank",
  "6228": "Industrial & Commercial Bank"
};
const BIN_TYPE_4 = {
  "4111": "CREDIT",
  "4532": "CREDIT",
  "4916": "CREDIT",
  "4929": "CREDIT",
  "5100": "CREDIT",
  "5140": "CREDIT",
  "5400": "CREDIT",
  "5410": "CREDIT",
  "5473": "CREDIT",
  "5474": "CREDIT",
  "3400": "CREDIT",
  "3700": "CREDIT",
  "6011": "CREDIT"
};
function resolveBinProvider(bin2) {
  if (!bin2 || bin2.length < 2) return "VISA";
  const n2 = parseInt(bin2.slice(0, 2), 10);
  const n4 = parseInt(bin2.slice(0, 4), 10);
  if (bin2[0] === "4") return "VISA";
  if (n2 >= 51 && n2 <= 55 || n4 >= 2221 && n4 <= 2720) return "MASTERCARD";
  if (bin2[0] === "3" && (bin2[1] === "4" || bin2[1] === "7")) return "AMEX";
  if (bin2.startsWith("6011") || n4 >= 6440 && n4 <= 6599) return "DISCOVER";
  if (bin2.startsWith("65")) return "DISCOVER";
  if (bin2.startsWith("62")) return "UNIONPAY";
  if (bin2.startsWith("35")) return "JCB";
  if (bin2.startsWith("50") || bin2.startsWith("56") || bin2.startsWith("57") || bin2.startsWith("58")) return "MAESTRO";
  return "CARD";
}
function resolveBinCountry(bin2) {
  const p4 = bin2.slice(0, 4);
  const p3 = bin2.slice(0, 3);
  const code = BIN_COUNTRY_3[p4] ?? BIN_COUNTRY_3[p3] ?? null;
  if (code) {
    const names = {
      US: "United States",
      GB: "United Kingdom",
      CA: "Canada",
      AU: "Australia",
      DE: "Germany",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      NL: "Netherlands",
      BE: "Belgium",
      CH: "Switzerland",
      SE: "Sweden",
      NO: "Norway",
      DK: "Denmark",
      FI: "Finland",
      PL: "Poland",
      PT: "Portugal",
      IN: "India",
      JP: "Japan",
      KR: "South Korea",
      SG: "Singapore",
      HK: "Hong Kong",
      AE: "UAE",
      SA: "Saudi Arabia",
      BR: "Brazil",
      MX: "Mexico",
      AR: "Argentina",
      ZA: "South Africa",
      NG: "Nigeria",
      RU: "Russia",
      CN: "China",
      TR: "Turkey",
      IL: "Israel",
      NZ: "New Zealand",
      MY: "Malaysia",
      PH: "Philippines",
      TH: "Thailand",
      ID: "Indonesia",
      PK: "Pakistan",
      EG: "Egypt",
      CO: "Colombia",
      CL: "Chile",
      UA: "Ukraine",
      GH: "Ghana",
      KE: "Kenya"
    };
    return { code, name: names[code] ?? code };
  }
  const provider2 = resolveBinProvider(bin2);
  if (provider2 === "UNIONPAY") return { code: "CN", name: "China" };
  if (provider2 === "JCB") return { code: "JP", name: "Japan" };
  return { code: "US", name: "International" };
}
function resolveBinBank(bin2) {
  const p4 = bin2.slice(0, 4);
  if (BIN_BANK_4[p4]) return BIN_BANK_4[p4];
  const provider2 = resolveBinProvider(bin2);
  const fallbacks = {
    VISA: ["Global Bank Network", "International Issuer", "Premier Card Services", "Horizon Bank"],
    MASTERCARD: ["Global Card Services", "International Bank Network", "Apex Financial", "Pinnacle Bank"],
    AMEX: ["American Express", "Amex Global Services"],
    DISCOVER: ["Discover Bank", "Discover Financial Services"],
    UNIONPAY: ["China UnionPay", "Bank of China"],
    JCB: ["JCB International"],
    MAESTRO: ["Maestro Card Services", "Global Bank Network"],
    CARD: ["Global Bank Network", "International Card Services"]
  };
  const list2 = fallbacks[provider2] ?? fallbacks.CARD;
  return list2[parseInt(bin2.slice(0, 2), 10) % list2.length];
}
function resolveBin(bin2) {
  const provider2 = resolveBinProvider(bin2);
  const { code, name } = resolveBinCountry(bin2);
  const bank2 = resolveBinBank(bin2);
  const p4 = bin2.slice(0, 4);
  const type = BIN_TYPE_4[p4] ?? "DEBIT";
  return { scheme: provider2, brand: provider2, type, bank: bank2, country: code, countryName: name };
}
function schemeToProvider(scheme) {
  const s = scheme.toUpperCase();
  if (s.includes("VISA")) return "VISA";
  if (s.includes("MASTER")) return "MASTERCARD";
  if (s.includes("AMEX") || s.includes("AMERICAN")) return "AMEX";
  if (s.includes("DISCOVER")) return "DISCOVER";
  if (s.includes("UNIONPAY") || s.includes("CUP")) return "UNIONPAY";
  if (s.includes("JCB")) return "JCB";
  if (s.includes("MAESTRO")) return "MAESTRO";
  return scheme || "CARD";
}
function luhnCheckDigit(partial) {
  const digits = partial.split("").map(Number).reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - sum % 10) % 10);
}
function generateCardNumber(bin2, provider2) {
  const total = provider2 === "AMEX" ? 15 : 16;
  const fillLen = total - bin2.length - 1;
  let mid = "";
  for (let i = 0; i < fillLen; i++) mid += Math.floor(Math.random() * 10);
  const partial = bin2 + mid;
  return partial + luhnCheckDigit(partial);
}
function generateCvv(provider2 = "VISA") {
  const len = provider2 === "AMEX" ? 4 : 3;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}
function generateExpiry() {
  const now = /* @__PURE__ */ new Date();
  const yrs = 1 + Math.floor(Math.random() * 5);
  const mOs = Math.floor(Math.random() * 12);
  const t = new Date(now.getFullYear() + yrs, now.getMonth() + mOs, 1);
  return `${String(t.getMonth() + 1).padStart(2, "0")}/${String(t.getFullYear()).slice(-2)}`;
}
const FIRST = [
  "JAMES",
  "JOHN",
  "ROBERT",
  "MICHAEL",
  "WILLIAM",
  "DAVID",
  "RICHARD",
  "JOSEPH",
  "THOMAS",
  "CHARLES",
  "CHRISTOPHER",
  "DANIEL",
  "MATTHEW",
  "ANTHONY",
  "MARK",
  "DONALD",
  "STEVEN",
  "PAUL",
  "ANDREW",
  "KENNETH",
  "JENNIFER",
  "PATRICIA",
  "LINDA",
  "BARBARA",
  "ELIZABETH",
  "SUSAN",
  "JESSICA",
  "SARAH",
  "KAREN",
  "LISA",
  "NANCY",
  "BETTY",
  "MARGARET",
  "SANDRA",
  "ASHLEY",
  "EMILY",
  "ANNA",
  "MARIA",
  "LAURA",
  "RACHEL"
];
const LAST = [
  "SMITH",
  "JOHNSON",
  "WILLIAMS",
  "BROWN",
  "JONES",
  "GARCIA",
  "MILLER",
  "DAVIS",
  "RODRIGUEZ",
  "MARTINEZ",
  "HERNANDEZ",
  "LOPEZ",
  "GONZALEZ",
  "WILSON",
  "ANDERSON",
  "THOMAS",
  "TAYLOR",
  "MOORE",
  "JACKSON",
  "MARTIN",
  "LEE",
  "PEREZ",
  "THOMPSON",
  "WHITE",
  "HARRIS",
  "SANCHEZ",
  "CLARK",
  "WALKER",
  "HALL",
  "YOUNG"
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rNum = (n) => Math.floor(Math.random() * n);
function generateName() {
  return `${pick(FIRST)} ${pick(LAST)}`;
}
const ADDR = {
  US: {
    streets: ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Park Blvd", "Sunrise Dr", "Broadway", "Washington Blvd"],
    cities: ["Los Angeles", "New York", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "Dallas", "San Diego", "Austin", "Charlotte", "Columbus"],
    states: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"],
    zip: () => String(1e4 + rNum(89999))
  },
  GB: {
    streets: ["High Street", "Church Road", "Station Road", "London Road", "Park Lane", "Victoria Road", "King Street", "Queen Street"],
    cities: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Cardiff"],
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    zip: () => {
      const l = "ABCDEFGHIJKLMNOPRSTUW";
      const r = (s) => s[rNum(s.length)];
      return `${r(l)}${r(l)}${rNum(90) + 10} ${rNum(9) + 1}${r(l)}${r(l)}`;
    }
  },
  CA: {
    streets: ["Main St", "Yonge St", "Bloor St", "Queen St", "King St", "Bay St", "Dundas St", "College St"],
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City"],
    states: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba", "Nova Scotia"],
    zip: () => {
      const a = "ABCEGHJKLMNPRSTVXY", d = "0123456789", r = (s) => s[rNum(s.length)];
      return `${r(a)}${r(d)}${r(a)} ${r(d)}${r(a)}${r(d)}`;
    }
  },
  AU: {
    streets: ["George St", "Collins St", "Pitt St", "Elizabeth St", "King St", "Queen St", "Flinders St"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle"],
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    zip: () => String(1e3 + rNum(8999))
  },
  DE: {
    streets: ["Hauptstraße", "Schulstraße", "Gartenstraße", "Bahnhofstraße", "Bergstraße", "Kirchstraße"],
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse", "Saxony", "Berlin"],
    zip: () => String(1e4 + rNum(89999))
  },
  FR: {
    streets: ["Rue de la Paix", "Avenue des Champs", "Rue du Faubourg", "Boulevard Haussmann", "Rue Royale"],
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
    states: ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Hauts-de-France"],
    zip: () => String(1e4 + rNum(89999))
  },
  IN: {
    streets: ["MG Road", "Nehru Street", "Gandhi Nagar", "Connaught Place", "Linking Road", "Sector 15"],
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan"],
    zip: () => String(1e5 + rNum(899999))
  }
};
function generateAddress(country2) {
  const t = ADDR[country2];
  if (!t) return { street: `${1 + rNum(9999)} Main St`, city: "Capital City", state: "", zip: String(1e4 + rNum(89999)) };
  return {
    street: `${1 + rNum(9999)} ${pick(t.streets)}`,
    city: pick(t.cities),
    state: pick(t.states),
    zip: t.zip()
  };
}
function generateBatch(bin2, info2, qty, defaults) {
  const seen = /* @__PURE__ */ new Set();
  const cards = [];
  const max = qty * 20;
  let attempts = 0;
  while (cards.length < qty && attempts++ < max) {
    const cardNumber2 = generateCardNumber(bin2, info2.provider);
    if (seen.has(cardNumber2)) continue;
    seen.add(cardNumber2);
    const addr = generateAddress(info2.country);
    cards.push({
      id: crypto.randomUUID(),
      bin: bin2,
      provider: info2.provider,
      type: info2.type,
      bank: info2.bank,
      country: info2.country,
      countryFlag: info2.countryFlag,
      cardNumber: cardNumber2,
      cvv: generateCvv(info2.provider),
      expiry: generateExpiry(),
      fullName: generateName(),
      ...addr,
      priceUsd: defaults.priceUsd,
      limitUsd: defaults.limitUsd,
      isValid: defaults.isValid,
      status: "in_stock"
    });
  }
  return cards;
}
function formatCardNumber(num) {
  const cleaned = num.replace(/\D/g, "");
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)} ${cleaned.slice(10)}`;
  }
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}
function useCopy() {
  const [copiedId, setCopiedId] = useState(null);
  const copy = useCallback((text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);
  return { copiedId, copy };
}
function parseBulkInput(raw) {
  return raw.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const clean = line.replace(/bin\s*[:=]?\s*/gi, "").replace(/qty\s*[:=]?\s*/gi, "|");
    const parts = clean.split(/[\s,|]+/).filter(Boolean);
    const bin2 = (parts[0] ?? "").replace(/\D/g, "").slice(0, 6);
    const qty = Math.max(1, Math.min(500, parseInt(parts[1] ?? "10", 10) || 10));
    return { bin: bin2, qty };
  }).filter((e) => e.bin.length === 6);
}
function BinGenerator() {
  const [bin2, setBin] = useState("");
  const [qty, setQty] = useState(10);
  const [priceUsd, setPriceUsd] = useState("");
  const [limitUsd, setLimitUsd] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [binStatus2, setBinStatus] = useState("idle");
  const [binInfo, setBinInfo] = useState(null);
  const lastBin = useRef("");
  const [cards, setCards] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [msg2, setMsg] = useState(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkLimit, setBulkLimit] = useState("");
  const [bulkIsValid, setBulkIsValid] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMsg, setBulkMsg] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const { copiedId, copy } = useCopy();
  const triggerLookup = useCallback((b) => {
    if (b.length < 6) {
      setBinStatus("idle");
      setBinInfo(null);
      return;
    }
    if (b.length === 6) {
      if (lastBin.current === b) return;
      lastBin.current = b;
      const info2 = resolveBin(b);
      setBinInfo(info2);
      setBinStatus("ok");
    }
  }, []);
  const handleBinChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setBin(v);
    setCards([]);
    setMsg(null);
    triggerLookup(v);
  };
  const handleGenerate = useCallback(() => {
    if (bin2.length !== 6) {
      setMsg({ type: "err", text: "Enter a valid 6-digit BIN." });
      return;
    }
    if (!priceUsd) {
      setMsg({ type: "err", text: "Price per card is required." });
      return;
    }
    const resolved = binInfo ?? resolveBin(bin2);
    const provider2 = schemeToProvider(resolved.scheme || resolved.brand);
    const country2 = resolved.country || "US";
    const countryFlag = COUNTRY_FLAGS[country2] || "🌐";
    const batch = generateBatch(bin2, { provider: provider2, type: resolved.type || "DEBIT", bank: resolved.bank, country: country2, countryFlag }, qty, { priceUsd, limitUsd, isValid });
    setCards(batch);
    setMsg(null);
  }, [bin2, binInfo, qty, priceUsd, limitUsd, isValid]);
  const removeCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));
  const regenCard = (id) => {
    setCards(
      (prev) => prev.map((c) => {
        if (c.id !== id) return c;
        const addr = generateAddress(c.country);
        return { ...c, cardNumber: generateCardNumber(c.bin, c.provider), cvv: generateCvv(c.provider), expiry: generateExpiry(), fullName: generateName(), ...addr };
      })
    );
  };
  const toggleStatus = (id) => setCards(
    (prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "in_stock" ? "sold_out" : "in_stock" } : c)
  );
  const openEdit = (c) => {
    setEditingId(c.id);
    setEditDraft({ ...c });
  };
  const closeEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };
  const saveEdit = () => {
    if (!editingId) return;
    setCards((prev) => prev.map((c) => c.id === editingId ? { ...c, ...editDraft } : c));
    closeEdit();
  };
  const handleSubmit = async () => {
    if (cards.length === 0) {
      setMsg({ type: "err", text: "No cards to submit." });
      return;
    }
    if (!priceUsd) {
      setMsg({ type: "err", text: "Price is required." });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    const lines = cards.map((c) => {
      const line = [
        c.cardNumber,
        c.expiry,
        c.cvv,
        c.fullName,
        c.bank,
        c.country,
        c.state,
        c.city,
        c.zip,
        c.street || "",
        // position 9  → street
        c.limitUsd || "0",
        // position 10 → limit
        c.priceUsd,
        // position 11 → price
        c.type
        // position 12 → type
      ].join("|");
      console.log("[BIN submit] line:", line);
      return line;
    }).join("\n");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid })
      });
      const data = await res.json();
      console.log("[BIN submit] response:", data);
      if (!res.ok) {
        setMsg({ type: "err", text: data.error ?? "Submit failed." });
        return;
      }
      const created = data.created ?? 0;
      const errs = data.errors?.length ?? 0;
      setMsg({ type: "ok", text: `✓ ${created} card(s) added to inventory.${errs ? ` ${errs} skipped.` : ""}` });
      if (errs > 0) console.warn("[BIN submit] skipped errors:", data.errors);
      setCards([]);
    } catch (e) {
      console.error("[BIN submit] network error:", e);
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };
  const handleBulkGenerate = useCallback(() => {
    const entries = parseBulkInput(bulkText);
    if (entries.length === 0) {
      setBulkMsg({ type: "err", text: "No valid BINs found. Format: BIN (space) Qty per line." });
      return;
    }
    if (!bulkPrice) {
      setBulkMsg({ type: "err", text: "Price per card is required." });
      return;
    }
    setBulkGenerating(true);
    setBulkMsg(null);
    const allCards = [];
    for (const { bin: b, qty: q } of entries) {
      const resolved = resolveBin(b);
      const provider2 = schemeToProvider(resolved.scheme || resolved.brand);
      const country2 = resolved.country || "US";
      const countryFlag = COUNTRY_FLAGS[country2] || "🌐";
      const batch = generateBatch(
        b,
        { provider: provider2, type: resolved.type || "DEBIT", bank: resolved.bank, country: country2, countryFlag },
        q,
        { priceUsd: bulkPrice, limitUsd: bulkLimit, isValid: bulkIsValid }
      );
      allCards.push(...batch);
    }
    setCards((prev) => [...prev, ...allCards]);
    setBulkMsg({ type: "ok", text: `✓ ${allCards.length} card record${allCards.length !== 1 ? "s" : ""} generated from ${entries.length} BIN${entries.length !== 1 ? "s" : ""}. Review below and submit.` });
    setBulkGenerating(false);
  }, [bulkText, bulkPrice, bulkLimit, bulkIsValid]);
  const handleBulkSubmit = async () => {
    if (cards.length === 0) {
      setBulkMsg({ type: "err", text: "No cards to submit." });
      return;
    }
    setBulkSubmitting(true);
    setBulkMsg(null);
    const lines = cards.map((c) => {
      const line = [
        c.cardNumber,
        c.expiry,
        c.cvv,
        c.fullName,
        c.bank,
        c.country,
        c.state,
        c.city,
        c.zip,
        c.street || "",
        // position 9  → street
        c.limitUsd || "0",
        // position 10 → limit
        c.priceUsd,
        // position 11 → price
        c.type
        // position 12 → type
      ].join("|");
      console.log("[BIN bulk submit] line:", line);
      return line;
    }).join("\n");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid: bulkIsValid })
      });
      const data = await res.json();
      console.log("[BIN bulk submit] response:", data);
      if (!res.ok) {
        setBulkMsg({ type: "err", text: data.error ?? "Submit failed." });
        return;
      }
      const created = data.created ?? 0;
      const errs = data.errors?.length ?? 0;
      setBulkMsg({ type: "ok", text: `✓ ${created} cards added to inventory.${errs ? ` ${errs} skipped.` : ""}` });
      if (errs > 0) console.warn("[BIN bulk submit] skipped errors:", data.errors);
      setCards([]);
      setBulkText("");
    } catch (e) {
      console.error("[BIN bulk submit] network error:", e);
      setBulkMsg({ type: "err", text: "Network error." });
    } finally {
      setBulkSubmitting(false);
    }
  };
  const inStockCount = cards.filter((c) => c.status === "in_stock").length;
  const soldCount = cards.filter((c) => c.status === "sold_out").length;
  const renderBinInfoCard = () => {
    if (!binInfo || binStatus2 !== "ok") return null;
    const provider2 = schemeToProvider(binInfo.scheme || binInfo.brand);
    return /* @__PURE__ */ jsxs("div", { className: styles$4.binInfoCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$4.binProviderLogo, children: PROVIDER_ICON[provider2] ?? "💳" }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.binDetails, children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.binScheme, children: provider2 }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.binMeta, children: [
          /* @__PURE__ */ jsx("span", { className: `${styles$4.binMetaChip} ${styles$4.typeChip}`, children: binInfo.type }),
          /* @__PURE__ */ jsx("span", { className: styles$4.binMetaChip, children: binInfo.bank }),
          /* @__PURE__ */ jsxs("span", { className: styles$4.binMetaChip, children: [
            COUNTRY_FLAGS[binInfo.country] ?? "🌐",
            " ",
            binInfo.countryName
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CheckCircle, { size: 16, style: { color: "#4ade80", flexShrink: 0 } })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: styles$4.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$4.hero, children: [
      /* @__PURE__ */ jsx("div", { className: styles$4.heroIcon, children: /* @__PURE__ */ jsx(CreditCard, { size: 26 }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.heroText, children: [
        /* @__PURE__ */ jsx("h2", { children: "Smart BIN Card Generator" }),
        /* @__PURE__ */ jsx("p", { children: "Generate structured card records using BIN input, including card number, expiry, CVV, and associated details." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$4.panel, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.panelTitle, children: [
        /* @__PURE__ */ jsx(Wand2, { size: 15 }),
        "BIN Autofill Generator",
        /* @__PURE__ */ jsx("span", { className: styles$4.titleBadge, children: "Single BIN" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$4.panelSubtitle, children: "Enter a 6-digit BIN — provider, bank, country, and card type are resolved automatically. Set quantity and price, then generate." }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.controls, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "BIN (6 digits) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "bin-generator-bin-input",
              className: styles$4.input,
              type: "text",
              inputMode: "numeric",
              maxLength: 6,
              placeholder: "e.g. 547383",
              value: bin2,
              onChange: handleBinChange
            }
          ),
          binStatus2 === "ok" && /* @__PURE__ */ jsxs("span", { className: `${styles$4.binStatus} ${styles$4.binStatusOk}`, children: [
            /* @__PURE__ */ jsx(CheckCircle, { size: 10 }),
            " Resolved"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "Quantity" }),
          /* @__PURE__ */ jsxs("div", { className: styles$4.qtyGroup, children: [
            [10, 25, 50, 100].map((n) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                id: `qty-btn-${n}`,
                className: `${styles$4.qtyBtn} ${qty === n ? styles$4.qtyBtnActive : ""}`,
                onClick: () => setQty(n),
                children: n
              },
              n
            )),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: `${styles$4.input} ${styles$4.qtyCustom}`,
                type: "number",
                min: 1,
                max: 500,
                value: qty,
                onChange: (e) => setQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1))),
                title: "Custom quantity (1–500)"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "Price (USD) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$4.input,
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "36.00",
              value: priceUsd,
              onChange: (e) => setPriceUsd(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "Limit (USD)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$4.input,
              type: "number",
              min: "0",
              placeholder: "500",
              value: limitUsd,
              onChange: (e) => setLimitUsd(e.target.value)
            }
          )
        ] })
      ] }),
      renderBinInfoCard(),
      /* @__PURE__ */ jsx("div", { style: { marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }, children: /* @__PURE__ */ jsxs("label", { className: styles$4.toggleLabel, children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: isValid, onChange: (e) => setIsValid(e.target.checked) }),
        "Show in 100% Valid section"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.actionBar, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            id: "bin-generate-btn",
            type: "button",
            className: styles$4.genBtn,
            onClick: handleGenerate,
            disabled: bin2.length !== 6 || !priceUsd,
            children: [
              /* @__PURE__ */ jsx(Wand2, { size: 14 }),
              "Generate ",
              qty,
              " Card",
              qty !== 1 ? "s" : ""
            ]
          }
        ),
        cards.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: styles$4.submitBtn,
              onClick: handleSubmit,
              disabled: submitting,
              children: [
                /* @__PURE__ */ jsx(Plus, { size: 13 }),
                submitting ? "Submitting…" : `Submit all ${cards.length} to Inventory`
              ]
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "button", className: styles$4.clearBtn, onClick: () => {
            setCards([]);
            setMsg(null);
          }, children: "Clear all" })
        ] })
      ] }),
      msg2 && /* @__PURE__ */ jsx("div", { className: `${styles$4.msg} ${msg2.type === "ok" ? styles$4.msgOk : styles$4.msgErr}`, children: msg2.text })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$4.panel, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.panelTitle, children: [
        /* @__PURE__ */ jsx(Layers, { size: 15 }),
        "Bulk BIN Input",
        /* @__PURE__ */ jsx("span", { className: styles$4.titleBadge, children: "Multi-BIN" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.panelSubtitle, children: [
        "Paste multiple BINs with quantities. Each BIN generates independent cards. Supported formats:",
        " ",
        /* @__PURE__ */ jsx("code", { style: { fontSize: "0.68rem", background: "rgba(99,102,241,0.1)", borderRadius: 4, padding: "1px 5px" }, children: "547383 50" }),
        " ",
        "or",
        " ",
        /* @__PURE__ */ jsx("code", { style: { fontSize: "0.68rem", background: "rgba(99,102,241,0.1)", borderRadius: 4, padding: "1px 5px" }, children: "BIN: 547383, Qty: 50" })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: styles$4.bulkArea,
          rows: 5,
          value: bulkText,
          onChange: (e) => {
            setBulkText(e.target.value);
            setBulkMsg(null);
          },
          placeholder: "547383 50\n423456 25\nBIN: 411111, Qty: 100\n535120 10"
        }
      ),
      bulkText.trim() && /* @__PURE__ */ jsx("div", { className: styles$4.bulkParsed, children: parseBulkInput(bulkText).map((e, i) => /* @__PURE__ */ jsxs("span", { className: styles$4.bulkLine, children: [
        PROVIDER_ICON[resolveBinProvider(e.bin)] ?? "💳",
        " ",
        e.bin,
        " → ",
        /* @__PURE__ */ jsxs("span", { className: styles$4.bulkLineQty, children: [
          e.qty,
          " cards"
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.9rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, style: { flex: "0 0 120px" }, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "Price (USD) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$4.input,
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "36.00",
              value: bulkPrice,
              onChange: (e) => setBulkPrice(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.fieldGroup, style: { flex: "0 0 120px" }, children: [
          /* @__PURE__ */ jsx("label", { className: styles$4.label, children: "Limit (USD)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$4.input,
              type: "number",
              min: "0",
              placeholder: "500",
              value: bulkLimit,
              onChange: (e) => setBulkLimit(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: styles$4.toggleLabel, style: { marginTop: "1.1rem" }, children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: bulkIsValid, onChange: (e) => setBulkIsValid(e.target.checked) }),
          "100% Valid section"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: styles$4.genBtn,
            style: { marginTop: "1.1rem" },
            onClick: handleBulkGenerate,
            disabled: bulkGenerating || !bulkText.trim() || !bulkPrice,
            children: [
              bulkGenerating ? /* @__PURE__ */ jsx(Loader2, { size: 13, className: styles$4.spinIcon }) : /* @__PURE__ */ jsx(Wand2, { size: 13 }),
              bulkGenerating ? "Generating…" : "Generate from BINs"
            ]
          }
        ),
        cards.length > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: styles$4.submitBtn,
            style: { marginTop: "1.1rem" },
            onClick: handleBulkSubmit,
            disabled: bulkSubmitting,
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 13 }),
              bulkSubmitting ? "Submitting…" : `Submit ${cards.length} cards`
            ]
          }
        )
      ] }),
      bulkMsg && /* @__PURE__ */ jsx("div", { className: `${styles$4.msg} ${bulkMsg.type === "ok" ? styles$4.msgOk : styles$4.msgErr}`, style: { marginTop: "0.75rem" }, children: bulkMsg.text })
    ] }),
    cards.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$4.panel, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.panelTitle, children: [
          /* @__PURE__ */ jsx(Package, { size: 15 }),
          "Generated Cards",
          /* @__PURE__ */ jsxs("span", { className: styles$4.titleBadge, children: [
            cards.length,
            " total"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: styles$4.clearBtn, onClick: () => {
          setCards([]);
          setMsg(null);
          setBulkMsg(null);
        }, children: [
          /* @__PURE__ */ jsx(X, { size: 11, style: { display: "inline", marginRight: 3 } }),
          " Clear All"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.statsBar, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.statItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.statValue, children: cards.length }),
          /* @__PURE__ */ jsx("span", { className: styles$4.statLabel, children: "Total Generated" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.statItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.statValue, style: { color: "#4ade80" }, children: inStockCount }),
          /* @__PURE__ */ jsx("span", { className: styles$4.statLabel, children: "In Stock" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.statItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.statValue, style: { color: "#f87171" }, children: soldCount }),
          /* @__PURE__ */ jsx("span", { className: styles$4.statLabel, children: "Marked Sold" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.statItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.statValue, style: { color: "#fbbf24" }, children: [...new Set(cards.map((c) => c.bin))].length }),
          /* @__PURE__ */ jsx("span", { className: styles$4.statLabel, children: "Unique BINs" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$4.cardsGrid, children: cards.map((c, idx) => /* @__PURE__ */ jsxs("div", { className: styles$4.cardPreview, children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.cardCircles }),
        editingId === c.id && /* @__PURE__ */ jsxs("div", { className: styles$4.editOverlay, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$4.editTitle, children: [
            "Edit Card #",
            idx + 1
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$4.editGrid, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "Card Number" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.cardNumber ?? c.cardNumber),
                  maxLength: 19,
                  onChange: (e) => setEditDraft((d) => ({ ...d, cardNumber: e.target.value.replace(/\D/g, "") }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "CVV" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.cvv ?? c.cvv),
                  maxLength: 4,
                  onChange: (e) => setEditDraft((d) => ({ ...d, cvv: e.target.value.replace(/\D/g, "") }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "Expiry (MM/YY)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.expiry ?? c.expiry),
                  maxLength: 5,
                  placeholder: "MM/YY",
                  onChange: (e) => setEditDraft((d) => ({ ...d, expiry: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "Price (USD)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  type: "number",
                  value: String(editDraft.priceUsd ?? c.priceUsd),
                  onChange: (e) => setEditDraft((d) => ({ ...d, priceUsd: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "Cardholder Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.fullName ?? c.fullName),
                  onChange: (e) => setEditDraft((d) => ({ ...d, fullName: e.target.value.toUpperCase() }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "Street" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.street ?? c.street),
                  onChange: (e) => setEditDraft((d) => ({ ...d, street: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "City" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.city ?? c.city),
                  onChange: (e) => setEditDraft((d) => ({ ...d, city: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "State" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.state ?? c.state),
                  onChange: (e) => setEditDraft((d) => ({ ...d, state: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: styles$4.editFieldLabel, children: "ZIP" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: styles$4.editInput,
                  value: String(editDraft.zip ?? c.zip),
                  onChange: (e) => setEditDraft((d) => ({ ...d, zip: e.target.value }))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.4rem", marginTop: "0.25rem" }, children: [
            /* @__PURE__ */ jsx("button", { className: styles$4.editDoneBtn, style: { flex: 1 }, onClick: saveEdit, children: "Save" }),
            /* @__PURE__ */ jsx("button", { className: styles$4.editDoneBtn, style: { flex: 1, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" }, onClick: closeEdit, children: "Cancel" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.cardTopRow, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$4.cardIndex, children: [
            "#",
            idx + 1,
            " · BIN ",
            c.bin
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$4.cardProviderLogo, children: [
            /* @__PURE__ */ jsx("span", { className: styles$4.providerIcon, children: PROVIDER_ICON[c.provider] ?? "💳" }),
            c.provider
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$4.cardNumber, children: formatCardNumber(c.cardNumber) }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.cardMidRow, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$4.cardField, children: [
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldLabel, children: "Expires" }),
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldValue, children: c.expiry })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$4.cardField, children: [
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldLabel, children: "CVV" }),
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldValue, children: c.cvv })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$4.cardField, children: [
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldLabel, children: "Type" }),
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldValue, style: { fontSize: "0.7rem" }, children: c.type })
          ] }),
          c.bank && /* @__PURE__ */ jsxs("div", { className: styles$4.cardField, children: [
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldLabel, children: "Bank" }),
            /* @__PURE__ */ jsx("div", { className: styles$4.cardFieldValue, style: { fontSize: "0.65rem", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: c.bank })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$4.cardName, children: c.fullName }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.cardAddress, children: [
          c.street,
          " · ",
          c.city,
          c.state ? `, ${c.state}` : "",
          " ",
          c.zip,
          /* @__PURE__ */ jsx("br", {}),
          c.countryFlag,
          " ",
          c.country
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.cardStatusRow, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `${styles$4.cardStatusBadge} ${c.status === "in_stock" ? styles$4.badgeInStock : styles$4.badgeSold}`,
              onClick: () => toggleStatus(c.id),
              title: "Click to toggle In Stock / Sold Out",
              style: { cursor: "pointer", border: "none", fontFamily: "inherit" },
              children: c.status === "in_stock" ? "✓ In Stock" : "✗ Sold Out"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: styles$4.cardActions, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `${styles$4.iconBtn} ${styles$4.iconBtnBlue}`,
                title: "Copy card data",
                onClick: () => copy(
                  `${c.cardNumber}|${c.expiry}|${c.cvv}|${c.fullName}|${c.bank}|${c.country}|${c.state}|${c.city}|${c.zip}`,
                  c.id
                ),
                children: copiedId === c.id ? /* @__PURE__ */ jsx(Check, { size: 11 }) : /* @__PURE__ */ jsx(Copy, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `${styles$4.iconBtn} ${styles$4.iconBtnPurple}`,
                title: "Edit card",
                onClick: () => openEdit(c),
                children: /* @__PURE__ */ jsx(Edit3, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `${styles$4.iconBtn}`,
                title: "Regenerate this card",
                onClick: () => regenCard(c.id),
                children: /* @__PURE__ */ jsx(RefreshCw, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: `${styles$4.iconBtn} ${styles$4.iconBtnRed}`,
                title: "Remove card",
                onClick: () => removeCard(c.id),
                children: /* @__PURE__ */ jsx(Trash2, { size: 11 })
              }
            )
          ] })
        ] })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: styles$4.submitBtn,
            onClick: priceUsd ? handleSubmit : handleBulkSubmit,
            disabled: submitting || bulkSubmitting,
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 14 }),
              submitting || bulkSubmitting ? "Submitting…" : `Submit all ${cards.length} cards to Inventory`
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "button", className: styles$4.clearBtn, onClick: () => {
          setCards([]);
          setMsg(null);
          setBulkMsg(null);
        }, children: "Clear all" }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.68rem", color: "#555", marginLeft: "auto" }, children: [
          inStockCount,
          " in stock · ",
          soldCount,
          " sold — generated using BIN logic"
        ] })
      ] })
    ] })
  ] });
}
const wrap$1 = "_wrap_144y8_3";
const sectionHeader = "_sectionHeader_144y8_10";
const sectionTitle = "_sectionTitle_144y8_19";
const sectionBadge = "_sectionBadge_144y8_29";
const sectionBadgeGreen = "_sectionBadgeGreen_144y8_41";
const panel = "_panel_144y8_48";
const statsBar = "_statsBar_144y8_56";
const statCard = "_statCard_144y8_63";
const statVal = "_statVal_144y8_74";
const statValRed = "_statValRed_144y8_82";
const statValAmber = "_statValAmber_144y8_84";
const statLbl = "_statLbl_144y8_86";
const tableWrap$1 = "_tableWrap_144y8_95";
const table$1 = "_table_144y8_95";
const ipCell = "_ipCell_144y8_136";
const chip = "_chip_144y8_144";
const chipSuccess = "_chipSuccess_144y8_156";
const chipFailed = "_chipFailed_144y8_162";
const chipBlocked = "_chipBlocked_144y8_168";
const chipDefault = "_chipDefault_144y8_174";
const actionChip = "_actionChip_144y8_181";
const banForm = "_banForm_144y8_195";
const fieldGroup = "_fieldGroup_144y8_202";
const label = "_label_144y8_208";
const input = "_input_144y8_216";
const select = "_select_144y8_234";
const banBtn = "_banBtn_144y8_247";
const unbanBtn = "_unbanBtn_144y8_271";
const toolbar$1 = "_toolbar_144y8_290";
const refreshBtn = "_refreshBtn_144y8_299";
const filterInput = "_filterInput_144y8_317";
const empty = "_empty_144y8_361";
const msg = "_msg_144y8_369";
const msgOk = "_msgOk_144y8_377";
const msgErr = "_msgErr_144y8_378";
const spinning = "_spinning_144y8_386";
const styles$3 = {
  wrap: wrap$1,
  sectionHeader,
  sectionTitle,
  sectionBadge,
  sectionBadgeGreen,
  panel,
  statsBar,
  statCard,
  statVal,
  statValRed,
  statValAmber,
  statLbl,
  tableWrap: tableWrap$1,
  table: table$1,
  ipCell,
  chip,
  chipSuccess,
  chipFailed,
  chipBlocked,
  chipDefault,
  actionChip,
  banForm,
  fieldGroup,
  label,
  input,
  select,
  banBtn,
  unbanBtn,
  toolbar: toolbar$1,
  refreshBtn,
  filterInput,
  empty,
  msg,
  msgOk,
  msgErr,
  spinning
};
function toEpochMs(value2) {
  const n = Number(value2);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n < 1e11 ? Math.trunc(n * 1e3) : Math.trunc(n);
}
function fmtDate(value2) {
  const ms = toEpochMs(value2);
  if (!ms) return "—";
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
async function adminPost(body2) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body2)
  });
  return res.json();
}
async function adminGet(action2, params = {}) {
  const qs = new URLSearchParams({ action: action2, ...params }).toString();
  const res = await fetch(`/api/admin?${qs}`);
  return res.json();
}
function StatusChip({ status }) {
  const s = status.toLowerCase();
  const cls = s === "success" ? styles$3.chipSuccess : s === "failed" ? styles$3.chipFailed : s === "blocked" ? styles$3.chipBlocked : styles$3.chipDefault;
  const icon2 = s === "success" ? /* @__PURE__ */ jsx(CheckCircle, { size: 9 }) : s === "failed" ? /* @__PURE__ */ jsx(AlertTriangle, { size: 9 }) : s === "blocked" ? /* @__PURE__ */ jsx(Ban, { size: 9 }) : null;
  return /* @__PURE__ */ jsxs("span", { className: `${styles$3.chip} ${cls}`, children: [
    icon2,
    " ",
    status || "â€”"
  ] });
}
function IpSecurity() {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logFilter, setLogFilter] = useState("");
  const autoRefRef = useRef(null);
  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(true);
  const [banIp2, setBanIp] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState("permanent");
  const [banHours, setBanHours] = useState("24");
  const [banMsg, setBanMsg] = useState(null);
  const [banning, setBanning] = useState(false);
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const data = await adminGet("ip_logs", { limit: "150" });
      setLogs(data.logs ?? []);
    } catch {
    } finally {
      setLogsLoading(false);
    }
  }, []);
  const fetchBans = useCallback(async () => {
    setBansLoading(true);
    try {
      const data = await adminGet("banned_ips");
      setBans(data.bans ?? []);
    } catch {
    } finally {
      setBansLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchLogs();
    void fetchBans();
    autoRefRef.current = setInterval(() => {
      void fetchLogs();
    }, 3e4);
    return () => {
      if (autoRefRef.current) clearInterval(autoRefRef.current);
    };
  }, [fetchLogs, fetchBans]);
  const handleBan = async () => {
    const ip = banIp2.trim();
    if (!ip) {
      setBanMsg({ type: "err", text: "Enter an IP address." });
      return;
    }
    if (!banReason.trim()) {
      setBanMsg({ type: "err", text: "Enter a reason for the ban." });
      return;
    }
    setBanning(true);
    setBanMsg(null);
    try {
      const expiresAt = banType === "temporary" ? Date.now() + Number(banHours) * 60 * 60 * 1e3 : void 0;
      const res = await adminPost({
        action: "ban_ip",
        ip,
        reason: banReason.trim(),
        isPermanent: banType === "permanent",
        expiresAt
      });
      if (res.success) {
        setBanMsg({ type: "ok", text: `âœ“ ${ip} has been banned.` });
        setBanIp("");
        setBanReason("");
        setBanType("permanent");
        setBanHours("24");
        void fetchBans();
        void fetchLogs();
      } else {
        setBanMsg({ type: "err", text: res.error ?? "Ban failed." });
      }
    } catch {
      setBanMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setBanning(false);
    }
  };
  const handleUnban = async (ip) => {
    try {
      const res = await adminPost({ action: "unban_ip", ip });
      if (res.success) {
        setBans((prev) => prev.filter((b) => b.ipAddress !== ip));
        setBanMsg({ type: "ok", text: `âœ“ ${ip} has been unbanned.` });
      }
    } catch {
    }
  };
  const prefillBan = (ip) => {
    setBanIp(ip);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const totalLogs = logs.length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const blockedCount = logs.filter((l) => l.status === "blocked").length;
  const bannedCount = bans.length;
  const filteredLogs = logFilter ? logs.filter(
    (l) => l.ipAddress.includes(logFilter) || (l.userId ?? "").toLowerCase().includes(logFilter.toLowerCase()) || l.action.toLowerCase().includes(logFilter.toLowerCase()) || l.status.toLowerCase().includes(logFilter.toLowerCase())
  ) : logs;
  return /* @__PURE__ */ jsxs("div", { className: styles$3.wrap, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$3.statsBar, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$3.statCard, children: [
        /* @__PURE__ */ jsx("div", { className: `${styles$3.statVal}`, children: totalLogs }),
        /* @__PURE__ */ jsx("div", { className: styles$3.statLbl, children: "Events logged" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$3.statCard, children: [
        /* @__PURE__ */ jsx("div", { className: `${styles$3.statVal} ${styles$3.statValRed}`, children: failedCount }),
        /* @__PURE__ */ jsx("div", { className: styles$3.statLbl, children: "Failed attempts" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$3.statCard, children: [
        /* @__PURE__ */ jsx("div", { className: `${styles$3.statVal} ${styles$3.statValAmber}`, children: blockedCount }),
        /* @__PURE__ */ jsx("div", { className: styles$3.statLbl, children: "Blocked (banned IP)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$3.statCard, children: [
        /* @__PURE__ */ jsx("div", { className: `${styles$3.statVal} ${styles$3.statValRed}`, children: bannedCount }),
        /* @__PURE__ */ jsx("div", { className: styles$3.statLbl, children: "Active bans" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$3.panel, children: [
      /* @__PURE__ */ jsx("div", { className: styles$3.sectionHeader, children: /* @__PURE__ */ jsxs("div", { className: styles$3.sectionTitle, children: [
        /* @__PURE__ */ jsx(Ban, { size: 15 }),
        "Ban IP Address",
        /* @__PURE__ */ jsx("span", { className: styles$3.sectionBadge, children: "Instant" })
      ] }) }),
      banMsg && /* @__PURE__ */ jsx("div", { className: `${styles$3.msg} ${banMsg.type === "ok" ? styles$3.msgOk : styles$3.msgErr}`, children: banMsg.text }),
      /* @__PURE__ */ jsxs("div", { className: styles$3.banForm, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$3.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$3.label, children: "IP Address" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$3.input,
              placeholder: "e.g. 192.168.1.1",
              value: banIp2,
              onChange: (e) => setBanIp(e.target.value),
              spellCheck: false
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$3.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$3.label, children: "Reason" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$3.input,
              placeholder: "Abuse, fraud, brute-forceâ€¦",
              value: banReason,
              onChange: (e) => setBanReason(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$3.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$3.label, children: "Type" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: styles$3.select,
              value: banType,
              onChange: (e) => setBanType(e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "permanent", children: "Permanent" }),
                /* @__PURE__ */ jsx("option", { value: "temporary", children: "Temporary" })
              ]
            }
          )
        ] }),
        banType === "temporary" && /* @__PURE__ */ jsxs("div", { className: styles$3.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$3.label, children: "Duration (hours)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$3.input,
              type: "number",
              min: "1",
              max: "8760",
              value: banHours,
              onChange: (e) => setBanHours(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$3.fieldGroup, children: [
          /* @__PURE__ */ jsx("label", { className: styles$3.label, children: " " }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: styles$3.banBtn,
              onClick: handleBan,
              disabled: banning,
              children: [
                /* @__PURE__ */ jsx(Ban, { size: 13 }),
                banning ? "Banningâ€¦" : "Block IP"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$3.panel, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$3.sectionHeader, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$3.sectionTitle, children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 15 }),
          "Banned IPs",
          /* @__PURE__ */ jsxs("span", { className: styles$3.sectionBadge, children: [
            bannedCount,
            " active"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: styles$3.refreshBtn, onClick: () => void fetchBans(), children: [
          /* @__PURE__ */ jsx(RefreshCw, { size: 12, className: bansLoading ? styles$3.spinning : void 0 }),
          "Refresh"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$3.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$3.table, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "IP Address" }),
          /* @__PURE__ */ jsx("th", { children: "Reason" }),
          /* @__PURE__ */ jsx("th", { children: "Duration" }),
          /* @__PURE__ */ jsx("th", { children: "Banned By" }),
          /* @__PURE__ */ jsx("th", { children: "Banned At" }),
          /* @__PURE__ */ jsx("th", { children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: bansLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: styles$3.empty, children: "Loadingâ€¦" }) }) : bans.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: styles$3.empty, children: "No active bans." }) }) : bans.map((b) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$3.ipCell, children: b.ipAddress }) }),
          /* @__PURE__ */ jsx("td", { children: b.reason || "â€”" }),
          /* @__PURE__ */ jsx("td", { children: b.isPermanent ? /* @__PURE__ */ jsxs("span", { className: `${styles$3.chip} ${styles$3.chipFailed}`, children: [
            /* @__PURE__ */ jsx(Ban, { size: 9 }),
            " Permanent"
          ] }) : /* @__PURE__ */ jsxs("span", { className: `${styles$3.chip} ${styles$3.chipBlocked}`, children: [
            /* @__PURE__ */ jsx(Clock, { size: 9 }),
            " Until ",
            b.expiresAt ? fmtDate(b.expiresAt) : "?"
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: b.bannedBy }),
          /* @__PURE__ */ jsx("td", { children: fmtDate(b.createdAt) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              className: styles$3.unbanBtn,
              onClick: () => void handleUnban(b.ipAddress),
              children: [
                /* @__PURE__ */ jsx(Unlock, { size: 10 }),
                " Unban"
              ]
            }
          ) })
        ] }, b.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$3.panel, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$3.toolbar, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$3.sectionTitle, children: [
          /* @__PURE__ */ jsx(Activity, { size: 15 }),
          "Live IP Activity",
          /* @__PURE__ */ jsx("span", { className: `${styles$3.sectionBadge} ${styles$3.sectionBadgeGreen}`, children: "Auto-refresh 30s" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx(
              Search,
              {
                size: 12,
                style: { position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "#555" }
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: styles$3.filterInput,
                style: { paddingLeft: "1.6rem" },
                placeholder: "Filter IP / user / actionâ€¦",
                value: logFilter,
                onChange: (e) => setLogFilter(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: styles$3.refreshBtn,
              onClick: () => void fetchLogs(),
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { size: 12, className: logsLoading ? styles$3.spinning : void 0 }),
                "Refresh"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$3.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$3.table, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "IP Address" }),
          /* @__PURE__ */ jsx("th", { children: "Device" }),
          /* @__PURE__ */ jsx("th", { children: "OS" }),
          /* @__PURE__ */ jsx("th", { children: "Browser" }),
          /* @__PURE__ */ jsx("th", { children: "User" }),
          /* @__PURE__ */ jsx("th", { children: "Action" }),
          /* @__PURE__ */ jsx("th", { children: "Status" }),
          /* @__PURE__ */ jsx("th", { children: "Time" }),
          /* @__PURE__ */ jsx("th", { children: "Quick Ban" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: logsLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: styles$3.empty, children: "Loading activityâ€¦" }) }) : filteredLogs.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: styles$3.empty, children: logFilter ? "No results match your filter." : "No activity logged yet. Events will appear here after the first login, registration, or purchase." }) }) : filteredLogs.map((log) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$3.ipCell, children: log.ipAddress }) }),
          /* @__PURE__ */ jsx("td", { style: { fontSize: "0.78rem" }, children: log.device || "â€”" }),
          /* @__PURE__ */ jsx("td", { style: { fontSize: "0.78rem" }, children: log.os || "â€”" }),
          /* @__PURE__ */ jsx("td", { style: { fontSize: "0.78rem" }, children: log.browser || "â€”" }),
          /* @__PURE__ */ jsx("td", { style: { fontFamily: "monospace", fontSize: "0.72rem", color: "#888" }, children: log.userId ?? /* @__PURE__ */ jsx("span", { style: { color: "#444" }, children: "guest" }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: styles$3.actionChip, children: log.action || "â€”" }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusChip, { status: log.status }) }),
          /* @__PURE__ */ jsx("td", { style: { color: "#555", fontSize: "0.72rem", whiteSpace: "nowrap" }, children: log.createdAtDisplay || fmtDate(log.createdAt) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              className: styles$3.unbanBtn,
              style: { color: "#f87171", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)" },
              onClick: () => prefillBan(log.ipAddress.replace(" (Local Device)", "")),
              children: [
                /* @__PURE__ */ jsx(Ban, { size: 10 }),
                " Ban"
              ]
            }
          ) })
        ] }, log.id)) })
      ] }) })
    ] })
  ] });
}
const wrap = "_wrap_x9ieg_1";
const toolbar = "_toolbar_x9ieg_11";
const searchInput = "_searchInput_x9ieg_19";
const tableWrap = "_tableWrap_x9ieg_36";
const table = "_table_x9ieg_36";
const row = "_row_x9ieg_66";
const viewBtn = "_viewBtn_x9ieg_74";
const modalOverlay = "_modalOverlay_x9ieg_95";
const modal = "_modal_x9ieg_95";
const modalHeader = "_modalHeader_x9ieg_132";
const closeBtn = "_closeBtn_x9ieg_142";
const metaRow = "_metaRow_x9ieg_157";
const metaItem = "_metaItem_x9ieg_164";
const metaLabel = "_metaLabel_x9ieg_170";
const metaValue = "_metaValue_x9ieg_176";
const messageBox = "_messageBox_x9ieg_181";
const messageLabel = "_messageLabel_x9ieg_189";
const messageBody = "_messageBody_x9ieg_198";
const existingReply = "_existingReply_x9ieg_205";
const replySection = "_replySection_x9ieg_214";
const replyInput = "_replyInput_x9ieg_219";
const sendBtn = "_sendBtn_x9ieg_238";
const styles$2 = {
  wrap,
  toolbar,
  searchInput,
  tableWrap,
  table,
  row,
  viewBtn,
  modalOverlay,
  modal,
  modalHeader,
  closeBtn,
  metaRow,
  metaItem,
  metaLabel,
  metaValue,
  messageBox,
  messageLabel,
  messageBody,
  existingReply,
  replySection,
  replyInput,
  sendBtn
};
const PAGE_SIZE = 15;
function SkeletonRow({ cols }) {
  return /* @__PURE__ */ jsx("tr", { children: Array.from({ length: cols }).map((_, i) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", { style: {
    height: "11px",
    borderRadius: "6px",
    background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    width: i === 0 ? "60%" : i === 2 ? "40%" : "80%"
  } }) }, i)) });
}
function StatusBadge({ status }) {
  const map = {
    open: { label: "Open", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
    answered: { label: "Answered", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    closed: { label: "Closed", color: "#71717a", bg: "rgba(113,113,122,0.12)" }
  };
  const s = map[status] ?? map.open;
  return /* @__PURE__ */ jsx("span", { style: { background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 600 }, children: s.label });
}
function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page2, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=support_tickets", { credentials: "include" });
      let data = {};
      try {
        data = await res.json();
      } catch {
      }
      if (res.status === 401) {
        setError("Session expired — please log in again.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}: ${data.error ?? "Failed to load tickets."}`);
        return;
      }
      setTickets(data.tickets ?? []);
      setPage(0);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);
  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setReplyMsg("");
    try {
      const res = await fetch("/api/admin?action=reply_ticket", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply_ticket", ticketId: selected.id, reply: reply.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyMsg(data.error ?? "Failed to send reply.");
        return;
      }
      setReplyMsg("✓ Reply sent successfully.");
      setReply("");
      setSelected(null);
      await fetchTickets();
    } catch {
      setReplyMsg("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const filtered = tickets.filter(
    (t) => t.subject.toLowerCase().includes(search.toLowerCase()) || t.user_id.toLowerCase().includes(search.toLowerCase()) || t.issue_type.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page2, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const openCount = tickets.filter((t) => t.status === "open").length;
  return /* @__PURE__ */ jsxs("div", { className: styles$2.wrap, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes shimmer { 0%{background-position:200% 0} to{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: styles$2.toolbar, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { position: "relative", flex: 1, maxWidth: 360 }, children: [
          /* @__PURE__ */ jsx(Search, { size: 13, style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" } }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: styles$2.searchInput,
              type: "text",
              placeholder: "Search by subject, user ID, issue type…",
              value: search,
              onChange: (e) => {
                setSearch(e.target.value);
                setPage(0);
              },
              style: { paddingLeft: "30px" }
            }
          )
        ] }),
        openCount > 0 && /* @__PURE__ */ jsxs("span", { style: { background: "rgba(244,63,94,0.15)", color: "#f43f5e", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", border: "1px solid rgba(244,63,94,0.2)" }, children: [
          openCount,
          " open"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => void fetchTickets(),
          disabled: loading,
          style: { display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.72rem", cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { size: 12, style: { animation: loading ? "spin 1s linear infinite" : "none" } }),
            "Refresh"
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginBottom: "0.75rem" }, children: error }),
    /* @__PURE__ */ jsx("div", { className: styles$2.tableWrap, children: /* @__PURE__ */ jsxs("table", { className: styles$2.table, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Ticket ID" }),
        /* @__PURE__ */ jsx("th", { children: "User ID" }),
        /* @__PURE__ */ jsx("th", { children: "Issue Type" }),
        /* @__PURE__ */ jsx("th", { children: "Subject" }),
        /* @__PURE__ */ jsx("th", { children: "Preview" }),
        /* @__PURE__ */ jsx("th", { children: "Screenshot" }),
        /* @__PURE__ */ jsx("th", { children: "Status" }),
        /* @__PURE__ */ jsx("th", { children: "Created" }),
        /* @__PURE__ */ jsx("th", { children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading ? Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonRow, { cols: 9 }, i)) : pageRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, style: { textAlign: "center", color: "#888", padding: "2.5rem", fontSize: "0.82rem" }, children: search ? "No tickets match your search." : "No support tickets yet." }) }) : pageRows.map((t) => /* @__PURE__ */ jsxs("tr", { className: styles$2.row, style: { animation: "fadeIn 0.2s ease" }, children: [
        /* @__PURE__ */ jsxs("td", { style: { fontFamily: "monospace", fontSize: "0.68rem", color: "#999" }, children: [
          t.id.slice(0, 8),
          "…"
        ] }),
        /* @__PURE__ */ jsx("td", { style: { fontFamily: "monospace", fontSize: "0.72rem", color: "#aaa" }, children: t.user_id }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { style: { background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: "10px", fontSize: "0.7rem" }, children: t.issue_type }) }),
        /* @__PURE__ */ jsxs("td", { style: { maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          t.status === "open" && /* @__PURE__ */ jsx("span", { style: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f43f5e", marginRight: 5, verticalAlign: "middle", boxShadow: "0 0 6px #f43f5e" } }),
          t.subject
        ] }),
        /* @__PURE__ */ jsxs("td", { style: { maxWidth: 140, fontSize: "0.72rem", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          t.message.slice(0, 50),
          t.message.length > 50 ? "…" : ""
        ] }),
        /* @__PURE__ */ jsx("td", { children: t.screenshot_url ? /* @__PURE__ */ jsxs(
          "a",
          {
            href: t.screenshot_url,
            target: "_blank",
            rel: "noreferrer",
            style: { color: "#9333ea", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none" },
            children: [
              /* @__PURE__ */ jsx(Eye, { size: 12 }),
              " View"
            ]
          }
        ) : /* @__PURE__ */ jsx("span", { style: { color: "#555", fontSize: "0.7rem" }, children: "—" }) }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusBadge, { status: t.status }) }),
        /* @__PURE__ */ jsx("td", { style: { fontSize: "0.72rem", color: "#888" }, children: new Date(t.created_at).toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$2.viewBtn,
            onClick: () => {
              setSelected(t);
              setReply("");
              setReplyMsg("");
            },
            children: [
              /* @__PURE__ */ jsx(MessageSquare, { size: 12 }),
              " Reply"
            ]
          }
        ) })
      ] }, t.id)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.72rem", color: "#666" }, children: loading ? "Loading…" : `${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} · page ${safePage + 1}/${totalPages}` }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.35rem" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage === 0 || loading,
            onClick: () => setPage((p) => Math.max(0, p - 1)),
            style: { display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage === 0 ? 0.35 : 1 },
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { size: 12 }),
              " Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: safePage >= totalPages - 1 || loading,
            onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
            style: { display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#aaa", fontSize: "0.72rem", cursor: "pointer", opacity: safePage >= totalPages - 1 ? 0.35 : 1 },
            children: [
              "Next ",
              /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
            ]
          }
        )
      ] })
    ] }),
    selected && /* @__PURE__ */ jsx("div", { className: styles$2.modalOverlay, onClick: (e) => {
      if (e.target === e.currentTarget) setSelected(null);
    }, children: /* @__PURE__ */ jsxs("div", { className: styles$2.modal, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$2.modalHeader, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.72rem", color: "#888", marginBottom: 2 }, children: [
            "Ticket #",
            selected.id.slice(0, 12),
            "… · ",
            new Date(selected.created_at).toLocaleString()
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: "1rem", fontWeight: 600, color: "#fff" }, children: selected.subject })
        ] }),
        /* @__PURE__ */ jsx("button", { className: styles$2.closeBtn, onClick: () => setSelected(null), children: /* @__PURE__ */ jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.metaRow, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$2.metaItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$2.metaLabel, children: "User ID" }),
          /* @__PURE__ */ jsx("span", { className: styles$2.metaValue, style: { fontFamily: "monospace" }, children: selected.user_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$2.metaItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$2.metaLabel, children: "Issue Type" }),
          /* @__PURE__ */ jsx("span", { className: styles$2.metaValue, children: selected.issue_type })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$2.metaItem, children: [
          /* @__PURE__ */ jsx("span", { className: styles$2.metaLabel, children: "Status" }),
          /* @__PURE__ */ jsx(StatusBadge, { status: selected.status })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.messageBox, children: [
        /* @__PURE__ */ jsx("div", { className: styles$2.messageLabel, children: "User Message" }),
        /* @__PURE__ */ jsx("div", { className: styles$2.messageBody, children: selected.message })
      ] }),
      selected.screenshot_url && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.25rem" }, children: [
        /* @__PURE__ */ jsx("div", { className: styles$2.messageLabel, style: { marginBottom: "0.5rem" }, children: "Screenshot" }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: selected.screenshot_url,
            target: "_blank",
            rel: "noreferrer",
            style: { display: "inline-flex", alignItems: "center", gap: 5, color: "#9333ea", fontSize: "0.82rem", textDecoration: "none", background: "rgba(147,51,234,0.1)", padding: "0.4rem 0.8rem", borderRadius: 8, border: "1px solid rgba(147,51,234,0.2)" },
            children: [
              /* @__PURE__ */ jsx(ExternalLink, { size: 13 }),
              " View Attached Screenshot"
            ]
          }
        )
      ] }),
      selected.admin_reply && /* @__PURE__ */ jsxs("div", { className: styles$2.existingReply, children: [
        /* @__PURE__ */ jsx("div", { className: styles$2.messageLabel, style: { color: "#4ade80" }, children: "Previous Admin Reply" }),
        /* @__PURE__ */ jsx("div", { style: { color: "#e5e7eb", fontSize: "0.85rem", marginTop: "0.4rem", lineHeight: 1.6 }, children: selected.admin_reply })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.replySection, children: [
        /* @__PURE__ */ jsx("div", { className: styles$2.messageLabel, children: "Admin Reply" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: styles$2.replyInput,
            placeholder: "Type your reply to the user…",
            value: reply,
            onChange: (e) => setReply(e.target.value),
            rows: 4
          }
        ),
        replyMsg && /* @__PURE__ */ jsx("div", { style: { fontSize: "0.8rem", color: replyMsg.startsWith("✓") ? "#4ade80" : "#f87171", marginTop: "0.4rem" }, children: replyMsg }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }, children: /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$2.sendBtn,
            onClick: sendReply,
            disabled: sending || !reply.trim(),
            children: [
              /* @__PURE__ */ jsx(Send, { size: 14 }),
              sending ? "Sending…" : "Send Reply"
            ]
          }
        ) })
      ] })
    ] }) })
  ] });
}
const footer = "_footer_1evww_1";
const info = "_info_1evww_14";
const infoText = "_infoText_1evww_20";
const warning = "_warning_1evww_25";
const logoutBtn = "_logoutBtn_1evww_31";
const styles$1 = {
  footer,
  info,
  infoText,
  warning,
  logoutBtn
};
function AdminFooter() {
  const now = (/* @__PURE__ */ new Date()).toLocaleString();
  return /* @__PURE__ */ jsxs("div", { className: styles$1.footer, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$1.info, children: [
      /* @__PURE__ */ jsxs("p", { className: styles$1.infoText, children: [
        "Last activity: ",
        now,
        " • Session active"
      ] }),
      /* @__PURE__ */ jsx("p", { className: styles$1.warning, children: "⚠ Keep the admin portal URL strictly confidential" })
    ] }),
    /* @__PURE__ */ jsxs(Link, { to: "/login", className: styles$1.logoutBtn, children: [
      /* @__PURE__ */ jsx(LogOut, { size: 14 }),
      " Quick Logout"
    ] })
  ] });
}
const page = "_page_anudl_1";
const inner = "_inner_anudl_8";
const styles = {
  page,
  inner
};
const ADMIN_ALLOWLIST = /* @__PURE__ */ new Set(["forzaxrosan778@gmail.com"]);
async function loader$b({ request }) {
  const session = parseAdminSession(request);
  if (!session) {
    throw redirect(ADMIN_LOGIN_PATH);
  }
  const user = await findUserById(session.userId).catch(() => null);
  if (!user || user.role !== "admin" || !ADMIN_ALLOWLIST.has(user.email.toLowerCase())) {
    throw redirect(ADMIN_LOGIN_PATH);
  }
  return { adminUserId: session.userId, adminEmail: user.email };
}
const adminPortal = UNSAFE_withComponentProps(function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("funds");
  return /* @__PURE__ */ jsxs("div", {
    className: `${styles.page} protected`,
    children: [/* @__PURE__ */ jsx(Watermark, {}), /* @__PURE__ */ jsxs("div", {
      className: styles.inner,
      children: [/* @__PURE__ */ jsx(AdminHeader, {}), /* @__PURE__ */ jsx(AdminNavigationTabs, {
        active: activeTab,
        onChange: setActiveTab
      }), activeTab === "funds" && /* @__PURE__ */ jsx(VirtualFundsManagement, {}), activeTab === "assets" && /* @__PURE__ */ jsx(AssetManagement, {}), activeTab === "analytics" && /* @__PURE__ */ jsx(AnalyticsDashboard, {}), activeTab === "ledger" && /* @__PURE__ */ jsx(TransactionLedger, {}), activeTab === "users" && /* @__PURE__ */ jsx(UsersList, {}), activeTab === "generator" && /* @__PURE__ */ jsx(BinGenerator, {}), activeTab === "security" && /* @__PURE__ */ jsx(IpSecurity, {}), activeTab === "support" && /* @__PURE__ */ jsx(SupportTickets, {}), /* @__PURE__ */ jsx(AdminFooter, {})]
    })]
  });
});
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: adminPortal,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
function json$b(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
async function action$9({ request }) {
  const { createUser: createUser2, ensureSeeded: ensureSeeded2 } = await Promise.resolve().then(() => db_server);
  const { createSessionCookie: createSessionCookie2 } = await Promise.resolve().then(() => session_server);
  const { registerLimiter } = await import("./rate-limiter.server-DO9B44_3.js");
  const { logSecurityEvent: logSecurityEvent2, sanitizeEmail: sanitizeEmail2, sanitizeString: sanitizeString2, isValidEmail: isValidEmail2 } = await Promise.resolve().then(() => securityLog_server);
  const { getClientIp: getClientIp2, isIpBanned: isIpBanned2, logIpActivity: logIpActivity2, bannedResponse: bannedResponse2 } = await Promise.resolve().then(() => ipSecurity_server);
  const { logMissingUserAuthEnv: logMissingUserAuthEnv2 } = await Promise.resolve().then(() => env_server);
  const { logServerError } = await import("./server-logging.server-CpsHFAnL.js");
  if (request.method !== "POST") {
    return json$b({ error: "Method not allowed" }, { status: 405 });
  }
  const missingEnv = logMissingUserAuthEnv2("api/register");
  if (missingEnv.length > 0) {
    return json$b(
      {
        error: "Registration is not configured on the server. Set SUPABASE_URL, SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY on Vercel."
      },
      { status: 503 }
    );
  }
  const ip = getClientIp2(request);
  if (await isIpBanned2(ip)) {
    logIpActivity2(request, { action: "register", status: "blocked" });
    return bannedResponse2();
  }
  if (!registerLimiter.check(ip)) {
    const retryAfter = registerLimiter.retryAfterSeconds(ip);
    logSecurityEvent2("RATE_LIMITED", ip, { detail: "register" });
    return json$b(
      { error: `Registration limit reached. Try again in ${retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$b({ error: "Invalid request body" }, { status: 400 });
  }
  const email = sanitizeEmail2(body2.email);
  const name = sanitizeString2(body2.name, 80);
  const password = typeof body2.password === "string" ? body2.password.trim() : "";
  if (!email || !isValidEmail2(email)) {
    return json$b({ error: "Invalid email address" }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return json$b({ error: "Name must be at least 2 characters" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return json$b({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (password.length > 128) {
    return json$b({ error: "Password too long" }, { status: 400 });
  }
  try {
    await ensureSeeded2();
    const user = await createUser2(email, name, password);
    if (!user) {
      logSecurityEvent2("REGISTER_FAILED", ip, { email, detail: "email_taken" });
      logIpActivity2(request, { action: "register", status: "failed" });
      return json$b({ error: "Email address already registered" }, { status: 409 });
    }
    logSecurityEvent2("LOGIN_SUCCESS", ip, { email, userId: user.id, detail: "register" });
    logIpActivity2(request, { userId: user.id, action: "register", status: "success" });
    const sessionCookie = createSessionCookie2({ userId: user.id, role: user.role }, request);
    return json$b(
      { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201, headers: { "Set-Cookie": sessionCookie } }
    );
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : String(err);
    logServerError("api/register", err);
    registerLimiter.reset(ip);
    return json$b(
      {
        error: msg2.includes("RLS") || msg2.includes("service_role") ? "Registration failed: database not configured. Contact support." : "Registration temporarily unavailable. Please try again."
      },
      { status: 503 }
    );
  }
}
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$9
}, Symbol.toStringTag, { value: "Module" }));
const MAX_FAILED_ATTEMPTS$1 = 5;
const LOCK_DURATION_MS$1 = 10 * 60 * 1e3;
async function getLockStatus(userId2) {
  const { data } = await supabase.from("users").select("failed_attempts, locked_until").eq("id", userId2).maybeSingle();
  const failedAttempts = Number(data?.failed_attempts ?? 0);
  const lockedUntil = data?.locked_until ? Number(data.locked_until) : null;
  const now = Date.now();
  const locked = lockedUntil !== null && now < lockedUntil;
  const remainingMs = locked ? lockedUntil - now : 0;
  if (lockedUntil !== null && !locked) {
    await supabase.from("users").update({ failed_attempts: 0, locked_until: null }).eq("id", userId2);
    return { locked: false, failedAttempts: 0, remainingMs: 0, lockedUntil: null };
  }
  return { locked, failedAttempts, remainingMs, lockedUntil };
}
async function recordFailedAttempt(userId2) {
  const { data } = await supabase.from("users").select("failed_attempts").eq("id", userId2).maybeSingle();
  const newCount = Number(data?.failed_attempts ?? 0) + 1;
  const now = Date.now();
  const shouldLock = newCount >= MAX_FAILED_ATTEMPTS$1;
  const lockedUntil = shouldLock ? now + LOCK_DURATION_MS$1 : null;
  await supabase.from("users").update({
    failed_attempts: newCount,
    locked_until: lockedUntil
  }).eq("id", userId2);
  console.log(
    `[login-lock] userId=${userId2} failed_attempts=${newCount}` + (shouldLock ? ` → LOCKED for 10min` : "")
  );
  return {
    locked: shouldLock,
    failedAttempts: newCount,
    remainingMs: shouldLock ? LOCK_DURATION_MS$1 : 0,
    lockedUntil
  };
}
async function resetLoginLock(userId2) {
  await supabase.from("users").update({ failed_attempts: 0, locked_until: null }).eq("id", userId2);
}
async function unlockByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const { data } = await supabase.from("users").select("id, failed_attempts, locked_until").eq("email", normalizedEmail).maybeSingle();
  if (!data) return { found: false, was_locked: false, email: normalizedEmail };
  const was_locked = data.locked_until !== null && Date.now() < Number(data.locked_until);
  await supabase.from("users").update({ failed_attempts: 0, locked_until: null }).eq("id", data.id);
  console.log(`[login-lock] BYPASS unlock: ${normalizedEmail} (was_locked=${was_locked})`);
  return { found: true, was_locked, email: normalizedEmail };
}
async function getLockedAccounts() {
  const now = Date.now();
  const { data } = await supabase.from("users").select("id, email, failed_attempts, locked_until").not("locked_until", "is", null).gt("locked_until", now);
  return (data ?? []).map((row2) => ({
    id: row2.id,
    email: row2.email,
    failedAttempts: Number(row2.failed_attempts),
    lockedUntil: Number(row2.locked_until),
    remainingMs: Number(row2.locked_until) - now
  }));
}
const BYPASS_SECRET = getServerEnv("BYPASS_SECRET") ?? "";
function isValidBypassToken(token) {
  if (!BYPASS_SECRET || !token || token.length < 8) return false;
  try {
    const len = Math.max(token.length, BYPASS_SECRET.length, 32);
    const a = Buffer.alloc(len);
    const b = Buffer.alloc(len);
    a.write(token);
    b.write(BYPASS_SECRET);
    return timingSafeEqual(a, b) && token === BYPASS_SECRET;
  } catch {
    return token === BYPASS_SECRET;
  }
}
const loginLock_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LOCK_DURATION_MS: LOCK_DURATION_MS$1,
  MAX_FAILED_ATTEMPTS: MAX_FAILED_ATTEMPTS$1,
  getLockStatus,
  getLockedAccounts,
  isValidBypassToken,
  recordFailedAttempt,
  resetLoginLock,
  unlockByEmail
}, Symbol.toStringTag, { value: "Module" }));
async function action$8({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const body2 = await request.json();
  const email = body2.email?.toLowerCase().trim();
  const name = body2.name?.trim();
  const createdDate = body2.createdDate;
  const walletBalance = Number(body2.walletBalance);
  const totalPurchases = Number(body2.totalPurchases);
  const newPassword = body2.newPassword;
  if (!email || !name || !createdDate || isNaN(walletBalance) || isNaN(totalPurchases) || !newPassword) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }
  const { data: user } = await supabase.from("users").select("id, email, name, created_at, wallet_usd").eq("email", email).maybeSingle();
  if (!user) {
    return Response.json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });
  }
  const lock = await getLockStatus(user.id);
  if (lock.locked) {
    return Response.json({ error: "Account locked. Please try again later.", lockedUntil: lock.lockedUntil }, { status: 403 });
  }
  let failed = false;
  if (user.name.toLowerCase() !== name.toLowerCase()) failed = true;
  const dbDateStr = new Date(Number(user.created_at)).toISOString().split("T")[0];
  if (dbDateStr !== createdDate) failed = true;
  const finalDbBalance = Number(user.wallet_usd);
  if (finalDbBalance !== walletBalance * 100) failed = true;
  const orders = await getUserOrders(user.id, 1e4);
  if (orders.length !== totalPurchases) failed = true;
  if (failed) {
    const newLock = await recordFailedAttempt(user.id);
    if (newLock.locked) {
      return Response.json({ error: "Account locked due to too many failed recovery attempts.", lockedUntil: newLock.lockedUntil }, { status: 403 });
    }
    return Response.json({ error: "Recovery failed. Your details did not match our records." }, { status: 401 });
  }
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  const { error } = await supabase.from("users").update({ password_hash: passwordHash }).eq("id", user.id);
  if (error) {
    return Response.json({ error: "Database error during reset." }, { status: 500 });
  }
  await resetLoginLock(user.id);
  return Response.json({ success: true });
}
const route26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8
}, Symbol.toStringTag, { value: "Module" }));
function json$a(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1e3);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
async function loader$a({ request }) {
  const { destroySessionCookie: destroySessionCookie2, parseSession: parseSession2 } = await Promise.resolve().then(() => session_server);
  const { logSecurityEvent: logSecurityEvent2 } = await Promise.resolve().then(() => securityLog_server);
  const { getClientIp: getClientIp2 } = await Promise.resolve().then(() => ipSecurity_server);
  const url2 = new URL(request.url);
  if (url2.searchParams.get("action") === "logout") {
    const session2 = parseSession2(request);
    if (session2) {
      logSecurityEvent2("LOGIN_SUCCESS", getClientIp2(request), {
        userId: session2.userId,
        detail: "logout"
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": destroySessionCookie2()
      }
    });
  }
  const session = parseSession2(request);
  if (!session) return json$a({ authenticated: false });
  return json$a({ authenticated: true, userId: session.userId, role: session.role });
}
async function action$7({ request }) {
  const { findUserByEmail: findUserByEmail2, verifyPassword: verifyPassword2, ensureSeeded: ensureSeeded2 } = await Promise.resolve().then(() => db_server);
  const { createSessionCookie: createSessionCookie2 } = await Promise.resolve().then(() => session_server);
  const { loginLimiter } = await import("./rate-limiter.server-DO9B44_3.js");
  const { logSecurityEvent: logSecurityEvent2, sanitizeEmail: sanitizeEmail2, isValidEmail: isValidEmail2 } = await Promise.resolve().then(() => securityLog_server);
  const { getLockStatus: getLockStatus2, recordFailedAttempt: recordFailedAttempt2, resetLoginLock: resetLoginLock2, MAX_FAILED_ATTEMPTS: MAX_FAILED_ATTEMPTS2 } = await Promise.resolve().then(() => loginLock_server);
  const { getClientIp: getClientIp2, isIpBanned: isIpBanned2, logIpActivity: logIpActivity2, bannedResponse: bannedResponse2 } = await Promise.resolve().then(() => ipSecurity_server);
  const { logMissingUserAuthEnv: logMissingUserAuthEnv2 } = await Promise.resolve().then(() => env_server);
  const { logServerError } = await import("./server-logging.server-CpsHFAnL.js");
  if (request.method !== "POST") {
    return json$a({ error: "Method not allowed" }, { status: 405 });
  }
  const missingEnv = logMissingUserAuthEnv2("api/login");
  if (missingEnv.length > 0) {
    return json$a(
      {
        error: "Authentication is not configured on the server. Set SUPABASE_URL, SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY for Production/Preview on Vercel."
      },
      { status: 503 }
    );
  }
  const ip = getClientIp2(request);
  if (await isIpBanned2(ip)) {
    logIpActivity2(request, { action: "login", status: "blocked" });
    return bannedResponse2();
  }
  if (!loginLimiter.check(ip)) {
    const retryAfter = loginLimiter.retryAfterSeconds(ip);
    logSecurityEvent2("RATE_LIMITED", ip, { detail: "login" });
    return json$a(
      { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$a({ error: "Invalid request body" }, { status: 400 });
  }
  const email = sanitizeEmail2(body2.email);
  const password = typeof body2.password === "string" ? body2.password : "";
  if (!email || !isValidEmail2(email)) {
    return json$a({ error: "Invalid email address" }, { status: 400 });
  }
  if (!password || password.length < 1) {
    return json$a({ error: "Password is required" }, { status: 400 });
  }
  if (password.length > 128) {
    return json$a({ error: "Invalid credentials" }, { status: 401 });
  }
  try {
    await ensureSeeded2();
    const user = await findUserByEmail2(email);
    if (user) {
      const lock = await getLockStatus2(user.id);
      if (lock.locked) {
        const timeLeft = formatRemaining(lock.remainingMs);
        logSecurityEvent2("LOGIN_BLOCKED", ip, {
          email,
          userId: user.id,
          detail: `account_locked_${timeLeft}_remaining`
        });
        return json$a(
          {
            error: `Account is locked. Too many failed attempts.
Please try again in ${timeLeft} or contact support.`,
            locked: true,
            remainingMs: lock.remainingMs,
            lockedUntil: lock.lockedUntil
          },
          { status: 423 }
          // 423 Locked
        );
      }
    }
    const passwordValid = user ? await verifyPassword2(user, password) : false;
    if (!user || !passwordValid) {
      if (user) {
        const lockStatus = await recordFailedAttempt2(user.id);
        const attemptsLeft = MAX_FAILED_ATTEMPTS2 - lockStatus.failedAttempts;
        if (lockStatus.locked) {
          logSecurityEvent2("ACCOUNT_LOCKED", ip, {
            email,
            userId: user.id,
            detail: `locked_after_${lockStatus.failedAttempts}_attempts`
          });
          return json$a(
            {
              error: `Account locked for 10 minutes due to too many failed attempts.
Contact support or try again later.`,
              locked: true,
              remainingMs: lockStatus.remainingMs,
              lockedUntil: lockStatus.lockedUntil
            },
            { status: 423 }
          );
        }
        if (attemptsLeft <= 2 && attemptsLeft > 0) {
          logSecurityEvent2("LOGIN_FAILED", ip, { email, detail: "wrong_password" });
          return json$a(
            {
              error: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before account lock.`
            },
            { status: 401 }
          );
        }
      }
      logSecurityEvent2("LOGIN_FAILED", ip, { email, detail: user ? "wrong_password" : "no_user" });
      logIpActivity2(request, { userId: user?.id, action: "login", status: "failed" });
      return json$a({ error: "Invalid credentials" }, { status: 401 });
    }
    await resetLoginLock2(user.id);
    loginLimiter.reset(ip);
    logSecurityEvent2("LOGIN_SUCCESS", ip, { email, userId: user.id });
    logIpActivity2(request, { userId: user.id, action: "login", status: "success" });
    const sessionCookie = createSessionCookie2({ userId: user.id, role: user.role }, request);
    return json$a(
      { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { headers: { "Set-Cookie": sessionCookie } }
    );
  } catch (err) {
    logServerError("api/login", err);
    return json$a(
      { error: "Service temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
const route27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$7,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
function json$9(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      // balance must always be fresh
      ...init?.headers ?? {}
    }
  });
}
async function loader$9({ request }) {
  const t0 = Date.now();
  await ensureSeeded();
  const session = parseSession(request);
  if (!session) {
    return json$9({ error: "Unauthorized" }, { status: 401 });
  }
  const [user, walletUsd, deposits, transactions] = await Promise.all([
    findUserById(session.userId),
    getWalletBalance(session.userId),
    getUserDeposits(session.userId, 20),
    getUserTransactions(session.userId, 50)
  ]);
  if (!user) return json$9({ error: "User not found" }, { status: 404 });
  console.log(`[api/user] ${Date.now() - t0}ms userId=${session.userId} wallet_usd=${walletUsd}`);
  return json$9({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletUsd,
    walletDisplay: (walletUsd / 100).toFixed(2),
    totalDepositedUsd: user.totalDepositedUsd,
    totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
    deposits: deposits.map((d) => ({
      id: d.id,
      orderSn: d.orderSn,
      amountInr: d.amountInrPaise / 100,
      amountUsd: (d.amountUsdCents / 100).toFixed(2),
      status: d.status,
      createdAt: d.createdAt
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: (t.amountUsdCents / 100).toFixed(2),
      balanceAfter: (t.balanceAfterCents / 100).toFixed(2),
      description: t.description,
      createdAt: t.createdAt
    }))
  });
}
const route28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
function json$8(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=10",
      ...{}
    }
  });
}
async function loader$8({ request }) {
  const t0 = Date.now();
  await ensureSeeded();
  let session;
  try {
    session = requireSession(request);
  } catch (res) {
    return res;
  }
  const url2 = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url2.searchParams.get("limit") ?? "30")));
  const orders = await getUserOrders(session.userId, limit);
  const uniqueProductIds = [...new Set(orders.map((o) => o.productId))];
  const productResults = await Promise.all(uniqueProductIds.map((id) => getProductById(id)));
  const productMap = new Map(productResults.filter(Boolean).map((p) => [p.id, p]));
  const enriched = orders.map((order) => {
    const product = productMap.get(order.productId);
    return {
      id: order.id,
      status: order.status,
      amountUsd: (order.amountUsdCents / 100).toFixed(2),
      createdAt: order.createdAt,
      product: product ? {
        id: product.id,
        name: product.name,
        provider: product.provider,
        type: product.type,
        country: product.country,
        countryFlag: product.countryFlag,
        bank: product.bank
      } : null,
      cardDetails: order.status === "completed" ? order.cardDetails : null
    };
  });
  console.log(`[api/orders] ${Date.now() - t0}ms user=${session.userId} count=${enriched.length}`);
  return json$8({ orders: enriched });
}
const route29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
function json$7(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      ...{}
    }
  });
}
async function loader$7({ request }) {
  const t0 = Date.now();
  await ensureSeeded();
  const url2 = new URL(request.url);
  const validOnly = url2.searchParams.get("valid") === "1";
  const products = await getPublicProducts({ validOnly });
  console.log(`[api/products] ${Date.now() - t0}ms count=${products.length} validOnly=${validOnly}`);
  return json$7({
    products: products.map((p) => ({
      id: p.id,
      bin: p.bin,
      provider: p.provider,
      type: p.type,
      country: p.country,
      countryFlag: p.countryFlag,
      price: p.priceUsdCents / 100,
      limit: p.limitUsd,
      expiry: p.expiry,
      bank: p.bank,
      cardholder_name: p.fullName ?? null,
      name: p.name,
      street: p.street,
      city: p.city,
      state: p.state,
      address: p.address,
      zip: p.zip,
      extras: p.extras,
      validUntil: p.validUntil,
      color: p.color,
      is_valid: p.isValid,
      is_100_valid: p.isValid,
      tag: p.tag ?? null,
      status: p.status,
      stock: p.stock
    }))
  });
}
const route30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
function json$6(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
async function action$6({ request }) {
  if (request.method !== "POST") {
    return json$6({ error: "Method not allowed" }, { status: 405 });
  }
  await ensureSeeded();
  const ip = getClientIp(request);
  if (await isIpBanned(ip)) {
    logIpActivity(request, { action: "purchase", status: "blocked" });
    return bannedResponse();
  }
  const session = parseSession(request);
  if (!session) return json$6({ error: "Unauthorized" }, { status: 401 });
  console.log("USER [purchase]:", session.userId);
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$6({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { productId } = body2;
  if (!productId || typeof productId !== "string") {
    return json$6({ error: "productId is required" }, { status: 400 });
  }
  const user = await findUserById(session.userId);
  if (!user) return json$6({ error: "User not found" }, { status: 404 });
  const product = await getProductById(productId);
  if (!product) return json$6({ error: "Product not found" }, { status: 404 });
  if (product.status !== "in_stock" || product.stock <= 0) {
    return json$6({ error: "This card is no longer available" }, { status: 409 });
  }
  const effectiveBalance = await getWalletBalance(session.userId);
  console.log("WALLET [purchase]:", effectiveBalance);
  if (effectiveBalance < product.priceUsdCents) {
    return json$6(
      {
        error: "Insufficient wallet balance",
        required: (product.priceUsdCents / 100).toFixed(2),
        available: (effectiveBalance / 100).toFixed(2)
      },
      { status: 402 }
    );
  }
  const sold = await decrementProductStockAfterPurchase(productId);
  if (!sold) {
    return json$6({ error: "This card was just purchased by another user" }, { status: 409 });
  }
  const order = await createOrder(session.userId, productId, product.priceUsdCents);
  await adjustWallet(
    session.userId,
    -product.priceUsdCents,
    "purchase",
    `Purchase: ${product.provider} ${product.type} – ${product.country}`,
    order.id
  );
  const cardDetails2 = {
    cardNumber: product.cardNumber ?? "N/A",
    cvv: product.cvv ?? "N/A",
    expiry: product.expiry,
    fullName: product.fullName ?? "N/A",
    bin: product.bin,
    bank: product.bank
  };
  await completeOrder(order.id, cardDetails2);
  logIpActivity(request, { userId: session.userId, action: "purchase", status: "success" });
  return json$6({
    success: true,
    orderId: order.id,
    message: "Purchase successful",
    card: {
      cardNumber: cardDetails2.cardNumber,
      cvv: cardDetails2.cvv,
      expiry: cardDetails2.expiry,
      fullName: cardDetails2.fullName,
      bin: cardDetails2.bin,
      bank: cardDetails2.bank,
      provider: product.provider,
      country: product.country,
      countryFlag: product.countryFlag
    },
    newBalance: ((effectiveBalance - product.priceUsdCents) / 100).toFixed(2)
  });
}
const route31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: "Module" }));
const APP_ID = getServerEnv("LGPAY_APP_ID") ?? "";
const SECRET_KEY = getServerEnv("LGPAY_SECRET_KEY") ?? "";
const GATEWAY_URL = "https://www.lg-pay.com/api/order/create";
const TRADE_TYPE = "INRUPI";
const INR_PER_USD = 95;
function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  const parts = sortedKeys.map((k) => `${k}=${params[k]}`);
  const raw = parts.join("&") + `&key=${SECRET_KEY}`;
  return crypto$1.createHash("md5").update(raw, "utf8").digest("hex").toUpperCase();
}
function verifyCallbackSignature(params) {
  if (!params.sign) return false;
  const receivedSign = params.sign.toUpperCase();
  const filtered = {};
  for (const [k, v] of Object.entries(params)) {
    if (k !== "sign" && v !== "") filtered[k] = v;
  }
  const expected = generateSignature(filtered);
  try {
    return crypto$1.timingSafeEqual(Buffer.from(receivedSign), Buffer.from(expected));
  } catch {
    return false;
  }
}
function inrToPaise(inr) {
  return Math.round(inr * 100);
}
function inrPaiseToUsdCents(paise) {
  const inr = paise / 100;
  const usd = inr / INR_PER_USD;
  return Math.floor(usd * 100);
}
async function createLgPayOrder(params) {
  const paise = inrToPaise(params.amountInr);
  const payload = {
    app_id: APP_ID,
    trade_type: TRADE_TYPE,
    order_sn: params.orderSn,
    money: paise,
    notify_url: params.notifyUrl,
    ip: params.userIp
  };
  const sign2 = generateSignature(payload);
  const body2 = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    body2.append(k, String(v));
  }
  body2.append("sign", sign2);
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body2.toString()
  });
  if (!res.ok) {
    throw new Error(`LG-Pay HTTP error: ${res.status}`);
  }
  const data = await res.json();
  return {
    status: data.status,
    msg: data.msg,
    payUrl: data.data?.pay_url,
    orderSn: data.data?.order_sn
  };
}
function json$5(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
const MIN_INR = 2e3;
async function action$5({ request }) {
  if (request.method !== "POST") {
    return json$5({ error: "Method not allowed" }, { status: 405 });
  }
  await ensureSeeded();
  const cookieHeader = request.headers.get("Cookie");
  console.log(`[deposit/create] Incoming cookie header: ${cookieHeader ? cookieHeader.substring(0, 120) : "(none)"}`);
  const session = parseSession(request);
  if (!session) {
    console.warn("[deposit/create] Session parse failed — returning 401");
    return json$5({ error: "Unauthorized — please log in" }, { status: 401 });
  }
  console.log(`[deposit/create] Authenticated userId=${session.userId}`);
  const user = await findUserById(session.userId);
  if (!user) {
    console.warn(`[deposit/create] userId=${session.userId} not found in DB`);
    return json$5({ error: "User not found" }, { status: 404 });
  }
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$5({ error: "Invalid JSON body" }, { status: 400 });
  }
  const amountInr = Number(body2.amountInr);
  if (!Number.isFinite(amountInr) || amountInr < MIN_INR) {
    return json$5({ error: `Minimum deposit amount is ${MIN_INR} INR` }, { status: 400 });
  }
  const orderSn = `CC${Date.now()}${crypto$1.randomBytes(4).toString("hex").toUpperCase()}`;
  const origin = new URL(request.url).origin;
  const notifyUrl = `${origin}/api/deposit/callback`;
  const userIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
  console.log(`[deposit/create] orderSn=${orderSn} amountInr=${amountInr} notifyUrl=${notifyUrl}`);
  let payUrl;
  let gatewayError = null;
  try {
    const lgResponse = await createLgPayOrder({
      orderSn,
      amountInr,
      notifyUrl,
      userIp
    });
    console.log(`[deposit/create] LG-Pay response:`, JSON.stringify(lgResponse));
    if (lgResponse.status === 1 && lgResponse.payUrl) {
      payUrl = lgResponse.payUrl;
    } else {
      gatewayError = lgResponse.msg || "Payment gateway error";
    }
  } catch (err) {
    console.error("[deposit/create] LG-Pay create order failed:", err);
    gatewayError = "Could not connect to payment gateway. Please try again.";
  }
  const paise = inrToPaise(amountInr);
  const usdCents = inrPaiseToUsdCents(paise);
  const deposit = await createDeposit(session.userId, orderSn, paise, usdCents);
  if (gatewayError || !payUrl) {
    return json$5(
      {
        error: gatewayError ?? "No payment URL returned by gateway",
        depositId: deposit.id,
        orderSn
      },
      { status: 502 }
    );
  }
  console.log(`[deposit/create] Success! payUrl=${payUrl}`);
  return json$5({
    success: true,
    depositId: deposit.id,
    orderSn,
    payUrl,
    amountInr,
    amountUsd: (usdCents / 100).toFixed(2)
  });
}
const route32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
const OK_RESPONSE = new Response("ok", {
  status: 200,
  headers: { "Content-Type": "text/plain" }
});
async function action$4({ request }) {
  await ensureSeeded();
  let params;
  try {
    const text = await request.text();
    const urlParams = new URLSearchParams(text);
    params = Object.fromEntries(urlParams.entries());
  } catch {
    return OK_RESPONSE;
  }
  const { order_sn, status, sign: sign2, money } = params;
  if (!order_sn || !status || !sign2) {
    console.warn("[Callback] Missing required fields", { order_sn, status });
    return OK_RESPONSE;
  }
  const signatureValid = verifyCallbackSignature(params);
  if (!signatureValid) {
    console.error("[Callback] INVALID SIGNATURE for order:", order_sn);
    return OK_RESPONSE;
  }
  if (await isCallbackProcessed(order_sn)) {
    console.log("[Callback] Already processed, skipping:", order_sn);
    return OK_RESPONSE;
  }
  const deposit = await findDepositByOrderSn(order_sn);
  if (!deposit) {
    console.warn("[Callback] No deposit found for order_sn:", order_sn);
    return OK_RESPONSE;
  }
  if (deposit.status !== "pending") {
    console.log("[Callback] Deposit already settled:", order_sn, deposit.status);
    return OK_RESPONSE;
  }
  if (status === "1") {
    try {
      await markCallbackProcessed(order_sn);
      await updateDepositSuccess(deposit.id, deposit.userId);
      console.log(
        `[Callback] SUCCESS — order: ${order_sn}, INR paise: ${money ?? deposit.amountInrPaise}, user: ${deposit.userId}`
      );
    } catch (err) {
      console.error("[Callback] Failed to update wallet:", err);
    }
  } else {
    markCallbackProcessed(order_sn);
    console.log(`[Callback] FAILED/CANCELLED — order: ${order_sn}, status: ${status}`);
  }
  return OK_RESPONSE;
}
async function loader$6() {
  return OK_RESPONSE;
}
const route33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
function json$4(data, init) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { "Content-Type": "application/json", ...{} }
  });
}
async function loader$5() {
  const { getServerEnv: getServerEnv2 } = await Promise.resolve().then(() => env_server);
  const urlSet = !!getServerEnv2("SUPABASE_URL");
  const anonKeySet = !!getServerEnv2("SUPABASE_ANON_KEY");
  const serviceKeySet = !!getServerEnv2("SUPABASE_SERVICE_KEY");
  const expectedEnv = getExpectedServerEnv();
  const missingRequiredEnv = getMissingServerEnv(expectedEnv.required);
  const missingAuthEnv = getMissingServerEnv(expectedEnv.authWrites);
  const conn = await testSupabaseConnection();
  const tableChecks = {};
  const tables = ["users", "products", "orders", "transactions", "deposits", "settings", "processed_callbacks"];
  await Promise.all(
    tables.map(async (table2) => {
      const { error } = await supabase.from(table2).select("*").limit(1);
      tableChecks[table2] = !error;
    })
  );
  const allTablesExist = Object.values(tableChecks).every(Boolean);
  return json$4({
    status: conn.ok && allTablesExist ? "ok" : "error",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: {
      SUPABASE_URL: urlSet ? getServerEnv2("SUPABASE_URL") : "NOT SET",
      SUPABASE_ANON_KEY: anonKeySet ? "set" : "NOT SET",
      SUPABASE_SERVICE_KEY: serviceKeySet ? "set (using this)" : "NOT SET",
      SESSION_SECRET: hasServerEnv("SESSION_SECRET") ? "set" : "NOT SET",
      ADMIN_SESSION_SECRET: hasServerEnv("ADMIN_SESSION_SECRET") ? "set" : "NOT SET",
      LGPAY_APP_ID: hasServerEnv("LGPAY_APP_ID") ? "set" : "NOT SET",
      LGPAY_SECRET_KEY: hasServerEnv("LGPAY_SECRET_KEY") ? "set" : "NOT SET",
      BYPASS_SECRET: hasServerEnv("BYPASS_SECRET") ? "set" : "NOT SET"
    },
    missing_env: {
      required: missingRequiredEnv,
      auth_writes: missingAuthEnv
    },
    supabase: {
      connected: conn.ok,
      usingServiceKey: conn.usingServiceKey,
      error: conn.error ?? null
    },
    tables: tableChecks,
    migration_needed: !allTablesExist,
    migration_url: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/sql/new",
    service_key_url: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/settings/api",
    instructions: !serviceKeySet ? "SUPABASE_SERVICE_KEY missing — auth writes and admin actions will fail until it is added to Vercel." : allTablesExist ? "All tables exist and the service key is set. System operational." : "Some tables are missing. Run db-migrate.sql in the Supabase SQL Editor."
  });
}
const route34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
function json$3(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
async function loader$4({ request }) {
  const { destroyAdminSessionCookie: destroyAdminSessionCookie2, parseAdminSession: parseAdminSession2 } = await Promise.resolve().then(() => session_server);
  const { getClientIp: getClientIp2 } = await import("./rate-limiter.server-DO9B44_3.js");
  const { logSecurityEvent: logSecurityEvent2 } = await Promise.resolve().then(() => securityLog_server);
  const url2 = new URL(request.url);
  if (url2.searchParams.get("action") === "logout") {
    const session2 = parseAdminSession2(request);
    if (session2) {
      logSecurityEvent2("ADMIN_ACTION", getClientIp2(request), {
        userId: session2.userId,
        detail: "admin_logout"
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": destroyAdminSessionCookie2()
      }
    });
  }
  const session = parseAdminSession2(request);
  if (!session) return json$3({ authenticated: false });
  return json$3({ authenticated: true, userId: session.userId, role: session.role });
}
async function action$3({ request }) {
  const { ensureAdminUser: ensureAdminUser2 } = await Promise.resolve().then(() => db_server);
  const { createAdminSessionCookie: createAdminSessionCookie2 } = await Promise.resolve().then(() => session_server);
  const { getClientIp: getClientIp2 } = await import("./rate-limiter.server-DO9B44_3.js");
  const { logSecurityEvent: logSecurityEvent2, sanitizeEmail: sanitizeEmail2, isValidEmail: isValidEmail2 } = await Promise.resolve().then(() => securityLog_server);
  const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
  const { logMissingAdminAuthEnv: logMissingAdminAuthEnv2 } = await Promise.resolve().then(() => env_server);
  const { logServerError } = await import("./server-logging.server-CpsHFAnL.js");
  const bcrypt2 = await import("bcryptjs").then((m) => m.default || m);
  if (request.method !== "POST") {
    return json$3({ error: "Method not allowed" }, { status: 405 });
  }
  const missingEnv = logMissingAdminAuthEnv2("api/admin-auth");
  if (missingEnv.length > 0) {
    return json$3(
      {
        error: "Admin authentication is not configured on the server. Set SUPABASE_URL, ADMIN_SESSION_SECRET, and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY on Vercel."
      },
      { status: 503 }
    );
  }
  const ip = getClientIp2(request);
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$3({ error: "Invalid credentials" }, { status: 401 });
  }
  const email = sanitizeEmail2(body2.email).toLowerCase().trim();
  const password = typeof body2.password === "string" ? body2.password : "";
  if (!email || !isValidEmail2(email) || !password || password.length > 128) {
    return json$3({ error: "Invalid credentials" }, { status: 401 });
  }
  try {
    await ensureAdminUser2();
    console.log("[admin-auth] querying DB for:", email);
    const { data: row2, error: dbErr } = await supabase2.from("users").select("id, email, password_hash, role").eq("email", email).maybeSingle();
    if (dbErr) {
      console.error("[admin-auth] DB error:", dbErr.message);
      return json$3({ error: "Service temporarily unavailable." }, { status: 503 });
    }
    console.log("[admin-auth] row found:", row2 ? `id=${row2.id} role=${row2.role}` : "null");
    const storedPassword = row2?.password_hash;
    if (!row2 || !storedPassword) {
      logSecurityEvent2("ADMIN_LOGIN_FAILED", ip, {
        email,
        detail: !row2 ? "no_user" : "missing_password_hash"
      });
      return json$3({ error: "Invalid credentials" }, { status: 401 });
    }
    const passwordMatch = await bcrypt2.compare(password, storedPassword);
    console.log("LOGIN DEBUG:", {
      email,
      userFound: !!row2,
      passwordMatch,
      role: row2?.role
    });
    if (!passwordMatch || row2.role !== "admin") {
      logSecurityEvent2("ADMIN_LOGIN_FAILED", ip, {
        email,
        detail: !passwordMatch ? "wrong_password" : "not_admin_role"
      });
      return json$3({ error: "Invalid credentials" }, { status: 401 });
    }
    logSecurityEvent2("ADMIN_LOGIN_SUCCESS", ip, { email, userId: row2.id });
    const adminCookie = createAdminSessionCookie2(
      { userId: row2.id, role: "admin" },
      request
    );
    console.log("[admin-auth] LOGIN SUCCESS for", email);
    return json$3(
      { success: true, admin: { id: row2.id, email: row2.email } },
      { headers: { "Set-Cookie": adminCookie } }
    );
  } catch (err) {
    logServerError("admin-auth", err);
    return json$3({ error: "Service temporarily unavailable." }, { status: 503 });
  }
}
const route35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function json$2(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
}
async function loader$3({ request }) {
  const {
    getAdminStats: getAdminStats2,
    getAllUsers: getAllUsers2,
    getAllOrders: getAllOrders2,
    getAllProducts: getAllProducts2,
    getProductById: getProductById2,
    findUserById: findUserById2,
    findUserByQuery: findUserByQuery2,
    ensureSeeded: ensureSeeded2,
    getWalletBalance: getWalletBalance2
  } = await Promise.resolve().then(() => db_server);
  const { requireAdminSession: requireAdminSession2 } = await Promise.resolve().then(() => session_server);
  const { getClientIp: getClientIp2 } = await import("./rate-limiter.server-DO9B44_3.js");
  const {
    getRecentIpLogs: getRecentIpLogs2,
    getBannedIps: getBannedIps2,
    getUserIpHistory: getUserIpHistory2
  } = await Promise.resolve().then(() => ipSecurity_server);
  await ensureSeeded2();
  let session;
  try {
    session = requireAdminSession2(request);
  } catch (res) {
    const { logSecurityEvent: logSecurityEvent2 } = await Promise.resolve().then(() => securityLog_server);
    logSecurityEvent2("ADMIN_UNAUTHORIZED", getClientIp2(request), { detail: "admin_api_GET" });
    return res;
  }
  const url2 = new URL(request.url);
  const action2 = url2.searchParams.get("action");
  if (action2 === "users") {
    const users = await getAllUsers2();
    return json$2({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        walletUsd: u.walletUsd,
        walletDisplay: (u.walletUsd / 100).toFixed(2),
        totalDepositedDisplay: (u.totalDepositedUsd / 100).toFixed(2),
        createdAt: u.createdAt
      }))
    });
  }
  if (action2 === "search") {
    const q = url2.searchParams.get("q") ?? "";
    if (!q.trim()) return json$2({ error: "Query is required" }, { status: 400 });
    const user = await findUserByQuery2(q);
    if (!user) return json$2({ error: "User not found" }, { status: 404 });
    const walletUsd = await getWalletBalance2(user.id);
    return json$2({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletUsd,
        walletDisplay: (walletUsd / 100).toFixed(2),
        totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2),
        createdAt: user.createdAt
      }
    });
  }
  if (action2 === "orders") {
    const limitParam = Math.min(500, Number(url2.searchParams.get("limit") ?? "200"));
    const orders = await getAllOrders2(limitParam);
    const uniqueUserIds = [...new Set(orders.map((o) => o.userId).filter(Boolean))];
    const uniqueProductIds = [...new Set(orders.map((o) => o.productId).filter(Boolean))];
    const [userResults, productResults] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => findUserById2(id))),
      Promise.all(uniqueProductIds.map((id) => getProductById2(id)))
    ]);
    const userMap = new Map(userResults.filter(Boolean).map((u) => [u.id, u]));
    const productMap = new Map(productResults.filter(Boolean).map((p) => [p.id, p]));
    const enriched = orders.map((o) => {
      const user = userMap.get(o.userId);
      const product = productMap.get(o.productId);
      return {
        id: o.id,
        userId: o.userId,
        userEmail: user?.email ?? "N/A",
        productName: product ? `${product.provider} ${product.type}` : "N/A",
        amountUsd: (o.amountUsdCents / 100).toFixed(2),
        status: o.status,
        createdAt: o.createdAt
      };
    });
    return json$2({ orders: enriched });
  }
  if (action2 === "products") {
    const allProducts = await getAllProducts2();
    return json$2({
      products: allProducts.map((p) => ({
        id: p.id,
        bin: p.bin,
        provider: p.provider,
        type: p.type,
        bank: p.bank,
        country: p.country,
        expiry: p.expiry,
        limitUsd: p.limitUsd,
        priceUsdCents: p.priceUsdCents,
        stock: p.stock,
        status: p.status
      }))
    });
  }
  if (action2 === "ip_logs") {
    const limit = Math.min(500, Number(url2.searchParams.get("limit") ?? "100"));
    const logs = await getRecentIpLogs2(limit);
    return json$2({ logs });
  }
  if (action2 === "banned_ips") {
    const bans = await getBannedIps2();
    return json$2({ bans });
  }
  if (action2 === "user_ip_history") {
    const userId2 = url2.searchParams.get("userId") ?? "";
    if (!userId2) return json$2({ error: "userId is required" }, { status: 400 });
    const ips = await getUserIpHistory2(userId2);
    return json$2({ ips });
  }
  if (action2 === "diagnose") {
    const { getServerEnv: getServerEnv2 } = await Promise.resolve().then(() => env_server);
    const serviceKeySet = !!getServerEnv2("SUPABASE_SERVICE_KEY");
    const anonKeySet = !!getServerEnv2("SUPABASE_ANON_KEY");
    const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
    const { error: readErr } = await supabase2.from("users").select("id").limit(1);
    const { error: writeErr } = await supabase2.from("users").update({ role: "admin" }).eq("id", "USR-ADMIN-001");
    const readOk = !readErr;
    const writeOk = !writeErr;
    return json$2({
      serviceKey: serviceKeySet ? "set" : "missing",
      anonKey: anonKeySet ? "set" : "missing",
      readOk,
      readError: readErr?.message ?? null,
      writeOk,
      writeError: writeErr?.message ?? null,
      summary: !serviceKeySet && !writeOk ? "SUPABASE_SERVICE_KEY is missing and the anon key cannot write (RLS is blocking). Add service key to .env to fix Add/Deduct." : writeOk ? "Write permissions OK. Add/Deduct should work." : `Write blocked: ${writeErr?.message}`,
      fixUrl: "https://supabase.com/dashboard/project/jdnbysookmnxgamcurxu/settings/api"
    });
  }
  if (action2 === "support_tickets") {
    const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
    const { data, error } = await supabase2.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) {
      if (error.code === "42P01") return json$2({ tickets: [] });
      return json$2({ error: error.message }, { status: 500 });
    }
    return json$2({ tickets: data ?? [] });
  }
  const stats = await getAdminStats2();
  return json$2({
    totalRevenue: (stats.totalRevenueCents / 100).toFixed(2),
    totalDeposited: (stats.totalDepositedCents / 100).toFixed(2),
    totalUsers: stats.totalUsers,
    totalOrders: stats.totalOrders,
    completedOrders: stats.completedOrders,
    productsAvailable: stats.productsAvailable,
    productsSold: stats.productsSold
  });
}
async function action$2({ request }) {
  const {
    adminSetBalance: adminSetBalance2,
    createProduct: createProduct2,
    deleteProductById: deleteProductById2,
    adminSetProductStock: adminSetProductStock2,
    findUserById: findUserById2,
    ensureSeeded: ensureSeeded2,
    getWalletBalance: getWalletBalance2
  } = await Promise.resolve().then(() => db_server);
  const { bulkImportProductsFromText } = await import("./bulk-cards.server-DkLjMlEJ.js");
  const { requireAdminSession: requireAdminSession2 } = await Promise.resolve().then(() => session_server);
  const { getClientIp: getClientIp2 } = await import("./rate-limiter.server-DO9B44_3.js");
  const { banIp: banIp2, unbanIp: unbanIp2 } = await Promise.resolve().then(() => ipSecurity_server);
  await ensureSeeded2();
  try {
    requireAdminSession2(request);
  } catch (res) {
    return res;
  }
  let body2;
  try {
    body2 = await request.json();
  } catch {
    return json$2({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (body2.action === "reply_ticket") {
    const { ticketId, reply: adminReply } = body2;
    if (!ticketId || !adminReply?.trim()) {
      return json$2({ error: "ticketId and reply are required" }, { status: 400 });
    }
    const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
    const { error } = await supabase2.from("support_tickets").update({ admin_reply: adminReply.trim(), status: "answered" }).eq("id", ticketId);
    if (error) {
      console.error("[api/admin] reply_ticket error:", error);
      return json$2({ error: error.message }, { status: 500 });
    }
    return json$2({ success: true });
  }
  if (body2.action === "set_balance") {
    const { userId: userId2, amountUsd, note } = body2;
    console.log(`[api/admin set_balance] received: userId=${userId2} amountUsd=${amountUsd} note=${note}`);
    if (!userId2 || typeof userId2 !== "string" || !userId2.trim()) {
      return json$2({ error: "userId is required and must be a non-empty string" }, { status: 400 });
    }
    if (amountUsd === void 0 || amountUsd === null || typeof amountUsd !== "number" || amountUsd < 0) {
      return json$2({ error: `amountUsd must be a number >= 0, got: ${JSON.stringify(amountUsd)}` }, { status: 400 });
    }
    try {
      await adminSetBalance2(userId2.trim(), Math.round(amountUsd * 100), note ?? "Admin adjustment");
      const [user, walletUsd] = await Promise.all([
        findUserById2(userId2.trim()),
        getWalletBalance2(userId2.trim())
      ]);
      const newBalance = ((user?.walletUsd ?? walletUsd) / 100).toFixed(2);
      console.log(`[api/admin set_balance] SUCCESS userId=${userId2} newBalance=${newBalance}`);
      return json$2({ success: true, newBalance });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin set_balance] ERROR:", msg2);
      const isRls = msg2.includes("row-level security") || msg2.includes("RLS") || msg2.includes("permission");
      return json$2(
        {
          error: isRls ? `Database write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg2})` : `Failed to update balance: ${msg2}`
        },
        { status: 500 }
      );
    }
  }
  if (body2.action === "add_product") {
    const p = body2.product;
    if (!p || !p.bin || !p.provider || !p.priceUsdCents) {
      return json$2({ error: "Missing product fields" }, { status: 400 });
    }
    try {
      const street = String(p.street ?? "").trim();
      const city = String(p.city ?? "").trim();
      const state2 = String(p.state ?? "N/A");
      const zip2 = String(p.zip ?? "N/A");
      const addressCombined = typeof p.address === "string" && p.address.trim() ? p.address.trim() : [street, city, state2, zip2].filter((x) => x && x !== "N/A").join(", ") || "N/A";
      const product = await createProduct2({
        bin: String(p.bin),
        provider: String(p.provider),
        type: String(p.type ?? "DEBIT"),
        expiry: String(p.expiry ?? "12/28"),
        name: String(p.name ?? p.provider + "Card"),
        country: String(p.country ?? "US"),
        countryFlag: String(p.countryFlag ?? "🇺🇸"),
        street,
        city: city || "N/A",
        state: state2,
        address: addressCombined,
        zip: zip2,
        extras: p.extras ? String(p.extras) : null,
        bank: String(p.bank ?? "N/A"),
        priceUsdCents: Number(p.priceUsdCents),
        limitUsd: Number(p.limitUsd ?? 0),
        validUntil: String(p.validUntil ?? p.expiry ?? "12/28"),
        isValid: Boolean(p.isValid ?? p.is_100_valid ?? false),
        tag: p.tag ? String(p.tag) : null,
        stock: Math.max(0, Math.floor(Number(p.stock ?? 1))),
        color: String(p.color ?? "#3b82f6"),
        cardNumber: p.cardNumber ? String(p.cardNumber) : void 0,
        cvv: p.cvv ? String(p.cvv) : void 0,
        fullName: p.fullName ? String(p.fullName) : void 0
      });
      return json$2({ success: true, productId: product.id });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin add_product] ERROR:", msg2);
      const isRls = msg2.includes("row-level security") || msg2.includes("RLS") || msg2.includes("permission");
      return json$2(
        { error: isRls ? `DB write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg2})` : `Failed to add product: ${msg2}` },
        { status: 500 }
      );
    }
  }
  if (body2.action === "delete_product") {
    const productId = body2.productId;
    if (!productId || typeof productId !== "string") {
      return json$2({ error: "productId is required" }, { status: 400 });
    }
    try {
      await deleteProductById2(productId);
      return json$2({ success: true });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin delete_product] ERROR:", msg2);
      return json$2({ error: `Failed to delete product: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "update_stock") {
    const productId = body2.productId;
    if (!productId || typeof productId !== "string") {
      return json$2({ error: "productId is required" }, { status: 400 });
    }
    if (body2.stock === void 0 || typeof body2.stock !== "number" || !Number.isFinite(body2.stock) || body2.stock < 0) {
      return json$2({ error: "stock (number >= 0) is required" }, { status: 400 });
    }
    try {
      const updated = await adminSetProductStock2(productId, body2.stock);
      return json$2({ success: true, product: { id: updated.id, stock: updated.stock, status: updated.status } });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin update_stock] ERROR:", msg2);
      return json$2({ error: `Failed to update stock: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "bulk_import_products") {
    const text = body2.text;
    if (typeof text !== "string" || !text.trim()) {
      return json$2({ error: "text is required" }, { status: 400 });
    }
    try {
      const result = await bulkImportProductsFromText(text, {
        isValid: Boolean(body2.isValid),
        pricing: body2.pricing
      });
      return json$2({ success: true, created: result.created, errors: result.errors });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_import_products] ERROR:", msg2);
      const isRls = msg2.includes("row-level security") || msg2.includes("RLS") || msg2.includes("permission");
      return json$2(
        { error: isRls ? `DB write blocked by RLS. Add SUPABASE_SERVICE_KEY to .env. (${msg2})` : `Bulk import failed: ${msg2}` },
        { status: 500 }
      );
    }
  }
  if (body2.action === "bulk_delete_all") {
    try {
      const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
      const { data, error } = await supabase2.from("products").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).is("deleted_at", null).select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_delete_all] soft-deleted ${count} products`);
      return json$2({ success: true, affected: count });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_delete_all] ERROR:", msg2);
      return json$2({ error: `Bulk delete failed: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "bulk_mark_sold_out") {
    try {
      const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
      const { data, error } = await supabase2.from("products").update({ stock: 0, status: "sold_out" }).is("deleted_at", null).select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_mark_sold_out] marked ${count} products sold_out`);
      return json$2({ success: true, affected: count });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_mark_sold_out] ERROR:", msg2);
      return json$2({ error: `Bulk mark sold out failed: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "bulk_restore_all") {
    try {
      const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
      const { data, error } = await supabase2.from("products").update({ stock: 1, status: "in_stock" }).is("deleted_at", null).select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_restore_all] restored ${count} products to in_stock`);
      return json$2({ success: true, affected: count });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_restore_all] ERROR:", msg2);
      return json$2({ error: `Bulk restore failed: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "bulk_recover_deleted") {
    try {
      const { supabase: supabase2 } = await Promise.resolve().then(() => supabase_server);
      const { data, error } = await supabase2.from("products").update({ deleted_at: null }).not("deleted_at", "is", null).select("id");
      if (error) throw new Error(error.message);
      const count = data?.length ?? 0;
      console.log(`[api/admin bulk_recover_deleted] recovered ${count} soft-deleted products`);
      return json$2({ success: true, affected: count });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      console.error("[api/admin bulk_recover_deleted] ERROR:", msg2);
      return json$2({ error: `Bulk recover failed: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "ban_ip") {
    const { ip, reason, isPermanent, expiresAt } = body2;
    if (!ip || typeof ip !== "string" || !ip.trim()) {
      return json$2({ error: "ip is required" }, { status: 400 });
    }
    try {
      const adminSession = requireAdminSession2(request);
      const adminUser = await findUserById2(adminSession.userId).catch(() => null);
      const bannedBy = adminUser?.email ?? "admin";
      await banIp2(ip.trim(), reason ?? "", bannedBy, { isPermanent: isPermanent !== false, expiresAt });
      const { logSecurityEvent: logSecurityEvent2 } = await Promise.resolve().then(() => securityLog_server);
      logSecurityEvent2("ADMIN_ACTION", getClientIp2(request), { userId: adminSession.userId, detail: `ban_ip:${ip}` });
      return json$2({ success: true });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      return json$2({ error: `Failed to ban IP: ${msg2}` }, { status: 500 });
    }
  }
  if (body2.action === "unban_ip") {
    const { ip } = body2;
    if (!ip || typeof ip !== "string" || !ip.trim()) {
      return json$2({ error: "ip is required" }, { status: 400 });
    }
    try {
      await unbanIp2(ip.trim());
      const adminSession = requireAdminSession2(request);
      const { logSecurityEvent: logSecurityEvent2 } = await Promise.resolve().then(() => securityLog_server);
      logSecurityEvent2("ADMIN_ACTION", getClientIp2(request), { userId: adminSession.userId, detail: `unban_ip:${ip}` });
      return json$2({ success: true });
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : String(err);
      return json$2({ error: `Failed to unban IP: ${msg2}` }, { status: 500 });
    }
  }
  return json$2({ error: `Unknown action: ${String(body2.action ?? "")}` }, { status: 400 });
}
const route36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
function json$1(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers ?? {}
    }
  });
}
async function loader$2({ request }) {
  const session = parseSession(request);
  if (!session) return json$1({ error: "Unauthorized" }, { status: 401 });
  console.log(`[api/support] Loading tickets for userId=${session.userId}`);
  const { data, error } = await supabase.from("support_tickets").select("*").eq("user_id", session.userId).order("created_at", { ascending: false });
  if (error) {
    if (error.code === "42P01") {
      console.warn("[api/support] Table 'support_tickets' not found. Run fix-support.sql in Supabase.");
      return json$1({ tickets: [] });
    }
    console.error("[api/support] Fetch error:", error);
    return json$1({ error: error.message }, { status: 500 });
  }
  return json$1({ tickets: data ?? [] });
}
async function action$1({ request }) {
  const session = parseSession(request);
  if (!session) return json$1({ error: "Unauthorized" }, { status: 401 });
  if (request.method !== "POST") {
    return json$1({ error: "Method not allowed" }, { status: 405 });
  }
  console.log(`[api/support] POST from userId=${session.userId}`);
  const formData = await request.formData();
  const issueType = formData.get("issueType")?.toString().trim() || "General";
  const subject = formData.get("subject")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";
  const fileEntry = formData.get("screenshot");
  console.log(`[api/support] Payload: issueType="${issueType}" subject="${subject}" message length=${message.length}`);
  if (!subject || !message) {
    return json$1({ error: "Subject and message are required." }, { status: 400 });
  }
  let finalScreenshotUrl = null;
  const hasFile = fileEntry !== null && typeof fileEntry === "object" && "size" in fileEntry && fileEntry.size > 0;
  if (hasFile) {
    const file = fileEntry;
    console.log(`[api/support] Screenshot detected: name="${file.name}" size=${file.size} bytes`);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${session.userId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("support-screenshots").upload(fileName, file, { upsert: true });
      if (uploadErr) {
        console.error("[api/support] Screenshot upload failed (non-fatal):", uploadErr.message);
      } else {
        const { data: urlData } = supabase.storage.from("support-screenshots").getPublicUrl(fileName);
        finalScreenshotUrl = urlData.publicUrl;
        console.log(`[api/support] Screenshot uploaded OK → ${finalScreenshotUrl}`);
      }
    } catch (e) {
      console.error("[api/support] Screenshot upload threw exception (non-fatal):", e);
    }
  } else {
    console.log("[api/support] No screenshot provided. Skipping upload.");
  }
  const insertPayload = {
    user_id: session.userId,
    issue_type: issueType,
    subject,
    message,
    screenshot_url: finalScreenshotUrl,
    status: "open"
  };
  console.log("[api/support] Inserting ticket payload:", insertPayload);
  const { data, error: insertErr } = await supabase.from("support_tickets").insert([insertPayload]).select().single();
  if (insertErr) {
    console.error("[api/support] INSERT FAILED:", insertErr);
    return json$1(
      {
        error: `Failed to create ticket: ${insertErr.message} (code: ${insertErr.code})`
      },
      { status: 500 }
    );
  }
  console.log(`[api/support] Ticket created successfully: id=${data?.id}`);
  return json$1({ success: true, ticket: data });
}
const route37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      ...init?.headers ?? {}
    }
  });
}
async function loader$1({ request }) {
  const session = parseSession(request);
  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("USER [cart/wallet]:", session.userId);
  const [user, walletUsd] = await Promise.all([
    findUserById(session.userId),
    getWalletBalance(session.userId)
  ]);
  if (!user) return json({ error: "User not found" }, { status: 404 });
  console.log("WALLET [cart/wallet]:", walletUsd);
  console.log(`[api/wallet] userId=${session.userId} wallet_usd=${walletUsd}`);
  const responseData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletUsd,
    walletDisplay: (walletUsd / 100).toFixed(2),
    totalDepositedUsd: user.totalDepositedUsd,
    totalDepositedDisplay: (user.totalDepositedUsd / 100).toFixed(2)
  };
  return json(responseData);
}
const route38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({ request }) {
  const url2 = new URL(request.url);
  const token = url2.searchParams.get("t") ?? "";
  if (!isValidBypassToken(token)) {
    return { authorized: false, token: "", adminId: null, lockedAccounts: [] };
  }
  const adminSession = parseAdminSession(request);
  if (!adminSession || adminSession.role !== "admin") {
    return { authorized: false, token, adminId: null, lockedAccounts: [], needsAdminLogin: true };
  }
  let lockedAccounts = [];
  try {
    lockedAccounts = await getLockedAccounts();
  } catch {
  }
  return {
    authorized: true,
    token,
    adminId: adminSession.userId,
    lockedAccounts,
    needsAdminLogin: false
  };
}
async function action({ request }) {
  const form2 = await request.formData();
  const token = form2.get("token") ?? "";
  const email = form2.get("email") ?? "";
  if (!isValidBypassToken(token)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const adminSession = parseAdminSession(request);
  if (!adminSession || adminSession.role !== "admin") {
    return Response.json({ ok: false, error: "Admin session required" }, { status: 403 });
  }
  if (!email.trim()) {
    return Response.json({ ok: false, error: "Email is required" }, { status: 400 });
  }
  try {
    const result = await unlockByEmail(email);
    if (!result.found) {
      return Response.json({ ok: false, error: `No user found with email: ${email}` });
    }
    console.log(`[bypass-panel] Admin ${adminSession.userId} unlocked account: ${result.email}`);
    return Response.json({
      ok: true,
      message: `✓ Account ${result.email} has been unlocked.${result.was_locked ? "" : " (was not locked)"}`
    });
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: msg2 }, { status: 500 });
  }
}
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 10 * 60 * 1e3;
function formatMs(ms) {
  const totalSec = Math.ceil(ms / 1e3);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
const onlyGodAccessX9k2 = UNSAFE_withComponentProps(function GodBypassPage() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  if (!data.authorized && !("needsAdminLogin" in data && data.needsAdminLogin)) {
    return /* @__PURE__ */ jsxs("div", {
      style: {
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif"
      },
      children: [/* @__PURE__ */ jsx("div", {
        style: {
          fontSize: "7rem",
          fontWeight: 900,
          color: "#111",
          lineHeight: 1
        },
        children: "404"
      }), /* @__PURE__ */ jsx("div", {
        style: {
          fontSize: "1rem",
          color: "#333",
          marginTop: "1rem"
        },
        children: "Page not found."
      })]
    });
  }
  if (!data.authorized && "needsAdminLogin" in data && data.needsAdminLogin) {
    return /* @__PURE__ */ jsx("div", {
      style: {
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.04) 0%, #080808 60%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ jsxs("div", {
        style: {
          maxWidth: "420px",
          width: "100%",
          padding: "2.5rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          textAlign: "center"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            fontSize: "2.5rem",
            marginBottom: "1rem"
          },
          children: "ðŸ”"
        }), /* @__PURE__ */ jsx("h1", {
          style: {
            margin: "0 0 0.5rem",
            fontSize: "1.2rem",
            fontWeight: 800
          },
          children: "Admin Session Required"
        }), /* @__PURE__ */ jsxs("p", {
          style: {
            color: "#64748b",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            margin: "0 0 1.5rem"
          },
          children: ["You must be logged in as an ", /* @__PURE__ */ jsx("strong", {
            style: {
              color: "#eab308"
            },
            children: "admin"
          }), " to use this panel. Login at the admin portal, then return here with the same token."]
        }), /* @__PURE__ */ jsx("a", {
          href: ADMIN_ENTRY_PATH,
          style: {
            display: "inline-block",
            padding: "0.65rem 1.5rem",
            background: "rgba(234,179,8,0.15)",
            border: "1px solid rgba(234,179,8,0.35)",
            borderRadius: "10px",
            color: "#fbbf24",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none"
          },
          children: "â†’ Go to Admin Entry"
        })]
      })
    });
  }
  const {
    token,
    adminId,
    lockedAccounts
  } = data;
  const isPending = fetcher.state !== "idle";
  const result = fetcher.data;
  const lockMins = LOCK_DURATION_MS / 6e4;
  return /* @__PURE__ */ jsx("div", {
    style: {
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.07) 0%, #080808 65%)",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#e2e8f0",
      padding: "2rem 1rem"
    },
    children: /* @__PURE__ */ jsxs("div", {
      style: {
        maxWidth: "760px",
        margin: "0 auto"
      },
      children: [/* @__PURE__ */ jsxs("div", {
        style: {
          textAlign: "center",
          marginBottom: "2.5rem"
        },
        children: [/* @__PURE__ */ jsx("div", {
          style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "68px",
            height: "68px",
            borderRadius: "18px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            marginBottom: "1.2rem",
            fontSize: "2rem"
          },
          children: "ðŸ”“"
        }), /* @__PURE__ */ jsx("h1", {
          style: {
            fontSize: "1.65rem",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.02em"
          },
          children: "God Mode â€” Admin Bypass"
        }), /* @__PURE__ */ jsxs("p", {
          style: {
            fontSize: "0.78rem",
            color: "#475569",
            marginTop: "6px"
          },
          children: ["Account unlock panel Â· Admin: ", /* @__PURE__ */ jsx("code", {
            style: {
              color: "#94a3b8"
            },
            children: adminId
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "1.5rem"
        },
        children: [{
          label: "Max Attempts",
          value: String(MAX_FAILED_ATTEMPTS),
          color: "#f59e0b"
        }, {
          label: "Lock Duration",
          value: `${lockMins} min`,
          color: "#ef4444"
        }, {
          label: "Locked Now",
          value: String(lockedAccounts.length),
          color: lockedAccounts.length > 0 ? "#ef4444" : "#22c55e"
        }].map((s) => /* @__PURE__ */ jsxs("div", {
          style: {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px",
            padding: "1.1rem",
            textAlign: "center"
          },
          children: [/* @__PURE__ */ jsx("div", {
            style: {
              fontSize: "1.6rem",
              fontWeight: 800,
              color: s.color
            },
            children: s.value
          }), /* @__PURE__ */ jsx("div", {
            style: {
              fontSize: "0.72rem",
              color: "#475569",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            },
            children: s.label
          })]
        }, s.label))
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "1.75rem",
          marginBottom: "1.25rem"
        },
        children: [/* @__PURE__ */ jsx("h2", {
          style: {
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#94a3b8",
            marginTop: 0,
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          },
          children: "Unlock Account by Email"
        }), /* @__PURE__ */ jsxs(fetcher.Form, {
          method: "POST",
          style: {
            display: "flex",
            gap: "10px"
          },
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "token",
            value: token
          }), /* @__PURE__ */ jsx("input", {
            name: "email",
            type: "email",
            placeholder: "user@example.com",
            required: true,
            style: {
              flex: 1,
              padding: "0.7rem 1rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "0.88rem",
              outline: "none"
            }
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: isPending,
            style: {
              padding: "0.7rem 1.5rem",
              background: isPending ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.75)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: isPending ? "default" : "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.2s"
            },
            children: isPending ? "Unlockingâ€¦" : "Unlock Account"
          })]
        }), result && /* @__PURE__ */ jsx("div", {
          style: {
            marginTop: "0.85rem",
            padding: "0.7rem 1rem",
            borderRadius: "9px",
            background: result.ok ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
            border: `1px solid ${result.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: result.ok ? "#86efac" : "#fca5a5",
            fontSize: "0.85rem"
          },
          children: result.ok ? result.message : `âš  ${result.error}`
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "1.75rem"
        },
        children: [/* @__PURE__ */ jsxs("h2", {
          style: {
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#94a3b8",
            marginTop: 0,
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          },
          children: ["Currently Locked Accounts (", lockedAccounts.length, ")"]
        }), lockedAccounts.length === 0 ? /* @__PURE__ */ jsxs("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#334155",
            fontSize: "0.85rem"
          },
          children: [/* @__PURE__ */ jsx("span", {
            style: {
              fontSize: "1.1rem"
            },
            children: "âœ…"
          }), " No accounts are currently locked."]
        }) : /* @__PURE__ */ jsx("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          },
          children: lockedAccounts.map((acc) => /* @__PURE__ */ jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1rem",
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.13)",
              borderRadius: "11px",
              gap: "12px",
              flexWrap: "wrap"
            },
            children: [/* @__PURE__ */ jsxs("div", {
              style: {
                flex: 1,
                minWidth: 0
              },
              children: [/* @__PURE__ */ jsx("div", {
                style: {
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#fca5a5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                },
                children: acc.email
              }), /* @__PURE__ */ jsxs("div", {
                style: {
                  fontSize: "0.73rem",
                  color: "#64748b",
                  marginTop: "3px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap"
                },
                children: [/* @__PURE__ */ jsxs("span", {
                  children: [acc.failedAttempts, " failed attempt", acc.failedAttempts !== 1 ? "s" : ""]
                }), /* @__PURE__ */ jsx("span", {
                  children: "Â·"
                }), /* @__PURE__ */ jsxs("span", {
                  style: {
                    color: "#ef4444"
                  },
                  children: [formatMs(acc.remainingMs), " remaining"]
                }), /* @__PURE__ */ jsx("span", {
                  children: "Â·"
                }), /* @__PURE__ */ jsx("span", {
                  style: {
                    opacity: 0.5
                  },
                  children: acc.id
                })]
              })]
            }), /* @__PURE__ */ jsxs(fetcher.Form, {
              method: "POST",
              style: {
                margin: 0,
                flexShrink: 0
              },
              children: [/* @__PURE__ */ jsx("input", {
                type: "hidden",
                name: "token",
                value: token
              }), /* @__PURE__ */ jsx("input", {
                type: "hidden",
                name: "email",
                value: acc.email
              }), /* @__PURE__ */ jsx("button", {
                type: "submit",
                disabled: isPending,
                style: {
                  padding: "0.43rem 0.9rem",
                  background: "rgba(239,68,68,0.18)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  color: "#fca5a5",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer"
                },
                children: "Unlock"
              })]
            })]
          }, acc.id))
        })]
      }), /* @__PURE__ */ jsx("p", {
        style: {
          fontSize: "0.68rem",
          color: "#1e293b",
          textAlign: "center",
          marginTop: "2rem"
        },
        children: "This panel is not linked in any UI. Access requires valid BYPASS_SECRET token + admin session."
      })]
    })
  });
});
const route39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: onlyGodAccessX9k2,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BUXwN9gv.js", "imports": ["/assets/jsx-runtime-u17CrQMm.js", "/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-CJcZ6hkB.js", "imports": ["/assets/jsx-runtime-u17CrQMm.js", "/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": ["/assets/root-DtUGWO1G.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/public-layout": { "id": "routes/public-layout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/public-layout-DIsuQWuW.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-iSiVOWvV.js"], "css": ["/assets/public-layout-6cK9ug88.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "routes/public-layout", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_index-DuAApL7g.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/arrow-right-DrqVkj-b.js", "/assets/chevron-down-0Ihoe-VY.js", "/assets/zap-BQycOdVQ.js", "/assets/shield-B_Yv3luZ.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/index-iSiVOWvV.js"], "css": ["/assets/_index-EXzy8PMf.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "routes/public-layout", "path": "/login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/login-RH_Xita6.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/circle-alert-CsRZkyLl.js", "/assets/eye-off-BqHBiJ27.js", "/assets/eye-Jpc87QZr.js", "/assets/zap-BQycOdVQ.js", "/assets/shield-B_Yv3luZ.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/use-live-stats-DDDLkXZC.js"], "css": ["/assets/login-DWKhOIKm.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/register": { "id": "routes/register", "parentId": "routes/public-layout", "path": "/register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/register-BbxYO_Ai.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/circle-alert-CsRZkyLl.js", "/assets/eye-off-BqHBiJ27.js", "/assets/eye-Jpc87QZr.js", "/assets/zap-BQycOdVQ.js", "/assets/shield-B_Yv3luZ.js", "/assets/credit-card-XoSquJkq.js", "/assets/use-live-stats-DDDLkXZC.js", "/assets/createLucideIcon-l-jU2x6e.js"], "css": ["/assets/register-DoME8D6m.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/reset-password": { "id": "routes/reset-password", "parentId": "routes/public-layout", "path": "/reset-password", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/reset-password-B_4_xqsm.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/createLucideIcon-l-jU2x6e.js"], "css": ["/assets/reset-password-BzCQq4IO.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/support": { "id": "routes/support", "parentId": "routes/public-layout", "path": "/support", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/support-plawiOBy.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/chevron-down-0Ihoe-VY.js", "/assets/activity-DRzbDdBG.js", "/assets/chevron-up-BDwxRNC2.js"], "css": ["/assets/support-CtbAeObw.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/redirect-home-features": { "id": "routes/redirect-home-features", "parentId": "routes/public-layout", "path": "/features", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/redirect-home-features-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/redirect-home-products": { "id": "routes/redirect-home-products", "parentId": "routes/public-layout", "path": "/products", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/redirect-home-products-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/dashboard-layout": { "id": "routes/dashboard-layout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/dashboard-layout-CrjrdFYi.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/layout-dashboard-BWtQwF6Y.js", "/assets/arrow-down-to-line-Cg-kVrw9.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/package-DP4JZ3A9.js", "/assets/shopping-bag-DKNqDbfJ.js", "/assets/shield-check-CyEekCkb.js", "/assets/x-DxzZETvh.js", "/assets/triangle-alert-D0cghJUk.js", "/assets/circle-check-big-DvQHJp-y.js"], "css": ["/assets/dashboard-layout-DeWYyF-B.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/user-dashboard": { "id": "routes/user-dashboard", "parentId": "routes/dashboard-layout", "path": "/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/user-dashboard-DLURWZhj.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/arrow-down-to-line-Cg-kVrw9.js", "/assets/shopping-bag-DKNqDbfJ.js", "/assets/package-DP4JZ3A9.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/credit-card-XoSquJkq.js", "/assets/plus-Cl338Q38.js", "/assets/watermark-ByrXw64j.js"], "css": ["/assets/user-dashboard-BBSTyL7h.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/wallet-deposit": { "id": "routes/wallet-deposit", "parentId": "routes/dashboard-layout", "path": "/deposit", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/wallet-deposit-CBws3n8u.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-iSiVOWvV.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/external-link-D_Mx92mJ.js", "/assets/arrow-right-DrqVkj-b.js", "/assets/lock-NkpGq0vN.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/watermark-ByrXw64j.js"], "css": ["/assets/wallet-deposit-eYaFFrwY.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/cards-catalog": { "id": "routes/cards-catalog", "parentId": "routes/dashboard-layout", "path": "/cards", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/cards-catalog-Crey13kP.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/use-cart-BCVUBR7y.js", "/assets/chevron-right-BYbXc4ub.js", "/assets/watermark-ByrXw64j.js"], "css": ["/assets/cards-catalog-BbdNhyq1.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/valid-cc": { "id": "routes/valid-cc", "parentId": "routes/dashboard-layout", "path": "/valid", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/valid-cc-CBsBl74O.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/search-DcMMDub4.js", "/assets/layout-dashboard-BWtQwF6Y.js", "/assets/package-DP4JZ3A9.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/valid-cc-grid-DGWwuZNn.js", "/assets/watermark-ByrXw64j.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/zap-BQycOdVQ.js", "/assets/shield-B_Yv3luZ.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/use-cart-BCVUBR7y.js", "/assets/shopping-cart-CW5M0jsL.js"], "css": ["/assets/valid-cc-5e_YkxWX.css", "/assets/valid-cc-grid-CPXYkieU.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/valid-guarantee": { "id": "routes/valid-guarantee", "parentId": "routes/dashboard-layout", "path": "/valid-guarantee", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/valid-guarantee-DbsvsICS.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/valid-cc-grid-DGWwuZNn.js", "/assets/watermark-ByrXw64j.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/zap-BQycOdVQ.js", "/assets/shield-B_Yv3luZ.js", "/assets/use-auth-Vkh6CJa1.js", "/assets/use-cart-BCVUBR7y.js", "/assets/shopping-cart-CW5M0jsL.js"], "css": ["/assets/valid-guarantee-STSXRMEv.css", "/assets/valid-cc-grid-CPXYkieU.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/my-orders": { "id": "routes/my-orders", "parentId": "routes/dashboard-layout", "path": "/orders", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/my-orders-CXVWEqh-.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/rotate-ccw-BjaBSA4h.js", "/assets/shopping-bag-DKNqDbfJ.js", "/assets/credit-card-XoSquJkq.js", "/assets/chevron-up-BDwxRNC2.js", "/assets/chevron-down-0Ihoe-VY.js", "/assets/watermark-ByrXw64j.js", "/assets/createLucideIcon-l-jU2x6e.js"], "css": ["/assets/my-orders-D0_m0_dE.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/transaction-history": { "id": "routes/transaction-history", "parentId": "routes/dashboard-layout", "path": "/history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/transaction-history-BF6pYeCL.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/wallet-fYOcOTcv.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/circle-alert-CsRZkyLl.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/watermark-ByrXw64j.js"], "css": ["/assets/transaction-history-juj7ohRK.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/my-cart": { "id": "routes/my-cart", "parentId": "routes/dashboard-layout", "path": "/cart", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/my-cart-BZue5anY.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/use-cart-BCVUBR7y.js", "/assets/arrow-left-C-Yl4LYa.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/credit-card-XoSquJkq.js", "/assets/shopping-cart-CW5M0jsL.js", "/assets/trash-2-4K9S3zfV.js", "/assets/triangle-alert-D0cghJUk.js", "/assets/shield-check-CyEekCkb.js", "/assets/watermark-ByrXw64j.js", "/assets/createLucideIcon-l-jU2x6e.js"], "css": ["/assets/my-cart-CRow0a24.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-landing": { "id": "routes/admin-landing", "parentId": "root", "path": "/x9k7-secure-admin-core-portal-88421", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-landing-B6IUuBSI.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/admin-routes-CFz7ovOM.js"], "css": ["/assets/admin-landing-DY4X4g2T.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-login": { "id": "routes/admin-login", "parentId": "root", "path": "/x9k7-secure-admin-core-portal-88421/login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-login-Cg1-Djkn.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/shield-check-CyEekCkb.js", "/assets/circle-alert-CsRZkyLl.js", "/assets/eye-off-BqHBiJ27.js", "/assets/eye-Jpc87QZr.js", "/assets/lock-NkpGq0vN.js", "/assets/createLucideIcon-l-jU2x6e.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-legacy-panel-entry-redirect": { "id": "routes/admin-legacy-panel-entry-redirect", "parentId": "root", "path": "/panel-entry", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-legacy-panel-entry-redirect-CKnY11QP.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-legacy-redirect": { "id": "routes/admin-legacy-redirect", "parentId": "root", "path": "/admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-legacy-redirect-_jevzNm7.js", "imports": ["/assets/admin-legacy-panel-entry-redirect-CKnY11QP.js", "/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-legacy-login-redirect": { "id": "routes/admin-legacy-login-redirect", "parentId": "root", "path": "/admin/login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-legacy-login-redirect-_jevzNm7.js", "imports": ["/assets/admin-legacy-panel-entry-redirect-CKnY11QP.js", "/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-legacy-hidden-login-redirect": { "id": "routes/admin-legacy-hidden-login-redirect", "parentId": "root", "path": "/x7k9-secure-panel-god/login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-legacy-hidden-login-redirect-_jevzNm7.js", "imports": ["/assets/admin-legacy-panel-entry-redirect-CKnY11QP.js", "/assets/chunk-OE4NN4TA-DM0BKZ5d.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin-portal": { "id": "routes/admin-portal", "parentId": "root", "path": "/x7k9-secure-panel-god", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-portal-CKpMZWtV.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/admin-routes-CFz7ovOM.js", "/assets/createLucideIcon-l-jU2x6e.js", "/assets/triangle-alert-D0cghJUk.js", "/assets/x-DxzZETvh.js", "/assets/index-iSiVOWvV.js", "/assets/wallet-fYOcOTcv.js", "/assets/credit-card-XoSquJkq.js", "/assets/package-DP4JZ3A9.js", "/assets/shield-B_Yv3luZ.js", "/assets/search-DcMMDub4.js", "/assets/circle-alert-CsRZkyLl.js", "/assets/plus-Cl338Q38.js", "/assets/circle-check-big-DvQHJp-y.js", "/assets/trash-2-4K9S3zfV.js", "/assets/rotate-ccw-BjaBSA4h.js", "/assets/shopping-bag-DKNqDbfJ.js", "/assets/chevron-right-BYbXc4ub.js", "/assets/activity-DRzbDdBG.js", "/assets/eye-Jpc87QZr.js", "/assets/external-link-D_Mx92mJ.js", "/assets/watermark-ByrXw64j.js"], "css": ["/assets/admin-portal-ChcZoKGO.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.register": { "id": "routes/api.register", "parentId": "root", "path": "/api/register", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.register-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.reset-password": { "id": "routes/api.reset-password", "parentId": "root", "path": "/api/reset-password", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.reset-password-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.login": { "id": "routes/api.login", "parentId": "root", "path": "/api/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.login-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.user": { "id": "routes/api.user", "parentId": "root", "path": "/api/user", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.user-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.orders": { "id": "routes/api.orders", "parentId": "root", "path": "/api/orders", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.orders-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.products": { "id": "routes/api.products", "parentId": "root", "path": "/api/products", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.products-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.buy": { "id": "routes/api.buy", "parentId": "root", "path": "/api/buy", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.buy-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.deposit.create": { "id": "routes/api.deposit.create", "parentId": "root", "path": "/api/deposit/create", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.deposit.create-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.deposit.callback": { "id": "routes/api.deposit.callback", "parentId": "root", "path": "/api/deposit/callback", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.deposit.callback-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.health": { "id": "routes/api.health", "parentId": "root", "path": "/api/health", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.health-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.admin-auth": { "id": "routes/api.admin-auth", "parentId": "root", "path": "/api/admin-auth", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.admin-auth-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.admin": { "id": "routes/api.admin", "parentId": "root", "path": "/api/admin", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.admin-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.support": { "id": "routes/api.support", "parentId": "root", "path": "/api/support", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.support-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.wallet": { "id": "routes/api.wallet", "parentId": "root", "path": "/api/wallet", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.wallet-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/only-god-access-x9k2": { "id": "routes/only-god-access-x9k2", "parentId": "root", "path": "/only-god-access-x9k2", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/only-god-access-x9k2-2XWYEQe0.js", "imports": ["/assets/chunk-OE4NN4TA-DM0BKZ5d.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/admin-routes-CFz7ovOM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-d959008e.js", "version": "d959008e", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": true, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = ["/"];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/public-layout": {
    id: "routes/public-layout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "routes/public-layout",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "routes/login": {
    id: "routes/login",
    parentId: "routes/public-layout",
    path: "/login",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/register": {
    id: "routes/register",
    parentId: "routes/public-layout",
    path: "/register",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/reset-password": {
    id: "routes/reset-password",
    parentId: "routes/public-layout",
    path: "/reset-password",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/support": {
    id: "routes/support",
    parentId: "routes/public-layout",
    path: "/support",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/redirect-home-features": {
    id: "routes/redirect-home-features",
    parentId: "routes/public-layout",
    path: "/features",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/redirect-home-products": {
    id: "routes/redirect-home-products",
    parentId: "routes/public-layout",
    path: "/products",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/dashboard-layout": {
    id: "routes/dashboard-layout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/user-dashboard": {
    id: "routes/user-dashboard",
    parentId: "routes/dashboard-layout",
    path: "/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/wallet-deposit": {
    id: "routes/wallet-deposit",
    parentId: "routes/dashboard-layout",
    path: "/deposit",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/cards-catalog": {
    id: "routes/cards-catalog",
    parentId: "routes/dashboard-layout",
    path: "/cards",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/valid-cc": {
    id: "routes/valid-cc",
    parentId: "routes/dashboard-layout",
    path: "/valid",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/valid-guarantee": {
    id: "routes/valid-guarantee",
    parentId: "routes/dashboard-layout",
    path: "/valid-guarantee",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/my-orders": {
    id: "routes/my-orders",
    parentId: "routes/dashboard-layout",
    path: "/orders",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/transaction-history": {
    id: "routes/transaction-history",
    parentId: "routes/dashboard-layout",
    path: "/history",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/my-cart": {
    id: "routes/my-cart",
    parentId: "routes/dashboard-layout",
    path: "/cart",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/admin-landing": {
    id: "routes/admin-landing",
    parentId: "root",
    path: "/x9k7-secure-admin-core-portal-88421",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/admin-login": {
    id: "routes/admin-login",
    parentId: "root",
    path: "/x9k7-secure-admin-core-portal-88421/login",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "routes/admin-legacy-panel-entry-redirect": {
    id: "routes/admin-legacy-panel-entry-redirect",
    parentId: "root",
    path: "/panel-entry",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/admin-legacy-redirect": {
    id: "routes/admin-legacy-redirect",
    parentId: "root",
    path: "/admin",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/admin-legacy-login-redirect": {
    id: "routes/admin-legacy-login-redirect",
    parentId: "root",
    path: "/admin/login",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/admin-legacy-hidden-login-redirect": {
    id: "routes/admin-legacy-hidden-login-redirect",
    parentId: "root",
    path: "/x7k9-secure-panel-god/login",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "routes/admin-portal": {
    id: "routes/admin-portal",
    parentId: "root",
    path: "/x7k9-secure-panel-god",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "routes/api.register": {
    id: "routes/api.register",
    parentId: "root",
    path: "/api/register",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  },
  "routes/api.reset-password": {
    id: "routes/api.reset-password",
    parentId: "root",
    path: "/api/reset-password",
    index: void 0,
    caseSensitive: void 0,
    module: route26
  },
  "routes/api.login": {
    id: "routes/api.login",
    parentId: "root",
    path: "/api/login",
    index: void 0,
    caseSensitive: void 0,
    module: route27
  },
  "routes/api.user": {
    id: "routes/api.user",
    parentId: "root",
    path: "/api/user",
    index: void 0,
    caseSensitive: void 0,
    module: route28
  },
  "routes/api.orders": {
    id: "routes/api.orders",
    parentId: "root",
    path: "/api/orders",
    index: void 0,
    caseSensitive: void 0,
    module: route29
  },
  "routes/api.products": {
    id: "routes/api.products",
    parentId: "root",
    path: "/api/products",
    index: void 0,
    caseSensitive: void 0,
    module: route30
  },
  "routes/api.buy": {
    id: "routes/api.buy",
    parentId: "root",
    path: "/api/buy",
    index: void 0,
    caseSensitive: void 0,
    module: route31
  },
  "routes/api.deposit.create": {
    id: "routes/api.deposit.create",
    parentId: "root",
    path: "/api/deposit/create",
    index: void 0,
    caseSensitive: void 0,
    module: route32
  },
  "routes/api.deposit.callback": {
    id: "routes/api.deposit.callback",
    parentId: "root",
    path: "/api/deposit/callback",
    index: void 0,
    caseSensitive: void 0,
    module: route33
  },
  "routes/api.health": {
    id: "routes/api.health",
    parentId: "root",
    path: "/api/health",
    index: void 0,
    caseSensitive: void 0,
    module: route34
  },
  "routes/api.admin-auth": {
    id: "routes/api.admin-auth",
    parentId: "root",
    path: "/api/admin-auth",
    index: void 0,
    caseSensitive: void 0,
    module: route35
  },
  "routes/api.admin": {
    id: "routes/api.admin",
    parentId: "root",
    path: "/api/admin",
    index: void 0,
    caseSensitive: void 0,
    module: route36
  },
  "routes/api.support": {
    id: "routes/api.support",
    parentId: "root",
    path: "/api/support",
    index: void 0,
    caseSensitive: void 0,
    module: route37
  },
  "routes/api.wallet": {
    id: "routes/api.wallet",
    parentId: "root",
    path: "/api/wallet",
    index: void 0,
    caseSensitive: void 0,
    module: route38
  },
  "routes/only-god-access-x9k2": {
    id: "routes/only-god-access-x9k2",
    parentId: "root",
    path: "/only-god-access-x9k2",
    index: void 0,
    caseSensitive: void 0,
    module: route39
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins as a,
  assetsBuildDirectory as b,
  createProduct as c,
  basename as d,
  entry as e,
  future as f,
  publicPath as g,
  routes as h,
  isSpaMode as i,
  ssr as j,
  prerender as p,
  routeDiscovery as r,
  serverManifest as s
};
