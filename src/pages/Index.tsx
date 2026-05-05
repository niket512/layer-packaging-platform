import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import QuickAccess from "@/components/landing/QuickAccess";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PlatformFilmSection from "@/components/landing/PlatformFilmSection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import FAQSection from "@/components/landing/FAQSection";
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
      <QuickAccess />
      <ProblemSection />
      <HowItWorksSection />
      <PlatformFilmSection />
      <CapabilitiesSection />
      <ComparisonSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <BackToTop />
    </div>
  );
}
