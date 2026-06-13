import React, { useState } from "react";
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
import FAQSection from "../components/FAQSection";

export default function HomePage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="bg-[#FAF9F6] min-h-screen" data-testid="home-page">

      {/* Navbar */}
      <Navbar openContactPopup={() => setIsContactOpen(true)} />

      <HeroSection />
      <EventsSection />
      <WhyChooseUs />
      <PackagesSection />
      <GallerySection />
      <TestimonialsSection />
      <FAQSection />

      {isContactOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsContactOpen(false)}>

          <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-2xl font-bold z-50"
            >
              ✕
            </button>

            <ContactSection />

          </div>

        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}