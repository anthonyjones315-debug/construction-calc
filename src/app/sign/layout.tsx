import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Estimate Signature | Pro Construction Calc",
  "Private estimate signature workflow for Pro Construction Calc.",
);

export default function SignLayout({ children }: { children: ReactNode }) {
  return children;
}
