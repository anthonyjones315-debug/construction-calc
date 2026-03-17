import type { ReactNode } from "react";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Saved Estimates | Pro Construction Calc",
  "Private saved estimates and financial workspace pages for Pro Construction Calc.",
);

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
