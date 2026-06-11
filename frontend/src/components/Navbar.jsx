
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { id: "home", label: "Home", path: "/", hash: "" },
  { id: "events", label: "Events", path: "/", hash: "events" },
  { id: "packages", label: "Packages", path: "/", hash: "packages" },
  { id: "gallery", label: "Gallery", path: "/", hash: "gallery" },
  { id: "testimonials", label: "Testimonials", path: "/", hash: "testimonials" },
  { id: "contact", label: "Contact", path: "/", hash: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Handle scroll effect and active link
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      if (location.pathname === "/") {
        const sections = ["home", "events", "packages", "gallery", "testimonials", "contact"];
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 100) {
              setActiveLink(section);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // Handle hash on page load
  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [location]);

  const scrollToSection = (hash) => {
    if (!hash || hash === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigation = (link) => {
    setOpen(false);
    
    if (link.hash === "") {
      // Home link
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Section link
      if (location.pathname !== "/") {
        navigate(`/#${link.hash}`);
        setTimeout(() => scrollToSection(link.hash), 300);
      } else {
        scrollToSection(link.hash);
        // Update URL hash without causing page jump
        window.history.pushState(null, "", `#${link.hash}`);
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
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setOpen(false);
          }}
          className="flex items-center gap-3 focus:outline-none"
        >
          <img src="/assets/logo.png" alt="Decodiaries" className="h-10 md:h-12 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                to={link.hash ? `/#${link.hash}` : "/"}
                onClick={(e) => {
                  if (link.hash) {
                    e.preventDefault();
                    handleNavigation(link);
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`relative text-xs uppercase tracking-wide font-semibold transition px-2 py-1 ${
                  activeLink === link.id && location.pathname === "/"
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#6B4F8C] rounded-full transition-all duration-300 ${
                    activeLink === link.id && location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <button
          onClick={() => handleNavigation({ hash: "contact" })}
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
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link, idx) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={link.hash ? `/#${link.hash}` : "/"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link);
                    }}
                    className="block text-gray-700 text-base py-3 px-3 rounded-lg active:bg-gray-50 transition-all w-full text-left"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => {
                    handleNavigation({ hash: "contact" });
                    setOpen(false);
                  }}
                  className="w-full text-center bg-[#6B4F8C] text-white py-3 rounded-full text-sm font-medium mt-2 active:scale-95 transition-all"
                >
                  Book Consultation
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
