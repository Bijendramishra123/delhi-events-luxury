
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Check } from "lucide-react";
import api, { buildWhatsAppLink, openWhatsApp, formatPrice } from "../lib/api";

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

  useEffect(() => {
    api.get("/packages").then((r) => setPackages(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? packages : packages.filter((p) => p.event_category === filter);

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
                    {(p.services || []).slice(0, 3).map((s) => (
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
                      <a
                        href={buildWhatsAppLink(whatsapp, `Hello Team,\n\nI would like to inquire about the "${p.package_name}" (${p.event_category}) package.\n\nName: \nEvent Date: \nLocation: \nBudget: \n\nPlease contact me.`)}
                        target="_blank"
                        rel="noreferrer"
                        data-testid={`pkg-whatsapp-${p.id}`}
                        className="inline-flex items-center justify-center bg-[#25D366] text-white p-3 rounded-full hover:scale-105 transition-transform"
                        aria-label="WhatsApp inquiry"
                      >
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
