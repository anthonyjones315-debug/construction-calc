import { Suspense } from "react";
import { SignUpClient } from "./SignUpClient";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--shell-header-h))] flex-col items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[--color-orange-brand] border-t-transparent" />
        }
      >
        <SignUpClient />
      </Suspense>
    </div>
  );
}
