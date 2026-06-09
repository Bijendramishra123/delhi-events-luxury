import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

const HERO_IMG = "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg";

function Counter({ to, suffix = "+", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / (duration * 1000), 1);
      setVal(Math.floor(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
      else setVal(to);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20" data-testid="hero-section">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Luxury event setup" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f24]/85 via-[#2d1a3d]/60 to-[#1a0f24]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 text-[#BFA2DB] text-xs tracking-[0.3em] uppercase mb-6">
            <Sparkles size={14} />
            <span>Delhi · Noida · Gurgaon</span>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 font-medium">
            Crafting <em className="text-[#BFA2DB] not-italic font-light">unforgettable</em> luxury moments
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-light">
            From intimate gatherings to grand celebrations — bespoke event planning across Delhi NCR
            for weddings, birthdays, anniversaries, baby showers, corporate galas and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#packages"
              data-testid="hero-explore-packages"
              className="inline-flex items-center justify-center gap-2 bg-[#6B4F8C] text-white px-8 py-4 rounded-full hover:bg-[#4F3A6A] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Explore Packages <ChevronRight size={18} />
            </a>
            <a
              href="#gallery"
              data-testid="hero-view-gallery"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 backdrop-blur-sm text-white px-8 py-4 rounded-full hover:bg-white hover:text-[#6B4F8C] hover:border-white transition-all duration-300 text-sm uppercase tracking-wider"
            >
              View Gallery
            </a>
            <a
              href="#contact"
              data-testid="hero-contact-now"
              className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full hover:text-[#BFA2DB] transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Contact Now <ChevronRight size={18} />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl border-t border-white/15 pt-10" data-testid="hero-stats">
            <div>
              <div className="font-heading text-4xl md:text-5xl text-[#BFA2DB] mb-1">
                <Counter to={500} />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Events Crafted</div>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-[#BFA2DB] mb-1">
                <Counter to={10} suffix="+" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Years Experience</div>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-[#BFA2DB] mb-1">
                <Counter to={98} suffix="%" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Happy Clients</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
