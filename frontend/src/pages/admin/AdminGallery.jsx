import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import api, { BACKEND_URL } from "../../lib/api";

const CATEGORIES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];
const EMPTY = { image: "", category: "Wedding", title: "", display_order: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/gallery");
      setItems(data);
    } catch (err) {
      console.error("Failed to load gallery:", err);
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
      setEditing({ ...editing, image: `${BACKEND_URL}${data.url}` });
      toast.success("Uploaded");
    } catch (e) {
      toast.error("Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div data-testid="admin-gallery">
      <div className="flex justify-between mb-8">
        <h1 className="font-heading text-4xl text-[#6B4F8C]">Gallery</h1>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="new-gallery" className="bg-[#6B4F8C] text-white px-6 py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-sm uppercase tracking-wider">
          <Plus size={16} /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g) => (
          <div key={g.id} className="relative group rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid={`admin-gal-${g.id}`}>
            <img src={g.image} alt={g.title} className="w-full aspect-square object-cover" />
            <div className="p-3">
              <div className="text-xs uppercase tracking-wider text-[#666]">{g.category}</div>
              <div className="text-sm text-[#333] truncate">{g.title}</div>
            </div>
            <button onClick={() => remove(g.id)} data-testid={`del-gal-${g.id}`} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()} data-testid="gallery-modal">
            <div className="flex justify-between mb-6">
              <h2 className="font-heading text-2xl text-[#6B4F8C]">Add Gallery Image</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Image URL or upload</label>
                <div className="flex gap-2">
                  <input data-testid="gal-image-url" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="flex-1 border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                  <label className="cursor-pointer bg-[#BFA2DB]/20 text-[#6B4F8C] px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 hover:bg-[#BFA2DB]/40">
                    <Upload size={14} /> {uploading ? "..." : "Upload"}
                    <input type="file" accept="image/*" data-testid="gal-upload" className="hidden" onChange={(e) => uploadImage(e.target.files[0])} />
                  </label>
                </div>
                {editing.image && <img src={editing.image} alt="" className="mt-3 w-full h-40 object-cover rounded-lg" />}
              </div>
              <select data-testid="gal-category" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input data-testid="gal-title" placeholder="Title (optional)" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              <input data-testid="gal-order" placeholder="Display order" type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
            </div>
            <button onClick={save} data-testid="gal-save" className="w-full mt-6 bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A]">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
