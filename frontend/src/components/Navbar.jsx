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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location]);

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(107,79,140,0.08)] border-b border-[#BFA2DB]/30 py-3" : "bg-transparent py-5"
  }`;

  return (
    <nav className={navClass} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <img
            src="/assets/logo.png"
            alt="Decodiaries"
            className="h-12 md:h-14 w-auto group-hover:scale-105 transition-transform"
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.to}
                data-testid={`nav-${l.id}`}
                className={`text-sm uppercase tracking-[0.18em] font-semibold transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-500 ${
                  scrolled
                    ? "text-[#6B4F8C] hover:text-[#4F3A6A] after:bg-[#6B4F8C]"
                    : "text-white hover:text-[#BFA2DB] after:bg-[#BFA2DB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/#contact"
            data-testid="navbar-cta"
            className={`hidden md:inline-flex items-center text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ${
              scrolled
                ? "bg-[#6B4F8C] text-white hover:bg-[#4F3A6A]"
                : "bg-white/95 text-[#6B4F8C] hover:bg-white"
            }`}
          >
            Book Consultation
          </a>
          <button
            data-testid="mobile-menu-toggle"
            className={`lg:hidden p-2 ${scrolled ? "text-[#6B4F8C]" : "text-white drop-shadow-md"}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[#F8F5F2] border-t border-[#BFA2DB]/30 px-6 py-6"
          >
            <ul className="flex flex-col gap-4">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.to}
                    data-testid={`mobile-nav-${l.id}`}
                    onClick={() => setOpen(false)}
                    className="block text-[#333] text-sm uppercase tracking-wider py-2"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-cta"
                  className="inline-block bg-[#6B4F8C] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider mt-2"
                >
                  Book Consultation
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
