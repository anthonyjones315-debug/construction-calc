import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { routes } from "@routes";
import SignInClient from "./SignInClient";

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
    error?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
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

  const error = Array.isArray(params.error)
    ? params.error[0]
    : (params.error ?? null);

  return <SignInClient callbackUrl={callbackUrl} errorCode={error} />;
}
