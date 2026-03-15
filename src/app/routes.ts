import type { Route } from "next";

export const routes = {
  home: "/" as Route,
  register: "/register" as Route,
  about: "/about" as Route,
  blog: "/blog" as Route,
  contact: "/contact" as Route,
  fieldNotes: "/field-notes" as Route,
  calculators: "/calculators" as Route,
  commandCenter: "/command-center" as Route,
  faq: "/faq" as Route,
  offline: "/offline" as Route,
  pricebook: "/pricebook" as Route,
  privacy: "/privacy" as Route,
  saved: "/saved" as Route,
  settings: "/settings" as Route,
  terms: "/terms" as Route,
  unauthorized: "/unauthorized" as Route,
  auth: {
    error: "/auth/error" as Route,
    signIn: "/auth/signin" as Route,
    forgotPassword: "/forgot-password" as Route,
  },
  api: {
    aiOptimize: "/api/ai/optimize" as Route,
    auth: "/api/auth" as Route,
    businessProfile: "/api/business-profile" as Route,
    estimates: "/api/estimates" as Route,
    leadsSignup: "/api/leads/signup" as Route,
    materials: "/api/materials" as Route,
    pricesUpdate: "/api/prices/update" as Route,
    serviceWorker: "/sw.js" as Route,
  },
} as const;

export const protectedRoutes = [
  routes.saved,
  routes.pricebook,
  routes.settings,
  routes.commandCenter,
] as const;

export const primaryNavigation = [
  { href: routes.calculators, label: "Calculators" },
  { href: routes.fieldNotes, label: "Field Notes" },
  { href: routes.faq, label: "FAQ" },
  { href: routes.about, label: "About" },
] as const;

export const accountNavigation = [
  { href: routes.auth.signIn, label: "Sign In" },
  { href: routes.saved, label: "Saved Estimates" },
  { href: routes.pricebook, label: "Price Book" },
  { href: routes.settings, label: "Business Profile" },
  { href: routes.commandCenter, label: "Command Center" },
] as const;

export const legalNavigation = [
  { href: routes.fieldNotes, label: "Field Notes" },
  { href: routes.faq, label: "FAQ" },
  { href: routes.about, label: "About" },
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.terms, label: "Terms of Service" },
] as const;

/** @deprecated Use getFieldNotesRoute. Blog merged into Field Notes hub. */
export function getBlogPostRoute(slug: string): Route {
  return `/field-notes/${slug}` as Route;
}

export function getFieldNotesRoute(slug: string): Route {
  return `/field-notes/${slug}` as Route;
}

export function getCalculatorCategoryHref(category: string): {
  pathname: typeof routes.calculators;
  query: { c: string };
} {
  return {
    pathname: routes.calculators,
    query: { c: category },
  };
}

export function getSignInHref(callbackUrl?: string):
  | typeof routes.auth.signIn
  | {
      pathname: typeof routes.auth.signIn;
      query: { callbackUrl: string };
    } {
  if (!callbackUrl) {
    return routes.auth.signIn;
  }

  return {
    pathname: routes.auth.signIn,
    query: { callbackUrl },
  };
}
