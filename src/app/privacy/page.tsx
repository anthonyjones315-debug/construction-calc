import fs from "fs";
import path from "path";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";
import { getPageMetadata } from "@/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Privacy Policy — Pro Construction Calc",
  description:
    "Official Privacy Policy for Pro Construction Calc, including data collection, use, and user rights.",
  path: "/privacy",
});

const privacyHtmlPath = path.join(
  process.cwd(),
  "public",
  "termly-privacy.html",
);

const privacyHtml = fs.readFileSync(privacyHtmlPath, "utf8");

export default function PrivacyPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div
            className="prose prose-sm max-w-none bg-white text-black shadow-md rounded-xl p-4"
            dangerouslySetInnerHTML={{ __html: privacyHtml }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
