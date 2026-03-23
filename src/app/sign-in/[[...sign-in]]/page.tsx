import { Suspense } from "react";
import { SignInClient } from "./SignInClient";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--shell-header-h))] flex-col items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
        }
      >
        <SignInClient />
      </Suspense>
    </div>
  );
}
