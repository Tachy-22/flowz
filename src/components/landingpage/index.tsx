"use client";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
//import FlowSection from "./FlowSection";
import BenefitsSection from "./BenefitsSection";
import FeaturesSection from "./FeaturesSection";
//import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import FooterSection from "./FooterSection";
import WorkspacePreview from "./WorkspacePreview";

const LandingPage = () => {
  return (
    <div className="min-h-[200vh] h-full overflow-y-auto bg-white">
      <Navigation />
      <HeroSection />
      <WorkspacePreview />

      <BenefitsSection />
      <FeaturesSection />
      {/* <TestimonialsSection /> */}
      <FAQSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
