
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Star, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../../lib/api";

const EMPTY = { name: "", rating: 5, review: "", event_type: "Wedding", image: "", visible: true };
const TYPES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            size={18}
            className={`transition-all duration-200 ${
              star <= rating
                ? "fill-[#BFA2DB] text-[#BFA2DB]"
                : "text-gray-300 hover:text-gray-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/testimonials");
      setItems(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const payload = { ...editing, rating: Number(editing.rating) };
    if (editing.id) await api.put(`/admin/testimonials/${editing.id}`, payload);
    else await api.post("/admin/testimonials", payload);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    toast.success("Deleted");
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4F8C]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="admin-testimonials"
      className="pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C]">Testimonials</h1>
        <button 
          onClick={() => setEditing({ ...EMPTY })} 
          data-testid="new-testimonial" 
          className="bg-[#6B4F8C] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No testimonials yet.</p>
          <button onClick={() => setEditing({ ...EMPTY })} className="mt-4 text-[#6B4F8C] underline">Add your first testimonial</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300"
              data-testid={`admin-test-${t.id}`}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={`s-${t.id}-${i}`} size={14} className="fill-[#BFA2DB] text-[#BFA2DB]" />
                ))}
              </div>
              
              {/* Review Text */}
              <p className="text-gray-600 text-sm mb-4 italic line-clamp-3">&ldquo;{t.review}&rdquo;</p>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading text-[#6B4F8C] text-base">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.event_type}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditing(t)} 
                    data-testid={`edit-test-${t.id}`} 
                    className="p-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40 transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => remove(t.id)} 
                    data-testid={`del-test-${t.id}`} 
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="testimonial-modal"
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">
                  {editing.id ? "Edit" : "New"} Testimonial
                </h2>
                <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Name</label>
                  <input 
                    data-testid="test-name" 
                    placeholder="Client name" 
                    value={editing.name} 
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })} 
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Event Type</label>
                  <select 
                    data-testid="test-type" 
                    value={editing.event_type} 
                    onChange={(e) => setEditing({ ...editing, event_type: e.target.value })} 
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                  >
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Rating</label>
                  <StarRating 
                    rating={editing.rating || 5} 
                    onRatingChange={(rating) => setEditing({ ...editing, rating })} 
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Image URL (optional)</label>
                  <input 
                    data-testid="test-image" 
                    placeholder="https://example.com/client-photo.jpg" 
                    value={editing.image} 
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })} 
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Review</label>
                  <textarea 
                    data-testid="test-review" 
                    placeholder="Write the testimonial here..." 
                    rows={4} 
                    value={editing.review} 
                    onChange={(e) => setEditing({ ...editing, review: e.target.value })} 
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="visible" 
                    checked={editing.visible !== false} 
                    onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} 
                  />
                  <label htmlFor="visible" className="text-sm text-gray-600">Visible on website</label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t border-gray-100">
                <button 
                  onClick={save} 
                  data-testid="test-save" 
                  className="w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all duration-300 hover:scale-[1.02]"
                >
                  Save Testimonial
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
