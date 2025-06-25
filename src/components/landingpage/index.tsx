"use client";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import FlowSection from "./FlowSection";
import BenefitsSection from "./BenefitsSection";
import FeaturesSection from "./FeaturesSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import FooterSection from "./FooterSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <FlowSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
