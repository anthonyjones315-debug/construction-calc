import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_NEXT_PATH = "/dashboard";
const AUTH_ERROR_PATH = "/auth/error";

function getSafeNextPath(nextParam: string | null) {
  if (!nextParam) {
    return DEFAULT_NEXT_PATH;
  }

  return nextParam.startsWith("/") ? nextParam : DEFAULT_NEXT_PATH;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next =
    requestUrl.searchParams.get("next") ??
    requestUrl.searchParams.get("callbackUrl");

  if (!code) {
    return NextResponse.redirect(new URL(AUTH_ERROR_PATH, request.url));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return NextResponse.redirect(new URL(getSafeNextPath(next), request.url));
  } catch {
    return NextResponse.redirect(new URL(AUTH_ERROR_PATH, request.url));
  }
}
