import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import api from "../lib/api";

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data));
  }, []);

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-gradient-to-b from-[#F8F5F2] to-white" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Loved by Hosts</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight">
            Words from our <em className="not-italic text-[#BFA2DB]">cherished</em> clients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              data-testid={`testimonial-${t.id}`}
              className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(107,79,140,0.1)] transition-all duration-500"
            >
              <Quote className="text-[#BFA2DB] mb-4" size={32} />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={`star-${t.id}-${idx}`} className="fill-[#BFA2DB] text-[#BFA2DB]" size={16} />
                ))}
              </div>
              <p className="text-[#333] leading-relaxed mb-6 italic">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#BFA2DB]/20">
                {t.image && (
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                  <div className="font-heading text-lg text-[#6B4F8C]">{t.name}</div>
                  <div className="text-xs uppercase tracking-wider text-[#666]">{t.event_type}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
