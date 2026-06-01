import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import ScrollProgress from "@/components/landing/ScrollProgress";
import BackToTop from "@/components/landing/BackToTop";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
      <BackToTop />
    </div>
  );
}
