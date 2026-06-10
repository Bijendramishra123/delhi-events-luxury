import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

// Optimized images with smaller sizes and WebP support
const SCROLLING_IMAGES = [
  {
    src: "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    thumbnail: "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg?auto=compress&cs=tinysrgb&w=100&h=75&fit=crop"
  },
  {
    src: "https://images.pexels.com/photos/34079355/pexels-photo-34079355.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    thumbnail: "https://images.pexels.com/photos/34079355/pexels-photo-34079355.jpeg?auto=compress&cs=tinysrgb&w=100&h=75&fit=crop"
  },
  {
    src: "https://images.unsplash.com/photo-1741969494307-55394e3e4071?w=800&h=600&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1741969494307-55394e3e4071?w=100&h=75&fit=crop&q=60"
  },
  {
    src: "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    thumbnail: "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg?auto=compress&cs=tinysrgb&w=100&h=75&fit=crop"
  },
  {
    src: "https://images.unsplash.com/photo-1618566864264-fb013f791da4?w=800&h=600&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1618566864264-fb013f791da4?w=100&h=75&fit=crop&q=60"
  },
  {
    src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=75&fit=crop&q=60"
  },
];

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Preload next image for smoother transitions
  const preloadImage = useCallback((index) => {
    const nextIndex = (index + 1) % SCROLLING_IMAGES.length;
    if (!loadedImages[nextIndex]) {
      const img = new Image();
      img.src = SCROLLING_IMAGES[nextIndex].src;
      img.onload = () => {
        setLoadedImages(prev => ({ ...prev, [nextIndex]: true }));
      };
    }
  }, [loadedImages]);

  // Auto-scroll images every 5 seconds with preloading
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SCROLLING_IMAGES.length;
        preloadImage(nextIndex);
        return nextIndex;
      });
    }, 5000);

    // Preload first few images on mount
    preloadImage(0);
    preloadImage(1);
    preloadImage(2);

    return () => clearInterval(interval);
  }, [preloadImage]);

  // Handle image load state
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden" data-testid="hero-section">
      {/* Off-white background */}
      <div className="absolute inset-0 bg-[#FAF9F6]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-[#6B4F8C] text-xs tracking-[0.3em] uppercase mb-6">
              <Sparkles size={14} />
              <span>Delhi · Noida · Ghaziabad</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-gray-800 leading-[1.2] mb-6 font-medium">
              <span className="block">Celebration</span>
              <span className="block text-[#6B4F8C]">Decorators</span>
            </h1>

            <p className="text-gray-700 text-lg md:text-xl max-w-xl leading-relaxed mb-6 font-light">
              Decor that makes every moment shine
            </p>

            <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed mb-10 font-light border-l-3 border-[#6B4F8C] pl-5">
              From intimate birthday setups to dreamy sangeet nights — Decodaires crafts spaces 
              that feel like magic and last as memories.
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
                className="inline-flex items-center justify-center gap-2 border-2 border-[#6B4F8C]/30 text-[#6B4F8C] px-8 py-4 rounded-full hover:bg-[#6B4F8C] hover:text-white transition-all duration-300 text-sm uppercase tracking-wider"
              >
                View Gallery
              </a>
              <a
                href="#contact"
                data-testid="hero-contact-now"
                className="inline-flex items-center justify-center gap-2 text-[#6B4F8C] px-8 py-4 rounded-full hover:text-[#4F3A6A] transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Contact Now <ChevronRight size={18} />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl border-t border-gray-200 pt-10" data-testid="hero-stats">
              <div>
                <div className="font-heading text-4xl md:text-5xl text-[#6B4F8C] mb-1">
                  <Counter to={500} />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Events Crafted</div>
              </div>
              <div>
                <div className="font-heading text-4xl md:text-5xl text-[#6B4F8C] mb-1">
                  <Counter to={10} suffix="+" />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Years Experience</div>
              </div>
              <div>
                <div className="font-heading text-4xl md:text-5xl text-[#6B4F8C] mb-1">
                  <Counter to={98} suffix="%" />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Happy Clients</div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Optimized Scrolling Images Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[500px] bg-gray-100"
          >
            {/* Loading skeleton */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-10 h-10 border-4 border-[#6B4F8C] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Main scrolling image with lazy loading */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              src={SCROLLING_IMAGES[currentImageIndex].src}
              alt="Celebration decor"
              loading="eager"
              decoding="async"
              onLoadStart={handleImageLoadStart}
              onLoad={handleImageLoad}
              className="w-full h-full object-cover"
              style={{ willChange: "transform, opacity" }}
            />
            
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Image counter indicator */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs z-20">
              {currentImageIndex + 1} / {SCROLLING_IMAGES.length}
            </div>
            
            {/* Dot indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {SCROLLING_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    preloadImage(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentImageIndex 
                      ? "w-8 h-2 bg-[#6B4F8C]" 
                      : "w-2 h-2 bg-gray-400 hover:bg-gray-600"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}