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
    code?: string | string[];
    welcome?: string | string[];
    registered?: string | string[];
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
  const code = Array.isArray(params.code) ? params.code[0] : (params.code ?? null);
  const welcome = Array.isArray(params.welcome)
    ? params.welcome[0] === "1"
    : params.welcome === "1";
  const registered = Array.isArray(params.registered)
    ? params.registered[0] === "1"
    : params.registered === "1";

  return (
    <SignInClient
      callbackUrl={callbackUrl}
      errorCode={error === "CredentialsSignin" ? code ?? error : error}
      forceWelcome={welcome}
      registered={registered}
    />
  );
}
