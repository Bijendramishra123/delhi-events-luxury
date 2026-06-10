
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Send, Sparkles, X } from "lucide-react";
import api, { formatPrice } from "../lib/api";

const CATEGORIES = ["All", "Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];

// Lazy Image Component
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();
  const inView = useInView(imgRef, { once: true, margin: "100px" });

  useEffect(() => {
    if (inView && imgRef.current) {
      const img = new Image();
      img.src = src;
      img.onload = () => setLoaded(true);
    }
  }, [inView, src]);

  return (
    <div ref={imgRef} className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        />
      )}
    </div>
  );
};

function AvailabilityBadge({ status }) {
  const map = {
    "Available": "bg-emerald-100 text-emerald-700",
    "Limited Availability": "bg-amber-100 text-amber-700",
    "Fully Booked": "bg-red-100 text-red-700",
    "Coming Soon": "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status === "Limited Availability" ? "Limited" : status}
    </span>
  );
}

// Mobile-Optimized Toast Notification Component
const ToastNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -80, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed top-4 left-4 right-4 z-50 md:left-1/2 md:right-auto md:-translate-x-1/2 md:min-w-[380px] md:max-w-md"
    >
      <div className="bg-gradient-to-r from-[#6B4F8C] to-[#8B6FAC] text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-3 border border-white/20">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Send size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm md:text-base font-semibold leading-tight">{message}</p>
            <p className="text-xs text-white/80 mt-0.5">✨ Redirecting you to contact section...</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition active:scale-95 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/packages")
      .then(res => { setPackages(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? packages : packages.filter(p => p.event_category === filter);
  const displayed = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleInquiry = (pkg) => {
    setToastMessage(`✨ "${pkg.package_name}"`);
    setShowToast(true);
    
    sessionStorage.setItem("inquiryPackage", JSON.stringify({
      name: pkg.package_name,
      category: pkg.event_category,
      price: pkg.price
    }));
    
    setTimeout(() => {
      navigate("/");
      setTimeout(() => {
        const contact = document.getElementById("contact");
        if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }, 800);
  };

  const closeToast = () => {
    setShowToast(false);
  };

  // Skeleton Loader
  if (loading) {
    return (
      <section id="packages" className="py-16 md:py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-12 md:py-20 lg:py-24 bg-[#FAF9F6] relative">
      {/* Toast Notification - Fixed position */}
      <AnimatePresence>
        {showToast && <ToastNotification message={`✨ ${toastMessage} selected! Please fill the contact form below.`} onClose={closeToast} />}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6B4F8C]" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Curated Packages</span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-[#6B4F8C] leading-tight">
            Choose your <span className="text-[#BFA2DB]">perfect</span> celebration
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2 max-w-2xl mx-auto">Explore our handcrafted packages designed for every special moment</p>
        </div>

        {/* Horizontal Scroll Categories */}
        <div className="flex flex-nowrap gap-2 mb-6 md:mb-8 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setFilter(c); setVisibleCount(6); }}
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium uppercase tracking-wider transition-all whitespace-nowrap touch-manipulation ${
                filter === c
                  ? "bg-[#6B4F8C] text-white shadow-md active:scale-95"
                  : "bg-white text-[#6B4F8C] border border-[#BFA2DB]/30 active:bg-gray-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayed.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99] touch-manipulation"
            >
              <LazyImage
                src={p.cover_image || "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg"}
                alt={p.package_name}
                className="w-full h-full object-cover"
              />
              
              <div className="p-3 md:p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] md:text-xs uppercase tracking-wide text-[#6B4F8C]/70 font-medium">{p.event_category}</span>
                  <AvailabilityBadge status={p.availability_status} />
                </div>
                
                <h3 className="font-heading text-base md:text-xl text-[#6B4F8C] font-semibold mb-1 line-clamp-1">{p.package_name}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-3 line-clamp-2">{p.description}</p>

                <ul className="space-y-1 mb-3">
                  {(p.services || []).slice(0, 2).map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <Check size={12} className="text-[#BFA2DB] mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{s}</span>
                    </li>
                  ))}
                  {(p.services || []).length > 2 && (
                    <li className="text-[10px] text-gray-400 pl-5">+{p.services.length - 2} more services</li>
                  )}
                </ul>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[10px] text-gray-400">Starting at</span>
                    {p.discount_price ? (
                      <>
                        <span className="font-heading text-lg md:text-2xl text-[#6B4F8C] font-bold">{formatPrice(p.discount_price)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                      </>
                    ) : (
                      <span className="font-heading text-lg md:text-2xl text-[#6B4F8C] font-bold">{formatPrice(p.price)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/packages/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#6B4F8C] text-white px-3 py-2 rounded-full text-[11px] md:text-xs font-medium uppercase tracking-wider active:scale-95 transition-all"
                    >
                      Details <ArrowRight size={12} />
                    </Link>
                    <button
                      onClick={() => handleInquiry(p)}
                      className="flex items-center justify-center gap-1 bg-[#25D366] text-white px-3 py-2 rounded-full text-[11px] md:text-xs font-medium uppercase tracking-wider active:scale-95 transition-all whitespace-nowrap touch-manipulation"
                    >
                      <Send size={12} /> Enquire
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8 md:mt-10">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 bg-white border border-[#6B4F8C] text-[#6B4F8C] rounded-full text-xs md:text-sm font-medium active:scale-95 transition-all touch-manipulation"
            >
              Load More <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
