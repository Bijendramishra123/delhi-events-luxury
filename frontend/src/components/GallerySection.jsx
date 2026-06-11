
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Flower2, Cake, Baby, Star, Briefcase, Calendar, Music } from "lucide-react";
import api from "../lib/api";

const CATEGORIES = [
  { id: "All", name: "All", icon: Sparkles, fullName: "All Events" },
  { id: "Haldi", name: "Haldi", icon: Flower2, fullName: "Haldi Ceremony" },
  { id: "Mehndi", name: "Mehndi", icon: Music, fullName: "Mehndi Night" },
  { id: "Birthday", name: "Birthday", icon: Cake, fullName: "Birthday Party" },
  { id: "Anniversary", name: "Anniversary", icon: Calendar, fullName: "Anniversary" },
  { id: "Baby Shower", name: "Baby Shower", icon: Baby, fullName: "Baby Shower" },
  { id: "Corporate", name: "Corporate", icon: Briefcase, fullName: "Corporate Events" },
];

const CategoryButton = ({ category, isActive, onClick }) => {
  const Icon = category.icon;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => onClick(category.id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1000)}
        className={`flex flex-col items-center justify-center gap-1 px-3 md:px-5 py-2 rounded-xl transition-all duration-300 min-w-[60px] md:min-w-[80px] active:scale-95 ${
          isActive
            ? "bg-[#6B4F8C] text-white shadow-md"
            : "bg-white text-[#6B4F8C] border border-[#BFA2DB]/30 hover:bg-gray-50"
        }`}
      >
        <Icon size={18} className="md:w-5 md:h-5" />
        <span className="text-[10px] md:text-xs font-medium">{category.name}</span>
      </button>
      
      {showTooltip && category.id !== "All" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap z-10 pointer-events-none"
        >
          {category.fullName}
        </motion.div>
      )}
    </div>
  );
};

export default function GallerySection() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api.get("/gallery")
      .then(res => { 
        // Filter out old categories if needed
        const allowedCategories = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];
        const filteredItems = res.data.filter(item => allowedCategories.includes(item.category));
        setItems(filteredItems);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "All" 
    ? items 
    : items.filter(item => item.category === filter);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(filtered[index]);
  };

  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedImage(filtered[currentIndex + 1]);
    }
  };
  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedImage(filtered[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4F8C]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Our Portfolio</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#6B4F8C] leading-tight">
            Moments we've <span className="text-[#BFA2DB]">created</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-3">Explore our beautiful collection of celebration decor</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={filter === category.id}
              onClick={setFilter}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No images in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (idx % 8) * 0.05 }}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => openLightbox(idx)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title || item.category}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Image+Not+Found"; }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-sm font-medium text-center px-2">{item.title || item.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2" onClick={closeLightbox}>
            <X size={30} />
          </button>
          <button className="absolute left-4 text-white hover:text-gray-300 p-2 bg-black/50 rounded-full disabled:opacity-30" onClick={(e) => { e.stopPropagation(); prevImage(); }} disabled={currentIndex === 0}>
            <ChevronLeft size={30} />
          </button>
          <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.image} alt={selectedImage.title} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <div className="text-center mt-4 text-white">
              <p className="text-sm uppercase tracking-wider text-[#BFA2DB]">{selectedImage.category}</p>
              <p className="text-lg font-heading mt-1">{selectedImage.title}</p>
            </div>
          </div>
          <button className="absolute right-4 text-white hover:text-gray-300 p-2 bg-black/50 rounded-full disabled:opacity-30" onClick={(e) => { e.stopPropagation(); nextImage(); }} disabled={currentIndex === filtered.length - 1}>
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </section>
  );
}
