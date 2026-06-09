import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Star } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

const EMPTY = { name: "", rating: 5, review: "", event_type: "Wedding", image: "", visible: true };
const TYPES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/testimonials");
      setItems(data);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
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
    if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div data-testid="admin-testimonials">
      <div className="flex justify-between mb-8">
        <h1 className="font-heading text-4xl text-[#6B4F8C]">Testimonials</h1>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="new-testimonial" className="bg-[#6B4F8C] text-white px-6 py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-sm uppercase tracking-wider">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid={`admin-test-${t.id}`}>
            <div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, i) => <Star key={`s-${t.id}-${i}`} size={14} className="fill-[#BFA2DB] text-[#BFA2DB]" />)}</div>
            <p className="text-[#333] text-sm mb-4 italic">&ldquo;{t.review}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading text-[#6B4F8C]">{t.name}</div>
                <div className="text-xs text-[#666]">{t.event_type}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(t)} data-testid={`edit-test-${t.id}`} className="p-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40 text-xs">Edit</button>
                <button onClick={() => remove(t.id)} data-testid={`del-test-${t.id}`} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()} data-testid="testimonial-modal">
            <div className="flex justify-between mb-6">
              <h2 className="font-heading text-2xl text-[#6B4F8C]">{editing.id ? "Edit" : "New"} Testimonial</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input data-testid="test-name" placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              <select data-testid="test-type" value={editing.event_type} onChange={(e) => setEditing({ ...editing, event_type: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input data-testid="test-rating" type="number" min="1" max="5" placeholder="Rating" value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              <input data-testid="test-image" placeholder="Image URL" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              <textarea data-testid="test-review" placeholder="Review" rows={4} value={editing.review} onChange={(e) => setEditing({ ...editing, review: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
            </div>
            <button onClick={save} data-testid="test-save" className="w-full mt-6 bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A]">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
