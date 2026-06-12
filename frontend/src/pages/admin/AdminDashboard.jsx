
import React, { useCallback, useEffect, useState } from "react";
import { Users, Package, Image as ImageIcon, MessageSquare, TrendingUp, Calendar, Phone, Mail, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/api";

function Card({ icon: Icon, label, value, color, testId, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      data-testid={testId}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center mb-3 md:mb-4`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="font-heading text-2xl md:text-3xl text-[#6B4F8C] mb-1">{value !== undefined ? value : 0}</div>
      <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/admin/analytics");
      console.log("Analytics data:", data);
      setStats(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4F8C]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10" data-testid="dashboard-error">
        <p className="text-red-500 mb-4">Error loading dashboard: {error}</p>
        <button onClick={load} className="bg-[#6B4F8C] text-white px-4 py-2 rounded-lg hover:bg-[#4F3A6A] transition">Retry</button>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { icon: Users, label: "Total Leads", value: stats.total_leads, color: "bg-[#6B4F8C]", delay: 0 },
    { icon: Calendar, label: "Today's Leads", value: stats.today_leads || 0, color: "bg-[#BFA2DB]", delay: 0.05 },
    { icon: TrendingUp, label: "Monthly Leads", value: stats.month_leads || 0, color: "bg-[#4F3A6A]", delay: 0.1 },
    { icon: Package, label: "Total Packages", value: stats.total_packages, color: "bg-emerald-500", delay: 0.15 },
    { icon: ImageIcon, label: "Gallery Images", value: stats.total_gallery, color: "bg-amber-500", delay: 0.2 },
    { icon: MessageSquare, label: "Testimonials", value: stats.total_testimonials, color: "bg-blue-500", delay: 0.25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="admin-dashboard"
      className="pb-8"
    >
      <h1 className="font-heading text-3xl md:text-4xl text-[#6B4F8C] mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-10">Welcome back. Here's a snapshot of your business.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        {cards.map((card) => (
          <Card key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md">
          <h3 className="font-heading text-lg md:text-xl text-[#6B4F8C] mb-4 md:mb-6">Recent Leads</h3>
          <div className="text-center py-8 text-gray-500">
            View all leads in the <a href="/admin/leads" className="text-[#6B4F8C] underline">Leads section</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
