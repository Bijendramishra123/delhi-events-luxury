import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  { name: "Wedding", img: "https://images.pexels.com/photos/34079355/pexels-photo-34079355.jpeg", desc: "Sacred ceremonies, grand receptions." },
  { name: "Birthday", img: "https://images.unsplash.com/photo-1741969494307-55394e3e4071?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmlydGhkYXklMjBwYXJ0eSUyMGRlY29yYXRpb25zfGVufDB8fHx8MTc4MTAwMDEzMnww&ixlib=rb-4.1.0&q=85", desc: "Themed celebrations of every age." },
  { name: "Anniversary", img: "https://images.unsplash.com/photo-1756190564669-215843660e93?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85", desc: "Reliving love, year after year." },
  { name: "Baby Shower", img: "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg", desc: "Soft pastels, dreamy beginnings." },
  { name: "Corporate", img: "https://images.pexels.com/photos/26202153/pexels-photo-26202153.jpeg", desc: "Galas, conferences, brand events." },
  { name: "Engagement", img: "https://images.unsplash.com/photo-1618566864264-fb013f791da4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxlbmdhZ2VtZW50JTIwcmluZyUyMGNlcmVtb255JTIwY291cGxlfGVufDB8fHx8MTc4MTAwMDEzOXww&ixlib=rb-4.1.0&q=85", desc: "Romantic vows, unforgettable rings." },
  { name: "Housewarming", img: "https://images.unsplash.com/photo-1649083048770-82e8ffd80431?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBob21lJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85", desc: "Bless your new beginnings in style." },
];

export default function EventsSection() {
  return (
    <section id="events" className="py-24 md:py-32 bg-[#F8F5F2]" data-testid="events-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Our Expertise</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight">
            A celebration for every <em className="not-italic text-[#BFA2DB]">milestone</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              data-testid={`event-card-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(107,79,140,0.15)] transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                />
              </div>
              <div className="p-8">
                <h3 className="font-heading text-2xl text-[#6B4F8C] mb-2">{cat.name}</h3>
                <p className="text-[#666] text-sm mb-6 leading-relaxed">{cat.desc}</p>
                <a
                  href={`#packages`}
                  data-testid={`explore-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-flex items-center gap-2 text-[#6B4F8C] text-sm uppercase tracking-wider group-hover:gap-3 transition-all"
                >
                  Explore Packages <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
