import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Price Book | Pro Construction Calc",
  "Private price book workspace for Pro Construction Calc.",
);

export default function PriceBookLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
