
import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../../lib/api";

const CATEGORIES = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];
const EMPTY = { image: "", category: "Haldi", title: "", display_order: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [multipleMode, setMultipleMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("Haldi");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/gallery");
      const allowedCategories = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];
      const filteredItems = data.filter(item => allowedCategories.includes(item.category));
      setItems(filteredItems);
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

  const uploadImage = async (file, category, title = "") => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const imageUrl = data.url || data.path;
      
      // Save to gallery with category
      await api.post("/admin/gallery", {
        image: imageUrl,
        category: category,
        title: title || file.name.split(".")[0],
        display_order: items.length + 1
      });
      return { success: true, url: imageUrl };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploadingMultiple(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of selectedFiles) {
      const result = await uploadImage(file, currentCategory, file.name.split(".")[0]);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: result.success ? "done" : "failed"
      }));
    }

    toast.success(`Uploaded ${successCount} images, ${failCount} failed`);
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadingMultiple(false);
    setMultipleMode(false);
    load();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingleImage = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const imageUrl = data.url || data.path;
      setEditing({ ...editing, image: imageUrl });
      toast.success("Uploaded to Cloudinary");
    } catch (e) {
      toast.error("Upload failed: " + (e.response?.data?.detail || e.message));
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
        <div className="flex gap-3">
          <button 
            onClick={() => setMultipleMode(true)} 
            className="bg-[#BFA2DB] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#A98CC5] inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            <Upload size={16} /> Multiple Upload
          </button>
          <button 
            onClick={() => setEditing({ ...EMPTY })} 
            data-testid="new-gallery" 
            className="bg-[#6B4F8C] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#4F3A6A] inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            <Plus size={16} /> Single Image
          </button>
        </div>
      </div>

      {/* Multiple Upload Modal */}
      <AnimatePresence>
        {multipleMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (!uploadingMultiple) {
                setMultipleMode(false);
                setSelectedFiles([]);
                setUploadProgress({});
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">Multiple Upload</h2>
                {!uploadingMultiple && (
                  <button onClick={() => {
                    setMultipleMode(false);
                    setSelectedFiles([]);
                    setUploadProgress({});
                  }} className="p-1 hover:bg-gray-100 rounded-full transition">
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <div className="p-4 md:p-6 space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Category for all images</label>
                  <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                    disabled={uploadingMultiple}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* File Input */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Select Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full border-b-2 border-[#BFA2DB]/40 py-2"
                    disabled={uploadingMultiple}
                  />
                  <p className="text-xs text-gray-400 mt-1">You can select multiple images at once (JPG, PNG, WEBP, GIF)</p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-600 mb-2">Selected files: {selectedFiles.length}</p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 flex-1">
                            {uploadProgress[file.name] === "done" && <Check size={14} className="text-green-500" />}
                            {uploadProgress[file.name] === "failed" && <AlertCircle size={14} className="text-red-500" />}
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          {!uploadingMultiple && uploadProgress[file.name] !== "done" && (
                            <button onClick={() => removeSelectedFile(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleMultipleUpload}
                  disabled={uploadingMultiple || selectedFiles.length === 0}
                  className="w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all disabled:opacity-50"
                >
                  {uploadingMultiple ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </div>
                  ) : (
                    `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="relative group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
              data-testid={`admin-gal-${g.id}`}
            >
              <button onClick={() => setPreviewImage(g.image)} className="w-full cursor-pointer">
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  <img 
                    src={g.image} 
                    alt={g.title || g.category} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Image+Error"; }}
                  />
                </div>
              </button>
              <div className="p-2">
                <div className="text-[10px] uppercase tracking-wider text-[#666]">{g.category}</div>
                <div className="text-xs text-[#333] truncate">{g.title || "Untitled"}</div>
              </div>
              <button 
                onClick={() => remove(g.id)} 
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Single Image Upload Modal */}
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
            >
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-heading text-xl md:text-2xl text-[#6B4F8C]">Add Single Image</h2>
                <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Upload Image</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      value={editing.image} 
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })} 
                      placeholder="Or paste image URL"
                      className="flex-1 border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                    />
                    <label className="cursor-pointer bg-[#BFA2DB]/20 text-[#6B4F8C] px-4 py-2 rounded-full text-sm inline-flex items-center gap-2">
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadSingleImage(e.target.files[0])} />
                    </label>
                  </div>
                  {editing.image && (
                    <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                      <img src={editing.image} alt="Preview" className="w-full h-full object-cover" 
                           onError={(e) => { e.target.src = "https://placehold.co/400x400?text=Invalid+URL"; }} />
                    </div>
                  )}
                </div>
                
                <select 
                  value={editing.category} 
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                
                <input 
                  placeholder="Title (optional)" 
                  value={editing.title} 
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                />
                
                <input 
                  placeholder="Display order" 
                  type="number" 
                  value={editing.display_order} 
                  onChange={(e) => setEditing({ ...editing, display_order: e.target.value })} 
                  className="w-full border-b-2 border-[#BFA2DB]/40 py-2 focus:outline-none focus:border-[#6B4F8C]"
                />
              </div>
              
              <div className="sticky bottom-0 bg-white p-4 md:p-6 border-t border-gray-100">
                <button onClick={save} className="w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all">
                  Save to Gallery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white">
                <X size={24} />
              </button>
              <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
