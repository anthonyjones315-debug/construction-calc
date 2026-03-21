import type { Metadata } from "next";
import { BUSINESS_NAME } from "@/lib/business-identity";

export const metadata: Metadata = {
  title: `Create account | ${BUSINESS_NAME}`,
  robots: { index: false, follow: false },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
