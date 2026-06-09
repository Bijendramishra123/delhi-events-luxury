import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import api from "../lib/api";

const CATEGORIES = ["all", "Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];

export default function GallerySection() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get("/gallery").then((r) => setItems(r.data));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <section id="gallery" className="py-24 md:py-32 bg-white" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Our Portfolio</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight">
            Moments we&apos;ve <em className="not-italic text-[#BFA2DB]">created</em>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              data-testid={`gallery-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all ${
                filter === c
                  ? "bg-[#6B4F8C] text-white"
                  : "bg-[#F8F5F2] text-[#6B4F8C] hover:bg-[#BFA2DB]/30"
              }`}
            >
              {c === "all" ? "All Events" : c}
            </button>
          ))}
        </div>

        <div className="masonry columns-1 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
              data-testid={`gallery-item-${item.id}`}
              className="relative group cursor-pointer rounded-2xl overflow-hidden bg-[#F8F5F2]"
              onClick={() => setLightbox(item)}
            >
              <img
                src={item.image}
                alt={item.title || item.category}
                loading="lazy"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f24]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#BFA2DB] mb-1">{item.category}</p>
                  <h4 className="font-heading text-xl">{item.title}</h4>
                </div>
                <ZoomIn className="absolute top-4 right-4 text-white" size={20} />
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] lightbox-backdrop flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
              data-testid="lightbox"
            >
              <button
                onClick={() => setLightbox(null)}
                data-testid="lightbox-close"
                className="absolute top-6 right-6 text-white hover:text-[#BFA2DB] z-10"
              >
                <X size={32} />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={lightbox.image}
                alt={lightbox.title}
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
