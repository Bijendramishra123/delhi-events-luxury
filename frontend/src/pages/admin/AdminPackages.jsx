
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Copy, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../../lib/api";

const CATEGORIES = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];
const AVAIL = ["Available", "Limited Availability", "Fully Booked", "Coming Soon"];

const EMPTY = {
  package_name: "", event_category: "Haldi", cover_image: "", gallery_images: [],
  price: 0, discount_price: null, description: "", services: [],
  availability_status: "Available", featured: false, visible: true, display_order: 0
};

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/packages");
      // Filter only allowed categories
      const allowedCategories = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];
      const filteredItems = data.filter(item => allowedCategories.includes(item.event_category));
      setItems(filteredItems);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const payload = { ...editing, services: typeof editing.services === "string" ? editing.services.split("\n").filter(Boolean) : editing.services };
    payload.price = Number(payload.price) || 0;
    payload.discount_price = payload.discount_price ? Number(payload.discount_price) : null;
    payload.display_order = Number(payload.display_order) || 0;
    try {
      if (editing.id) {
        await api.put(`/admin/packages/${editing.id}`, payload);
        toast.success("Package updated");
      } else {
        await api.post("/admin/packages", payload);
        toast.success("Package created");
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    await api.delete(`/admin/packages/${id}`);
    toast.success("Deleted");
    load();
  };

  const duplicate = async (id) => {
    await api.post(`/admin/packages/${id}/duplicate`);
    toast.success("Duplicated");
    load();
  };

  const uploadImage = async (file, field) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const imageUrl = data.url || data.path;
      if (field === "cover") {
        setEditing({ ...editing, cover_image: imageUrl });
      } else {
        setEditing({ ...editing, gallery_images: [...(editing.gallery_images || []), imageUrl] });
      }
      toast.success("Image uploaded to Cloudinary");
    } catch (e) {
      toast.error("Upload failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = [...(editing.gallery_images || [])];
    newImages.splice(index, 1);
    setEditing({ ...editing, gallery_images: newImages });
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
      data-testid="admin-packages"
      className="pb-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C]">Packages</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          data-testid="new-package"
          className="bg-[#6B4F8C] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
        >
          <Plus size={16} /> New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            data-testid={`admin-pkg-${p.id}`}
          >
            {/* Square image container */}
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
              <img 
                src={p.cover_image || "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg"} 
                alt={p.package_name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                onError={(e) => { e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
              />
            </div>
            <div className="p-4 md:p-5">
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#666] mb-1">{p.event_category}</div>
              <h3 className="font-heading text-base md:text-lg text-[#6B4F8C] mb-1 truncate">{p.package_name}</h3>
              <div className="text-sm text-gray-600 mb-2">₹{p.price.toLocaleString("en-IN")}</div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mb-3 ${
                p.availability_status === "Available" ? "bg-green-100 text-green-700" :
                p.availability_status === "Limited Availability" ? "bg-orange-100 text-orange-700" :
                p.availability_status === "Fully Booked" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {p.availability_status}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing({ ...p, services: (p.services || []).join("\n") })} 
                  data-testid={`edit-pkg-${p.id}`} 
                  className="flex-1 py-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40 transition flex items-center justify-center gap-1"
                >
                  <Pencil size={14} /> <span className="text-xs hidden sm:inline">Edit</span>
                </button>
                <button 
                  onClick={() => duplicate(p.id)} 
                  data-testid={`duplicate-pkg-${p.id}`} 
                  className="flex-1 py-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40 transition flex items-center justify-center gap-1"
                >
                  <Copy size={14} /> <span className="text-xs hidden sm:inline">Copy</span>
                </button>
                <button 
                  onClick={() => remove(p.id)} 
                  data-testid={`del-pkg-${p.id}`} 
                  className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> <span className="text-xs hidden sm:inline">Delete</span>
                </button>
              </div>
              
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-[#6B4F8C] transition md:hidden"
              >
                {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expandedId === p.id ? "Hide Services" : "Show Services"}
              </button>
              
              <AnimatePresence>
                {expandedId === p.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="text-xs text-gray-500 font-medium mb-2">Services:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {p.services?.slice(0, 4).map((s, i) => (
                        <li key={i} className="truncate">• {s}</li>
                      ))}
                      {p.services?.length > 4 && <li className="text-gray-400">+{p.services.length - 4} more</li>}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
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
              className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="package-modal"
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">{editing.id ? "Edit Package" : "New Package"}</h2>
                <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Package Name *</label>
                    <input data-testid="pkg-name" value={editing.package_name} onChange={(e) => setEditing({ ...editing, package_name: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Category</label>
                    <select data-testid="pkg-category" value={editing.event_category} onChange={(e) => setEditing({ ...editing, event_category: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Price (₹)</label>
                    <input data-testid="pkg-price" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Discount Price</label>
                    <input data-testid="pkg-discount" type="number" value={editing.discount_price || ""} onChange={(e) => setEditing({ ...editing, discount_price: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Availability</label>
                    <select data-testid="pkg-availability" value={editing.availability_status} onChange={(e) => setEditing({ ...editing, availability_status: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                      {AVAIL.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Display Order</label>
                    <input data-testid="pkg-order" type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Description</label>
                  <textarea data-testid="pkg-description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Services (one per line)</label>
                  <textarea data-testid="pkg-services" value={editing.services} onChange={(e) => setEditing({ ...editing, services: e.target.value })} rows={4} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Cover Image</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input data-testid="pkg-cover-url" value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} className="flex-1 border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" placeholder="Or paste image URL" />
                    <label className="cursor-pointer bg-[#BFA2DB]/20 text-[#6B4F8C] px-4 py-2 rounded-full text-sm inline-flex items-center justify-center gap-2 hover:bg-[#BFA2DB]/40 transition whitespace-nowrap">
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" className="hidden" data-testid="pkg-cover-upload" onChange={(e) => uploadImage(e.target.files[0], "cover")} />
                    </label>
                  </div>
                  {editing.cover_image && (
                    <div className="mt-3 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img src={editing.cover_image} alt="Cover" className="w-full h-full object-cover" 
                           onError={(e) => { e.target.src = "https://placehold.co/400x400?text=Invalid+URL"; }} />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} data-testid="pkg-featured" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} data-testid="pkg-visible" /> Visible
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button onClick={save} data-testid="pkg-save" className="flex-1 bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition">Save Package</button>
                <button onClick={() => setEditing(null)} className="px-6 py-3 border-2 border-[#BFA2DB] text-[#6B4F8C] rounded-full hover:bg-gray-50 transition">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
