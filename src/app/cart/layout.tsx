import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Estimate Cart | Pro Construction Calc",
  "Private estimate cart workflow for Pro Construction Calc.",
);

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
