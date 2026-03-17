import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { ConsentSettings } from "@/components/settings/ConsentSettings";
import { getNoIndexMetadata } from "@/seo";

export const metadata = getNoIndexMetadata(
  "Settings | Pro Construction Calc",
  "Private account settings and Termly-managed consent preferences for Pro Construction Calc.",
);

export default function SettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[--color-bg]">
      <Header />
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
        <ProfileSettings />
        <PasswordSettings />
        <ConsentSettings />
      </main>
      <Footer />
    </div>
  );
}
