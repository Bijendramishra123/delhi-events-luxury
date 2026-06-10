
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Check, X, Send, Phone, Mail, Calendar, MapPin, DollarSign } from "lucide-react";
import api, { buildWhatsAppLink, formatPrice } from "../lib/api";

const CATEGORIES = ["All", "Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];

function AvailabilityBadge({ status }) {
  const map = {
    "Available": "bg-emerald-100 text-emerald-700",
    "Limited Availability": "bg-amber-100 text-amber-700",
    "Fully Booked": "bg-red-100 text-red-700",
    "Coming Soon": "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function PackagesSection({ whatsapp = "918796306375" }) {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    event_date: "",
    location: "",
    budget: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    api.get("/packages").then((r) => setPackages(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? packages : packages.filter((p) => p.event_category === filter);

  const openInquiryModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowInquiryModal(true);
    setInquiryForm({
      name: "",
      phone: "",
      email: "",
      event_date: "",
      location: "",
      budget: "",
      message: `I'm interested in the "${pkg.package_name}" package. Please contact me with more details.`
    });
    setSubmitSuccess(false);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post("/leads", {
        name: inquiryForm.name,
        phone: inquiryForm.phone,
        email: inquiryForm.email,
        event_type: selectedPackage?.event_category,
        event_date: inquiryForm.event_date,
        location: inquiryForm.location,
        budget: inquiryForm.budget,
        message: inquiryForm.message
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowInquiryModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Inquiry submission failed:", error);
      alert("Failed to send inquiry. Please try again or WhatsApp us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="packages" className="py-24 md:py-32 bg-[#FAF9F6]" data-testid="packages-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Curated Packages</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight">
              Choose your <em className="not-italic text-[#BFA2DB]">perfect</em> celebration
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              data-testid={`pkg-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all ${
                filter === c
                  ? "bg-[#6B4F8C] text-white"
                  : "bg-white text-[#6B4F8C] hover:bg-[#BFA2DB]/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20 text-[#666]" data-testid="pkg-loading">Loading curated experiences...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-[#666]">No packages available in this category.</div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                data-testid={`package-card-${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(107,79,140,0.12)] transition-all duration-500 group flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.cover_image || "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg"}
                    alt={p.package_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {p.featured && (
                    <div className="absolute top-4 left-4 bg-[#6B4F8C] text-white text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <AvailabilityBadge status={p.availability_status} />
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C]/70 mb-2">{p.event_category}</div>
                  <h3 className="font-heading text-2xl text-[#6B4F8C] mb-3">{p.package_name}</h3>
                  <p className="text-[#666] text-sm leading-relaxed mb-5 line-clamp-2">{p.description}</p>

                  <ul className="space-y-2 mb-6">
                    {(p.services || []).slice(0, 4).map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-[#333]">
                        <Check size={16} className="text-[#BFA2DB] mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-[#BFA2DB]/20">
                    <div className="flex items-baseline gap-3 mb-5">
                      <span className="text-xs text-[#666]">Starting at</span>
                      {p.discount_price ? (
                        <>
                          <span className="font-heading text-2xl text-[#6B4F8C]">{formatPrice(p.discount_price)}</span>
                          <span className="text-sm text-[#999] line-through">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        <span className="font-heading text-2xl text-[#6B4F8C]">{formatPrice(p.price)}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/packages/${p.id}`}
                        data-testid={`pkg-details-${p.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#6B4F8C] text-white px-4 py-3 rounded-full text-sm uppercase tracking-wider hover:bg-[#4F3A6A] transition-all"
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                      <button
                        onClick={() => openInquiryModal(p)}
                        data-testid={`pkg-inquiry-${p.id}`}
                        className="inline-flex items-center justify-center bg-[#25D366] text-white p-3 rounded-full hover:scale-105 transition-transform"
                        aria-label="Send Inquiry"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInquiryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">
                  Inquire About: {selectedPackage?.package_name}
                </h2>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-heading text-green-600 mb-2">Inquiry Sent!</h3>
                  <p className="text-gray-600">We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="p-4 md:p-6 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Email</label>
                    <input
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Event Date</label>
                    <input
                      type="date"
                      value={inquiryForm.event_date}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, event_date: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Location</label>
                    <input
                      type="text"
                      value={inquiryForm.location}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, location: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                      placeholder="Event location"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Budget (₹)</label>
                    <input
                      type="text"
                      value={inquiryForm.budget}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, budget: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                      placeholder="Expected budget"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Message</label>
                    <textarea
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C] resize-none"
                      placeholder="Any specific requirements?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send size={18} /> Send Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
