
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle, Star, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api, { buildWhatsAppLink, openWhatsApp, formatPrice } from "../lib/api";

// Mobile-Optimized Toast Component
const ToastNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -80, scale: 0.9 }}
      transition={{ type: "spring", damping: 20 }}
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
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition active:scale-95 flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default function PackageDetailPage() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/packages/${id}`)
      .then((r) => { if (!cancelled) setPkg(r.data); })
      .catch(() => { if (!cancelled) setPkg(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]);

  const handleInquiry = () => {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6B4F8C]">Loading...</div>;
  if (!pkg) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">Package not found.</p>
      <Link to="/" className="text-[#6B4F8C] underline">Back home</Link>
    </div>
  );

  const images = pkg.gallery_images?.length > 0 ? pkg.gallery_images : [pkg.cover_image];
  const waMessage = `Hello Team,\n\nI would like to inquire about the "${pkg.package_name}" (${pkg.event_category}) package.\n\nPlease contact me.`;
  const wa = buildWhatsAppLink("918796306375", waMessage);

  return (
    <div className="bg-[#F8F5F2] min-h-screen">
      <Navbar />
      <AnimatePresence>
        {showToast && <ToastNotification message={`✨ "${pkg.package_name}" selected! Please fill the contact form.`} onClose={() => setShowToast(false)} />}
      </AnimatePresence>

      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Link to="/#packages" className="inline-flex items-center gap-2 text-[#6B4F8C] mb-8 text-sm uppercase tracking-wider hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Back to packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-white">
              <img src={images[active]} alt={pkg.package_name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActive(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${active === idx ? "ring-2 ring-[#6B4F8C]" : "opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-2">{pkg.event_category}</p>
            <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C] mb-3">{pkg.package_name}</h1>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="fill-[#BFA2DB] text-[#BFA2DB]" size={16} />)}
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{pkg.description}</p>

            <div className="bg-white rounded-xl p-5 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400">Starting at</span>
                {pkg.discount_price ? (
                  <>
                    <span className="font-heading text-2xl text-[#6B4F8C]">{formatPrice(pkg.discount_price)}</span>
                    <span className="text-sm text-gray-400 line-through">{formatPrice(pkg.price)}</span>
                  </>
                ) : (
                  <span className="font-heading text-2xl text-[#6B4F8C]">{formatPrice(pkg.price)}</span>
                )}
              </div>
              <div className="text-xs text-[#6B4F8C] mt-1">{pkg.availability_status}</div>
            </div>

            <div className="mb-6">
              <h3 className="font-heading text-lg text-[#6B4F8C] mb-3">What's Included</h3>
              <ul className="grid grid-cols-1 gap-2">
                {(pkg.services || []).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-[#BFA2DB] mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={wa} target="_blank" rel="noopener noreferrer" onClick={(e) => openWhatsApp(e, "918796306375", waMessage)} className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full text-sm font-medium active:scale-95 transition-all">
                <MessageCircle size={16} /> WhatsApp Inquiry
              </a>
              <button onClick={handleInquiry} className="flex items-center justify-center gap-2 bg-[#6B4F8C] text-white px-5 py-3 rounded-full text-sm font-medium active:scale-95 transition-all">
                <Send size={16} /> Send Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
