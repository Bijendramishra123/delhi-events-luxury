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
    scrolled ? "bg-[#F8F5F2]/85 backdrop-blur-xl border-b border-[#BFA2DB]/20 py-3" : "bg-transparent py-5"
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
          <div className="hidden sm:block leading-tight border-l border-[#BFA2DB]/40 pl-3">
            <div className="font-heading text-sm text-[#6B4F8C] font-semibold tracking-wide">Delhi NCR</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#666]">Event Planner</div>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.to}
                data-testid={`nav-${l.id}`}
                className="text-sm uppercase tracking-[0.18em] text-[#333] hover:text-[#6B4F8C] transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-[#6B4F8C] after:transition-all after:duration-500"
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
            className="hidden md:inline-flex items-center bg-[#6B4F8C] text-white text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#4F3A6A] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            Book Consultation
          </a>
          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden text-[#6B4F8C] p-2"
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
