import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Estimate Queue | Pro Construction Calc",
  "Private estimate-to-invoice workflow queue for Pro Construction Calc.",
);

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
