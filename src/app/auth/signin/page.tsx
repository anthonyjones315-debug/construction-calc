import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { routes } from "@routes";

function getSafeCallbackUrl(candidate: string | string[] | undefined): string {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;

  if (!value) {
    return routes.commandCenter;
  }

  return value.startsWith("/") ? value : routes.commandCenter;
}

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    callbackUrl?: string | string[];
  }>;
};

/** Legacy `/auth/signin` — redirects to Clerk embedded sign-in. */
export default async function LegacySignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.next ?? params.callbackUrl);
  const session = await auth();

  if (session?.user?.id) {
    redirect(
      (callbackUrl === routes.auth.signIn
        ? routes.commandCenter
        : callbackUrl) as Route,
    );
  }

  const q = new URLSearchParams();
  if (callbackUrl && callbackUrl !== routes.commandCenter) {
    q.set("redirect_url", callbackUrl);
  }
  const suffix = q.toString();
  redirect(
    `${routes.auth.signIn}${suffix ? `?${suffix}` : ""}` as Route,
  );
}
