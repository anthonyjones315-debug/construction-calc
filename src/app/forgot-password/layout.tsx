import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Forgot Password | Pro Construction Calc",
  "Password recovery for Pro Construction Calc accounts.",
);

export default function ForgotPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
