import React, { useCallback, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
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

  const load = useCallback(async () => {
    const params = {};
    if (q) params.q = q;
    if (filter) params.status = filter;
    try {
      const { data } = await api.get("/admin/leads", { params });
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads:", err);
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

  return (
    <div data-testid="admin-leads">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="font-heading text-4xl text-[#6B4F8C]">Leads</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              data-testid="leads-search"
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..."
              className="pl-10 pr-4 py-2.5 bg-white rounded-full border border-[#BFA2DB]/30 focus:outline-none focus:border-[#6B4F8C]"
            />
          </div>
          <select
            data-testid="leads-filter"
            value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-full border border-[#BFA2DB]/30 focus:outline-none focus:border-[#6B4F8C]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                <tr><td colSpan="7" className="text-center p-8 text-[#666]">No leads yet.</td></tr>
              ) : leads.map((l) => (
                <tr key={l.id} className="border-t border-[#BFA2DB]/10" data-testid={`lead-row-${l.id}`}>
                  <td className="p-4 font-medium">{l.name}</td>
                  <td className="p-4 text-sm">
                    <div>{l.phone}</div>
                    <div className="text-[#666]">{l.email}</div>
                  </td>
                  <td className="p-4 text-sm">{l.event_type}</td>
                  <td className="p-4 text-sm text-[#666]">{l.event_date || "—"}</td>
                  <td className="p-4 text-sm">{l.budget || "—"}</td>
                  <td className="p-4">
                    <select
                      data-testid={`lead-status-${l.id}`}
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border-none focus:outline-none ${STATUS_COLORS[l.status] || ""}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <button onClick={() => remove(l.id)} data-testid={`delete-lead-${l.id}`} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
