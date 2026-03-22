import { LeadCaptureProvider } from "@/hooks/use-lead-capture";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PlatformFilmSection from "@/components/landing/PlatformFilmSection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";

export default function Index() {
  return (
    <LeadCaptureProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <PlatformFilmSection />
        <CapabilitiesSection />
        <ComparisonSection />
        <FAQSection />
        <CTASection />
        <Footer />
        <LeadCaptureModal />
      </div>
    </LeadCaptureProvider>
  );
}
