
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { id: "home", label: "Home", sectionId: "" },
  { id: "events", label: "Events", sectionId: "events" },
  { id: "packages", label: "Packages", sectionId: "packages" },
  { id: "gallery", label: "Gallery", sectionId: "gallery" },
  { id: "testimonials", label: "Testimonials", sectionId: "testimonials" },
  { id: "contact", label: "Contact", sectionId: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const path = window.location.pathname;
      if (path === "/") {
        for (const link of links) {
          if (link.sectionId) {
            const el = document.getElementById(link.sectionId);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 120 && rect.bottom >= 100) {
                setActiveLink(link.id);
                break;
              }
            }
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (link) => {
    setOpen(false);
    
    const currentPath = window.location.pathname;
    
    if (!link.sectionId) {
      // Home
      if (currentPath !== "/") {
        window.location.href = "/";
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Section
      if (currentPath !== "/") {
        window.location.href = `/#${link.sectionId}`;
      } else {
        scrollToSection(link.sectionId);
        window.history.pushState(null, "", `#${link.sectionId}`);
      }
    }
  };

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-md shadow-md py-2" 
      : "bg-white/80 backdrop-blur-sm py-3"
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
            setOpen(false);
          }}
          className="flex items-center gap-3 focus:outline-none"
        >
          <img src="/assets/logo.png" alt="Decodiaries" className="h-10 md:h-12 w-auto" />
        </button>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => handleNavClick(link)}
                className={`relative text-xs uppercase tracking-wide font-semibold transition px-2 py-1 ${
                  activeLink === link.id && window.location.pathname === "/"
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#6B4F8C] rounded-full transition-all duration-300 ${
                    activeLink === link.id && window.location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <button
          onClick={() => handleNavClick({ sectionId: "contact" })}
          className="hidden lg:inline-flex items-center text-xs uppercase tracking-wider px-5 py-2 rounded-full shadow-md bg-[#6B4F8C] text-white hover:bg-[#4F3A6A] active:scale-95 transition-all"
        >
          Book Consultation
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg text-gray-700 active:bg-gray-100 transition-all"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link)}
                    className="block text-gray-700 text-base py-3 px-3 rounded-lg active:bg-gray-50 transition-all w-full text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    handleNavClick({ sectionId: "contact" });
                    setOpen(false);
                  }}
                  className="w-full text-center bg-[#6B4F8C] text-white py-3 rounded-full text-sm font-medium mt-2 active:scale-95 transition-all"
                >
                  Book Consultation
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
