
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      if (location.pathname === "/") {
        const sections = ["home", "events", "packages", "gallery", "testimonials", "contact"];
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
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const scrollToSection = (hash) => {
    if (hash === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClick = (e, link) => {
    e.preventDefault();
    setOpen(false);
    
    if (link.hash === "") {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      if (location.pathname !== "/") {
        navigate(`/#${link.hash}`);
        setTimeout(() => scrollToSection(link.hash), 200);
      } else {
        scrollToSection(link.hash);
      }
    }
  };

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(107,79,140,0.08)] border-b border-[#6B4F8C]/20 py-3" 
      : "bg-white/80 backdrop-blur-sm py-5"
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group"
        >
          <img src="/assets/logo.png" alt="Decodiaries" className="h-12 md:h-14 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.hash ? `/#${link.hash}` : "/"}
                onClick={(e) => handleClick(e, link)}
                className={`relative text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 px-2 py-1 ${
                  activeLink === link.id && location.pathname === "/"
                    ? "text-[#6B4F8C]"
                    : "text-gray-700 hover:text-[#6B4F8C]"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] rounded-full transition-all duration-300 ${
                  activeLink === link.id && location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => handleClick({ preventDefault: () => {} }, { hash: "contact" })}
            className="inline-flex items-center text-sm uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all duration-300 bg-[#6B4F8C] text-white hover:bg-[#4F3A6A]"
          >
            Book Consultation
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-gray-700">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-[#6B4F8C]/20 px-6 py-6 shadow-lg"
          >
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.hash ? `/#${link.hash}` : "/"}
                    onClick={(e) => handleClick(e, link)}
                    className="block text-gray-700 text-sm uppercase tracking-wider py-3 px-4 rounded-lg hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleClick({ preventDefault: () => {} }, { hash: "contact" })}
                  className="w-full text-center bg-[#6B4F8C] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider mt-3"
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
