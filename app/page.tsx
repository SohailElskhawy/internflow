import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBanner } from "@/components/landing/StatsBanner";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InternshipsPreview } from "@/components/landing/InternshipsPreview";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsBanner />
        <FeaturesSection />
        <InternshipsPreview />
      </main>
      <LandingFooter />
    </div>
  );
}
