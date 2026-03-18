"use client";

import dynamic from "next/dynamic";

const WelcomeGuidePopup = dynamic(
  () =>
    import("@/components/ui/WelcomeGuidePopup").then(
      (mod) => mod.WelcomeGuidePopup,
    ),
  { ssr: false },
);

export default function WelcomeGuidePopupClient() {
  return <WelcomeGuidePopup />;
}
