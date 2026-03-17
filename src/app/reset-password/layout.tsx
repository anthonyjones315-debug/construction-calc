import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Reset Password | Pro Construction Calc",
  "Reset your Pro Construction Calc account password.",
);

export default function ResetPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
