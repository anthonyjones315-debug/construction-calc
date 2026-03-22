import type { Metadata } from "next";
import { BUSINESS_NAME } from "@/lib/business-identity";

export const metadata: Metadata = {
  title: `Sign in | ${BUSINESS_NAME}`,
  robots: { index: false, follow: false },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
