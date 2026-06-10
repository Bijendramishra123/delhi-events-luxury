
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight, Check, Send, Sparkles } from "lucide-react";
import api, { buildWhatsAppLink, formatPrice } from "../lib/api";

const CATEGORIES = ["All", "Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];

const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative overflow-hidden bg-gray-100">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />}
      <img src={src} alt={alt} loading="lazy" className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`} onLoad={() => setLoaded(true)} />
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
  return <span className={`text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 rounded-full uppercase tracking-wider ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
}

export default function PackagesSection({ whatsapp = "918796306375" }) {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/packages").then((r) => { setPackages(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? packages : packages.filter((p) => p.event_category === filter);
  const displayedPackages = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const loadMore = () => setVisibleCount(prev => prev + 6);

  const handleInquiryClick = (pkg) => {
    sessionStorage.setItem("inquiryPackage", JSON.stringify({
      name: pkg.package_name,
      category: pkg.event_category,
      price: pkg.price
    }));
    navigate("/");
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) contactSection.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  if (loading) {
    return (
      <section id="packages" className="py-24 md:py-32 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"><div className="aspect-[4/3] bg-gray-200" /><div className="p-6 space-y-3"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-6 bg-gray-200 rounded w-2/3" /><div className="h-4 bg-gray-200 rounded w-full" /></div></div>)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-16 md:py-24 lg:py-32 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Curated Packages</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#6B4F8C] leading-tight">Choose your <span className="text-[#BFA2DB]">perfect</span> celebration</h2>
        </div>

        <div className="flex flex-nowrap md:flex-wrap gap-2 mb-8 md:mb-12 overflow-x-auto pb-4 md:pb-0 scrollbar-none">
          {CATEGORIES.map(c => <button key={c} onClick={() => { setFilter(c); setVisibleCount(6); }} className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${filter === c ? "bg-[#6B4F8C] text-white shadow-md" : "bg-white text-[#6B4F8C] hover:bg-[#BFA2DB]/30"}`}>{c}</button>)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {displayedPackages.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              <div className="relative aspect-[4/3] overflow-hidden">
                <LazyImage src={p.cover_image || "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg"} alt={p.package_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.featured && <div className="absolute top-3 left-3 bg-[#6B4F8C] text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Featured</div>}
                <div className="absolute top-3 right-3"><AvailabilityBadge status={p.availability_status} /></div>
              </div>
              <div className="p-4 md:p-5 lg:p-6 flex flex-col flex-1">
                <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#6B4F8C]/70 mb-1">{p.event_category}</div>
                <h3 className="font-heading text-lg md:text-xl lg:text-2xl text-[#6B4F8C] mb-2 line-clamp-1">{p.package_name}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2">{p.description}</p>
                <ul className="space-y-1.5 mb-4">
                  {(p.services || []).slice(0, 3).map(s => <li key={s} className="flex items-start gap-2 text-xs md:text-sm text-gray-600"><Check size={14} className="text-[#BFA2DB] mt-0.5 flex-shrink-0" /><span className="line-clamp-1">{s}</span></li>)}
                  {(p.services || []).length > 3 && <li className="text-xs text-gray-400 pl-6">+{p.services.length - 3} more services</li>}
                </ul>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-[10px] md:text-xs text-gray-400">Starting at</span>
                    {p.discount_price ? (<><span className="font-heading text-xl md:text-2xl text-[#6B4F8C]">{formatPrice(p.discount_price)}</span><span className="text-xs md:text-sm text-gray-400 line-through">{formatPrice(p.price)}</span></>) : (<span className="font-heading text-xl md:text-2xl text-[#6B4F8C]">{formatPrice(p.price)}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/packages/${p.id}`} className="flex-1 inline-flex items-center justify-center gap-1 bg-[#6B4F8C] text-white px-3 md:px-4 py-2.5 rounded-full text-xs md:text-sm uppercase tracking-wider hover:bg-[#4F3A6A] transition-all">Details <ArrowRight size={14} /></Link>
                    <button onClick={() => handleInquiryClick(p)} className="inline-flex items-center justify-center gap-1 bg-[#25D366] text-white px-3 md:px-4 py-2.5 rounded-full text-xs md:text-sm uppercase tracking-wider hover:scale-105 transition-all whitespace-nowrap"><Send size={14} /> Enquire</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && <div className="text-center mt-10 md:mt-12"><button onClick={loadMore} className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-white border-2 border-[#6B4F8C] text-[#6B4F8C] rounded-full text-sm md:text-base font-medium hover:bg-[#6B4F8C] hover:text-white transition-all">Load More Packages <ArrowRight size={16} /></button></div>}
      </div>
    </section>
  );
}
