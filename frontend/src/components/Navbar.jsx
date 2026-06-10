
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/", hash: "" },
  { name: "Events", href: "/", hash: "events" },
  { name: "Packages", href: "/", hash: "packages" },
  { name: "Gallery", href: "/", hash: "gallery" },
  { name: "Testimonials", href: "/", hash: "testimonials" },
  { name: "Contact", href: "/", hash: "contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active link based on scroll position (only on home page)
      if (location.pathname === "/") {
        const sections = navLinks.map(link => link.hash).filter(h => h);
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              setActiveLink(section.charAt(0).toUpperCase() + section.slice(1));
              break;
            }
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Handle hash navigation after route change
  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const hash = location.hash.substring(1);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const scrollToSection = (hash) => {
    if (location.pathname !== "/") {
      // Navigate to home page first, then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleClick = (e, link) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (link.hash === "") {
      // Home link
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (location.pathname !== "/") {
        navigate("/");
      }
    } else {
      scrollToSection(link.hash);
    }
  };

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(107,79,140,0.08)] border-b border-[#6B4F8C]/20 py-3" 
      : "bg-white/80 backdrop-blur-sm py-5"
  }`;

  return (
    <nav className={navClass} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group"
        >
          <img
            src="/assets/logo.png"
            alt="Decodiaries"
            className="h-12 md:h-14 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.hash ? `/#${link.hash}` : "/"}
                onClick={(e) => handleClick(e, link)}
                className={`relative text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 px-2 py-1 ${
                  activeLink === link.name && location.pathname === "/"
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] rounded-full transition-all duration-300 ${
                    activeLink === link.name && location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="/#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contact");
            }}
            className="inline-flex items-center text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all duration-300 bg-[#6B4F8C] text-white hover:bg-[#4F3A6A] hover:scale-105"
          >
            Book Consultation
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-[#6B4F8C] hover:bg-gray-100 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-[#6B4F8C]/20 px-6 py-6 shadow-lg"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link, idx) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <a
                    href={link.hash ? `/#${link.hash}` : "/"}
                    onClick={(e) => handleClick(e, link)}
                    className={`block text-gray-700 text-sm uppercase tracking-wider py-2 px-2 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:text-[#6B4F8C] ${
                      activeLink === link.name && location.pathname === "/" ? "text-[#6B4F8C] font-semibold" : ""
                    }`}
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <a
                  href="/#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contact");
                    setIsOpen(false);
                  }}
                  className="block text-center bg-[#6B4F8C] text-white px-4 py-3 rounded-full text-sm uppercase tracking-wider mt-3 shadow-md hover:bg-[#4F3A6A] transition-all duration-300"
                >
                  Book Consultation
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
