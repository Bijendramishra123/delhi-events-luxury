import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { id: "home", label: "Home", to: "/#home" },
  { id: "events", label: "Events", to: "/#events" },
  { id: "packages", label: "Packages", to: "/#packages" },
  { id: "gallery", label: "Gallery", to: "/#gallery" },
  { id: "testimonials", label: "Testimonials", to: "/#testimonials" },
  { id: "contact", label: "Contact", to: "/#contact" },
];

// Animation variants for nav items
const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
  }),
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      
      // Update active link based on scroll position
      const sections = links.map(l => l.id);
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveLink(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location]);

  const handleClick = (e, to) => {
    e.preventDefault();
    const hash = to.split("#")[1];
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  // Scrolled state with white background (for off-white page)
  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(107,79,140,0.08)] border-b border-[#6B4F8C]/20 py-3" 
      : "bg-white/80 backdrop-blur-sm py-5"
  }`;

  return (
    <nav className={navClass} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          data-testid="logo-link" 
          className="flex items-center gap-3 group"
        >
          <motion.img
            src="/assets/logo.png"
            alt="Decodiaries"
            className="h-12 md:h-14 w-auto"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l, index) => (
            <motion.li
              key={l.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <a
                href={l.to}
                data-testid={`nav-${l.id}`}
                onClick={(e) => handleClick(e, l.to)}
                className={`relative text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 px-2 py-1 ${
                  activeLink === l.id
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {l.label}
                {/* Animated underline */}
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] rounded-full ${
                    activeLink === l.id ? "w-full" : "w-0"
                  }`}
                  animate={{ width: activeLink === l.id ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
                {/* Hover effect background */}
                <span className="absolute inset-0 rounded-lg bg-[#6B4F8C]/0 transition-all duration-300 group-hover:bg-[#6B4F8C]/5 -z-10" />
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <motion.a
            href="/#contact"
            data-testid="navbar-cta"
            onClick={(e) => handleClick(e, "/#contact")}
            className="hidden md:inline-flex items-center text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all duration-300"
            style={{
              backgroundColor: scrolled ? "#6B4F8C" : "#6B4F8C",
              color: "white",
            }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(107,79,140,0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Book Consultation
          </motion.a>
          
          <motion.button
            data-testid="mobile-menu-toggle"
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              scrolled ? "text-[#6B4F8C] hover:bg-gray-100" : "text-[#6B4F8C] hover:bg-gray-100"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-[#6B4F8C]/20 px-6 py-6 shadow-lg"
          >
            <ul className="flex flex-col gap-3">
              {links.map((l, idx) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <a
                    href={l.to}
                    data-testid={`mobile-nav-${l.id}`}
                    onClick={(e) => handleClick(e, l.to)}
                    className={`block text-gray-700 text-sm uppercase tracking-wider py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeLink === l.id
                        ? "bg-[#6B4F8C]/10 text-[#6B4F8C] font-semibold"
                        : "hover:bg-gray-50 hover:text-[#6B4F8C]"
                    }`}
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
              >
                <a
                  href="/#contact"
                  onClick={(e) => handleClick(e, "/#contact")}
                  data-testid="mobile-cta"
                  className="inline-block w-full text-center bg-[#6B4F8C] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider mt-3 shadow-md hover:bg-[#4F3A6A] transition-all duration-300"
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