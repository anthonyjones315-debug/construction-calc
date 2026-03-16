import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <ProfileSettings />
        <PasswordSettings />
      </main>
      <Footer />
    </div>
  );
}
