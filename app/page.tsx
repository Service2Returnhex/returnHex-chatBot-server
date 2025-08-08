"use client";

import FeatureCardGrid from "@/components/FeatureCard";
import GalleryGrid from "@/components/Gallery";
import HeroSection from "@/components/HeroSection";
import PricingGrid from "@/components/PricingGrid";
import StepsFlow from "@/components/StepsFlows";
import TestimonialCarousel from "@/components/Testimonial";
import CtaButton from "@/components/ui/CtaButton";
import Navbar from "@/components/ui/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-radial-aurora relative text-white ">
      <Navbar />
      <CtaButton />
      <HeroSection />
      <FeatureCardGrid />
      <StepsFlow />
      {/* <ChatDemo /> */}
      <PricingGrid />
      <TestimonialCarousel />
      <GalleryGrid />
    </div>
  );
}
