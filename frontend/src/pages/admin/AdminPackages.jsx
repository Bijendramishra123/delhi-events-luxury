import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Copy, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api, { BACKEND_URL } from "../../lib/api";

const CATEGORIES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"];
const AVAIL = ["Available", "Limited Availability", "Fully Booked", "Coming Soon"];

const EMPTY = {
  package_name: "", event_category: "Wedding", cover_image: "", gallery_images: [],
  price: 0, discount_price: null, description: "", services: [],
  availability_status: "Available", featured: false, visible: true, display_order: 0
};

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/packages");
      setItems(data);
    } catch (err) {
      console.error("Failed to load packages:", err);
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
      const url = `${BACKEND_URL}${data.url}`;
      if (field === "cover") setEditing({ ...editing, cover_image: url });
      else setEditing({ ...editing, gallery_images: [...(editing.gallery_images || []), url] });
      toast.success("Image uploaded");
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid="admin-packages">
      <div className="flex justify-between mb-8">
        <h1 className="font-heading text-4xl text-[#6B4F8C]">Packages</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          data-testid="new-package"
          className="bg-[#6B4F8C] text-white px-6 py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-sm uppercase tracking-wider"
        >
          <Plus size={16} /> New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid={`admin-pkg-${p.id}`}>
            <img src={p.cover_image || "https://images.pexels.com/photos/13156145/pexels-photo-13156145.jpeg"} alt="" className="w-full h-40 object-cover" />
            <div className="p-5">
              <div className="text-xs uppercase tracking-wider text-[#666] mb-1">{p.event_category}</div>
              <h3 className="font-heading text-lg text-[#6B4F8C] mb-2">{p.package_name}</h3>
              <div className="text-sm text-[#666] mb-4">₹{p.price.toLocaleString("en-IN")} · {p.availability_status}</div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...p, services: (p.services || []).join("\n") })} data-testid={`edit-pkg-${p.id}`} className="flex-1 p-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40"><Pencil size={14} className="mx-auto" /></button>
                <button onClick={() => duplicate(p.id)} data-testid={`duplicate-pkg-${p.id}`} className="flex-1 p-2 rounded-lg bg-[#BFA2DB]/20 text-[#6B4F8C] hover:bg-[#BFA2DB]/40"><Copy size={14} className="mx-auto" /></button>
                <button onClick={() => remove(p.id)} data-testid={`del-pkg-${p.id}`} className="flex-1 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} className="mx-auto" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="package-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl text-[#6B4F8C]">{editing.id ? "Edit Package" : "New Package"}</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Package Name *">
                <input data-testid="pkg-name" value={editing.package_name} onChange={(e) => setEditing({ ...editing, package_name: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              </Field>
              <Field label="Category">
                <select data-testid="pkg-category" value={editing.event_category} onChange={(e) => setEditing({ ...editing, event_category: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Price (₹)">
                <input data-testid="pkg-price" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              </Field>
              <Field label="Discount Price (optional)">
                <input data-testid="pkg-discount" type="number" value={editing.discount_price || ""} onChange={(e) => setEditing({ ...editing, discount_price: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              </Field>
              <Field label="Availability">
                <select data-testid="pkg-availability" value={editing.availability_status} onChange={(e) => setEditing({ ...editing, availability_status: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]">
                  {AVAIL.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Display Order">
                <input data-testid="pkg-order" type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: e.target.value })} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
              </Field>
            </div>

            <Field label="Description" className="mt-4">
              <textarea data-testid="pkg-description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
            </Field>

            <Field label="Services Included (one per line)" className="mt-4">
              <textarea data-testid="pkg-services" value={editing.services} onChange={(e) => setEditing({ ...editing, services: e.target.value })} rows={4} className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
            </Field>

            <Field label="Cover Image URL" className="mt-4">
              <div className="flex gap-2">
                <input data-testid="pkg-cover-url" value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} className="flex-1 border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]" />
                <label className="cursor-pointer bg-[#BFA2DB]/20 text-[#6B4F8C] px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 hover:bg-[#BFA2DB]/40">
                  <Upload size={14} /> {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" data-testid="pkg-cover-upload" onChange={(e) => uploadImage(e.target.files[0], "cover")} />
                </label>
              </div>
              {editing.cover_image && <img src={editing.cover_image} alt="" className="mt-3 w-32 h-24 object-cover rounded-lg" />}
            </Field>

            <div className="flex gap-4 mt-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} data-testid="pkg-featured" /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} data-testid="pkg-visible" /> Visible</label>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={save} data-testid="pkg-save" className="flex-1 bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A]">Save Package</button>
              <button onClick={() => setEditing(null)} className="px-6 py-3 border-2 border-[#BFA2DB] text-[#6B4F8C] rounded-full">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">{label}</label>
      {children}
    </div>
  );
}
