import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { routes } from "@routes";
import NewEstimateClient from "./NewEstimateClient";

export const metadata: Metadata = {
  title: "New Estimate | Pro Construction Calc",
  description: "Create a new estimate for your construction project.",
  robots: { index: false, follow: false },
};

export default async function NewEstimatePage() {
  const session = await auth();

  if (!session?.user?.id) {
    const params = new URLSearchParams({
      callbackUrl: "/command-center/estimates/new",
    });
    redirect(`${routes.auth.signIn}?${params.toString()}` as Route);
  }

  return (
    <div className="light public-page page-shell command-center-page-shell grid min-h-dvh grid-rows-[auto_1fr] overflow-hidden">
      <Header />
      <main id="main-content" className="row-start-2 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-3 py-4 pb-28 sm:px-4 sm:py-6 sm:pb-10">
          <NewEstimateClient />
        </div>
      </main>
    </div>
  );
}
