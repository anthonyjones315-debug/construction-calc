import type { Route } from "next";

export const routes = {
  home: "/" as Route,
  register: "/sign-up" as Route,
  about: "/about" as Route,
  blog: "/blog" as Route,
  contact: "/contact" as Route,
  fieldNotes: "/field-notes" as Route,
  calculators: "/calculators" as Route,
  commandCenter: "/command-center" as Route,
  crm: "/command-center/crm" as Route,
  newEstimate: "/command-center/estimates/new" as Route,
  faq: "/faq" as Route,
  offline: "/offline" as Route,
  pricebook: "/pricebook" as Route,
  privacy: "/privacy" as Route,
  cart: "/cart" as Route,
  saved: "/saved" as Route,
  settings: "/settings" as Route,
  /** Hash target on Settings — Business Profile section (`ProfileSettings`). */
  settingsBusinessProfile: "/settings#business-profile" as Route,
  financialTerms: "/financial-terms" as Route,
  glossary: "/glossary" as Route,
  guide: "/guide" as Route,
  terms: "/terms" as Route,
  unauthorized: "/unauthorized" as Route,
  auth: {
    error: "/auth/error" as Route,
    signIn: "/sign-in" as Route,
    signUp: "/sign-up" as Route,
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
  { href: routes.settingsBusinessProfile, label: "Business Profile" },
  { href: routes.commandCenter, label: "Command Center" },
] as const;

export const legalNavigation = [
  { href: routes.fieldNotes, label: "Field Notes" },
  { href: routes.faq, label: "FAQ" },
  { href: routes.about, label: "About" },
  { href: routes.financialTerms, label: "Financial Terms" },
  { href: routes.glossary, label: "Glossary" },
  { href: routes.guide, label: "User Guide" },
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.terms, label: "Terms of Service" },
] as const;

export function getBlogPostRoute(slug: string): Route {
  return `/blog/${slug}` as Route;
}

export function getEstimateDetailRoute(id: string): Route {
  return `/command-center/estimates/${id}` as Route;
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
