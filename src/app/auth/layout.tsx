import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Account Access | Pro Construction Calc",
  "Sign-in and account access pages for Pro Construction Calc.",
);

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
