import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api, { getActiveBackend } from "../../lib/api";

const CATEGORIES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];
const EMPTY = { image: "", category: "Wedding", title: "", display_order: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/gallery");
      setItems(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.image) { toast.error("Image required"); return; }
    await api.post("/admin/gallery", { ...editing, display_order: Number(editing.display_order) || 0 });
    toast.success("Added to gallery");
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Remove from gallery?")) return;
    await api.delete(`/admin/gallery/${id}`);
    toast.success("Removed");
    load();
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setEditing({ ...editing, image: `${getActiveBackend()}${data.url}` });
      toast.success("Uploaded");
    } catch (e) {
      toast.error("Upload failed");
    } finally { setUploading(false); }
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
      data-testid="admin-gallery"
      className="pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C]">Gallery</h1>
        <button 
          onClick={() => setEditing({ ...EMPTY })} 
          data-testid="new-gallery" 
          className="bg-[#6B4F8C] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
        >
          <Plus size={16} /> Add Image
        </button>
      </div>

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No images in gallery yet.</p>
          <button onClick={() => setEditing({ ...EMPTY })} className="mt-4 text-[#6B4F8C] underline">Add your first image</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((g, idx) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="relative group rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              data-testid={`admin-gal-${g.id}`}
            >
              <button
                onClick={() => setPreviewImage(g.image)}
                className="w-full cursor-pointer"
              >
                <img 
                  src={g.image} 
                  alt={g.title || g.category} 
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </button>
              <div className="p-2 md:p-3">
                <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#666]">{g.category}</div>
                <div className="text-xs md:text-sm text-[#333] truncate">{g.title || "Untitled"}</div>
              </div>
              <button 
                onClick={() => remove(g.id)} 
                data-testid={`del-gal-${g.id}`} 
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Trash2 size={12} className="md:w-4 md:h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
              >
                <X size={24} />
              </button>
              <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              data-testid="gallery-modal"
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">Add Gallery Image</h2>
                <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Image URL or upload</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      data-testid="gal-image-url" 
                      value={editing.image} 
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })} 
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                    />
                    <label className="cursor-pointer bg-[#BFA2DB]/20 text-[#6B4F8C] px-4 py-2 rounded-full text-sm inline-flex items-center justify-center gap-2 hover:bg-[#BFA2DB]/40 transition whitespace-nowrap">
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" data-testid="gal-upload" className="hidden" onChange={(e) => uploadImage(e.target.files[0])} />
                    </label>
                  </div>
                  {editing.image && (
                    <img src={editing.image} alt="" className="mt-3 w-full h-32 md:h-40 object-cover rounded-lg" />
                  )}
                </div>
                
                <select 
                  data-testid="gal-category" 
                  value={editing.category} 
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                
                <input 
                  data-testid="gal-title" 
                  placeholder="Title (optional)" 
                  value={editing.title} 
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                />
                
                <input 
                  data-testid="gal-order" 
                  placeholder="Display order" 
                  type="number" 
                  value={editing.display_order} 
                  onChange={(e) => setEditing({ ...editing, display_order: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                />
              </div>
              
              <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t border-gray-100">
                <button 
                  onClick={save} 
                  data-testid="gal-save" 
                  className="w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all duration-300 hover:scale-[1.02]"
                >
                  Save to Gallery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
