import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", id: "home" },
  { name: "Events", id: "events" },
  { name: "Packages", id: "packages" },
  { name: "Gallery", id: "gallery" },
  { name: "Testimonials", id: "testimonials" },
  { name: "Contact", id: "contact" },
];

export default function Navbar({ openContactPopup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll + active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = navItems.map((item) => item.id);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= 150 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash on load
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    }
  }, []);

  // Scroll function
  const scrollToSection = (sectionId) => {
    console.log("Clicked:", sectionId);

    if (sectionId === "contact") {
      if (openContactPopup) openContactPopup();
      setMobileMenuOpen(false);
      return;
    }

    const element = document.getElementById(sectionId);

    console.log("Element Found:", element);

    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: "smooth",
    });

    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-white/80 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2 focus:outline-none active:scale-95 transition-transform"
          >
            <img
              src="/assets/logo.png"
              alt="Decodiaries"
              className="h-10 md:h-12 w-auto"
            />
          </button>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`relative text-sm font-medium transition-all duration-300 py-1 ${
                    activeSection === item.id
                      ? "text-[#6B4F8C]"
                      : "text-gray-700 hover:text-[#6B4F8C]"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#6B4F8C] rounded-full transition-all duration-300 ${
                      activeSection === item.id ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <button
            onClick={() => scrollToSection("contact")}
            className="hidden md:block bg-[#6B4F8C] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#4F3A6A] transition-all active:scale-95 shadow-md"
          >
            Book Consultation
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => {
              console.log("toggle clicked");
              setMobileMenuOpen((prev) => !prev);
            }}
            className="md:hidden p-2 rounded-lg text-gray-700 active:bg-gray-100 transition-all z-[10000] relative"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          <div
  className={`md:hidden mt-4 border-t border-gray-100 overflow-hidden transition-all duration-300 ${
    mobileMenuOpen ? "max-h-[400px] opacity-100 pt-4 pb-4" : "max-h-0 opacity-0"
  }`}
>
  <ul className="flex flex-col gap-2">
    {navItems.map((item) => (
      <li key={item.id}>
        <button
          onClick={() => scrollToSection(item.id)}
          className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
        >
          {item.name}
        </button>
      </li>
    ))}

    <li>
      <button
        onClick={() => scrollToSection("contact")}
        className="w-full mt-2 bg-[#6B4F8C] text-white py-3 rounded-full"
      >
        Book Consultation
      </button>
    </li>
  </ul>
</div>
        </AnimatePresence>
      </div>
    </nav>
  );
}