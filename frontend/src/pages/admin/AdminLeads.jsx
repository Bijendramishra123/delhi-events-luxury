
import React, { useCallback, useEffect, useState } from "react";
import { Search, Trash2, Filter, Phone, Mail, Calendar, DollarSign, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../../lib/api";

const STATUSES = ["New", "Contacted", "Interested", "Negotiation", "Booked", "Completed", "Cancelled"];

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  Interested: "bg-purple-100 text-purple-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Booked: "bg-emerald-100 text-emerald-700",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  const load = useCallback(async () => {
    const params = {};
    if (q) params.q = q;
    if (filter) params.status = filter;
    try {
      setLoading(true);
      const { data } = await api.get("/admin/leads", { params });
      setLeads(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }, [q, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/leads/${id}/status`, { status });
    toast.success("Status updated");
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    await api.delete(`/admin/leads/${id}`);
    toast.success("Lead deleted");
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
      data-testid="admin-leads"
      className="pb-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C]">Leads</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              data-testid="leads-search"
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search by name, phone, email..."
              className="pl-10 pr-4 py-2.5 bg-white rounded-full border border-[#BFA2DB]/30 focus:outline-none focus:border-[#6B4F8C] w-full text-sm"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <select
              data-testid="leads-filter"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white rounded-full border border-[#BFA2DB]/30 focus:outline-none focus:border-[#6B4F8C] appearance-none text-sm"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F5F2]">
              <tr className="text-xs uppercase tracking-wider text-[#6B4F8C]">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-left p-4">Event</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Budget</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-[#666]">No leads yet.</td>
                </tr>
              ) : leads.map((l, idx) => (
                <motion.tr 
                  key={l.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-[#BFA2DB]/10 hover:bg-gray-50 transition"
                  data-testid={`lead-row-${l.id}`}
                >
                  <td className="p-4 font-medium text-gray-800">{l.name}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">{l.phone}</div>
                    <div className="text-gray-400 text-xs">{l.email}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{l.event_type}</td>
                  <td className="p-4 text-sm text-gray-500">{l.event_date || "—"}</td>
                  <td className="p-4 text-sm text-gray-600">{l.budget || "—"}</td>
                  <td className="p-4">
                    <select
                      data-testid={`lead-status-${l.id}`}
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border-none focus:outline-none cursor-pointer ${STATUS_COLORS[l.status] || ""}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => remove(l.id)} 
                      data-testid={`delete-lead-${l.id}`} 
                      className="text-red-500 hover:text-red-700 transition hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {leads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-gray-500">No leads yet.</p>
          </div>
        ) : (
          leads.map((l, idx) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-heading text-lg text-[#6B4F8C]">{l.name}</h3>
                <button 
                  onClick={() => remove(l.id)} 
                  className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} /> {l.phone}
                </div>
                {l.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} /> {l.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag size={14} /> {l.event_type}
                </div>
                {l.event_date && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={14} /> {l.event_date}
                  </div>
                )}
                {l.budget && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} /> {l.budget}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <select
                  value={l.status}
                  onChange={(e) => updateStatus(l.id, e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border-none focus:outline-none w-full cursor-pointer ${STATUS_COLORS[l.status] || ""}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
