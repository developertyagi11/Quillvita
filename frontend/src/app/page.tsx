import type { Metadata } from "next";

import { BackendWarmup } from "@/components/features/landing/BackendWarmup";
import { Faq } from "@/components/features/landing/Faq";
import { FeatureGrid } from "@/components/features/landing/FeatureGrid";
import { FinalCta } from "@/components/features/landing/FinalCta";
import { Hero } from "@/components/features/landing/Hero";
import { HonestSection } from "@/components/features/landing/HonestSection";
import { HowItWorks } from "@/components/features/landing/HowItWorks";
import { PrivacySection } from "@/components/features/landing/PrivacySection";
import { StructuredData } from "@/components/features/landing/StructuredData";
import { AppShell } from "@/components/features/layout/AppShell";
import { ROUTES } from "@/lib/routes";
import { publicPageMetadata } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({ path: ROUTES.home });

export default function LandingPage(): React.JSX.Element {
  return (
    <AppShell mainClassName="flex flex-col">
      <StructuredData />
      <BackendWarmup />
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <HonestSection />
      <PrivacySection />
      <Faq />
      <FinalCta />
    </AppShell>
  );
}
