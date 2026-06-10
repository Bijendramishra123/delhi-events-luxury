
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { id: "home", label: "Home", hash: "" },
  { id: "events", label: "Events", hash: "events" },
  { id: "packages", label: "Packages", hash: "packages" },
  { id: "gallery", label: "Gallery", hash: "gallery" },
  { id: "testimonials", label: "Testimonials", hash: "testimonials" },
  { id: "contact", label: "Contact", hash: "contact" },
];

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
  const navigate = useNavigate();

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    if (!sectionId || sectionId === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    // Try to find the element
    let element = document.getElementById(sectionId);
    
    // If not found, wait a bit and try again (for page navigation)
    if (!element) {
      setTimeout(() => {
        element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
      return;
    }
    
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handle click on nav link
  const handleClick = (e, link) => {
  e.preventDefault();
  setOpen(false);

  // Home link
  if (!link.hash || link.hash === "") {
    if (location.pathname !== "/") {
      window.location.href = "/";
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    setActiveLink("home");
    return;
  }

  // If not on home page
  if (location.pathname !== "/") {
    window.location.href = `/#${link.hash}`;
    return;
  }

  // Scroll to section
  const element = document.getElementById(link.hash);

  if (element) {
    const navbarHeight = 100;

    const y =
      element.getBoundingClientRect().top +
      window.pageYOffset -
      navbarHeight;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    setActiveLink(link.hash);
  }
};
  // Handle scroll and active link
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      
      // Update active link based on scroll position (only on home page)
      if (location.pathname === "/") {
        const sections = links.map(l => l.hash).filter(h => h);
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
              setActiveLink(section);
              break;
            }
          }
        }
      }
    };
    
    window.addEventListener("scroll", onScroll);
    // Trigger once on mount
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // Handle hash on page load and navigation
  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const hash = location.hash.substring(1);
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        scrollToSection(hash);
        setActiveLink(hash);
      }, 300);
    }
  }, [location]);

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(107,79,140,0.08)] border-b border-[#6B4F8C]/20 py-3" 
      : "bg-white/80 backdrop-blur-sm py-5"
  }`;

  return (
    <nav className={navClass} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            if (location.pathname !== "/") {
              navigate("/");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            setOpen(false);
          }}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <motion.img
            src="/assets/logo.png"
            alt="Decodiaries"
            className="h-12 md:h-14 w-auto"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          />
        </button>

        {/* Desktop Menu */}
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
              <button
                onClick={(e) => handleClick(e, l)}
                className={`relative text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 px-2 py-1 cursor-pointer focus:outline-none ${
                  activeLink === l.hash && location.pathname === "/" && l.hash !== ""
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {l.label}
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] rounded-full transition-all duration-300 ${
                    activeLink === l.hash && location.pathname === "/" && l.hash !== "" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
                <span className="absolute inset-0 rounded-lg bg-[#6B4F8C]/0 transition-all duration-300 hover:bg-[#6B4F8C]/5 -z-10" />
              </button>
            </motion.li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            onClick={() => handleClick({ preventDefault: () => {} }, { hash: "contact" })}
            className="inline-flex items-center text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all duration-300 bg-[#6B4F8C] text-white hover:bg-[#4F3A6A] cursor-pointer focus:outline-none"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Consultation
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <motion.button
          className={`lg:hidden p-2 rounded-lg transition-colors duration-300 focus:outline-none ${
            scrolled ? "text-[#6B4F8C] hover:bg-gray-100" : "text-[#6B4F8C] hover:bg-gray-100"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-[#6B4F8C]/20 px-6 py-6 shadow-lg max-h-[80vh] overflow-y-auto"
          >
            <ul className="flex flex-col gap-3">
              {links.map((l, idx) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={(e) => handleClick(e, l)}
                    className={`block w-full text-left text-gray-700 text-sm uppercase tracking-wider py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${
                      activeLink === l.hash && location.pathname === "/" && l.hash !== ""
                        ? "bg-[#6B4F8C]/10 text-[#6B4F8C] font-semibold"
                        : "hover:bg-gray-50 hover:text-[#6B4F8C]"
                    }`}
                  >
                    {l.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
              >
                <button
                  onClick={(e) => {
                    handleClick(e, { hash: "contact" });
                    setOpen(false);
                  }}
                  className="inline-block w-full text-center bg-[#6B4F8C] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider mt-3 shadow-md hover:bg-[#4F3A6A] transition-all duration-300 cursor-pointer focus:outline-none"
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
