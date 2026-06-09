import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import EventsSection from "../components/EventsSection";
import WhyChooseUs from "../components/WhyChooseUs";
import PackagesSection from "../components/PackagesSection";
import GallerySection from "../components/GallerySection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import FAQSection from "../components/FAQSection";  // ← Add this

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen" data-testid="home-page">
      <Navbar />
      <HeroSection />
      <EventsSection />
      <WhyChooseUs />
      <PackagesSection />
      <GallerySection />
      <TestimonialsSection />
      <FAQSection />        {/* ← Add this - before ContactSection */}
      <ContactSection />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}