import { Suspense } from "react";
import { SignUpClient } from "./SignUpClient";
import { shouldEnableClerkClient } from "@/lib/clerk/env";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--shell-header-h))] flex-col items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
            <p className="text-sm text-[--color-ink-mid]">Loading sign-up…</p>
          </div>
        }
      >
        <SignUpClient clerkEnabled={shouldEnableClerkClient()} />
      </Suspense>
    </div>
  );
}
