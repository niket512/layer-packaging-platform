import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import IntelligentAISection from "@/components/landing/IntelligentAISection";
import CapabilitiesSection from "@/components/landing/CapabilitiesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhatWeOfferSection from "@/components/landing/WhatWeOfferSection";
import DashboardPreviewSection from "@/components/landing/DashboardPreviewSection";
import CTASection from "@/components/landing/CTASection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import ScrollProgress from "@/components/landing/ScrollProgress";
import BackToTop from "@/components/landing/BackToTop";
import SectionNav from "@/components/landing/SectionNav";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <HeroSection />
      <SectionNav />
      <CapabilitiesSection />
      <IntelligentAISection />
      <HowItWorksSection />
      <WhatWeOfferSection />
      <DashboardPreviewSection />
      <CTASection />
      <ComparisonSection />
      <ReviewsSection />
      <FAQSection />
      <Footer />
      <BackToTop />
    </div>
  );
}
