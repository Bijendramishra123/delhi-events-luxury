
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
      className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      data-testid={testId}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center mb-3 md:mb-4`}>
        <Icon size={18} className="text-white md:w-5 md:h-5" />
      </div>
      <div className="font-heading text-2xl md:text-3xl text-[#6B4F8C] mb-1">{value !== undefined ? value : 0}</div>
      <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#666]">{label}</div>
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
    { icon: Calendar, label: "Today's Leads", value: stats.today_leads, color: "bg-[#BFA2DB]", delay: 0.05 },
    { icon: TrendingUp, label: "Monthly Leads", value: stats.month_leads, color: "bg-[#4F3A6A]", delay: 0.1 },
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
      <p className="text-[#666] text-sm md:text-base mb-6 md:mb-10">Welcome back. Here's a snapshot of your business.</p>

      {/* Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        {cards.map((card, idx) => (
          <Card key={card.label} {...card} testId={`stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`} />
        ))}
      </div>

      {/* Charts Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          data-testid="leads-by-category"
        >
          <h3 className="font-heading text-lg md:text-xl text-[#6B4F8C] mb-4 md:mb-6">Leads by Event Category</h3>
          {!stats.leads_per_category || stats.leads_per_category.length === 0 ? (
            <p className="text-[#666] text-sm">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.leads_per_category.map((c, idx) => {
                const max = Math.max(...stats.leads_per_category.map((x) => x.count));
                const percentage = max > 0 ? (c.count / max) * 100 : 0;
                return (
                  <motion.div
                    key={c.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.03 }}
                  >
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span className="text-[#333] font-medium">{c.category}</span>
                      <span className="text-[#6B4F8C] font-semibold">{c.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-[#BFA2DB] to-[#6B4F8C] rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          data-testid="conversion-card"
        >
          <h3 className="font-heading text-lg md:text-xl text-[#6B4F8C] mb-4 md:mb-6">Conversion Rate</h3>
          <div className="text-center py-6 md:py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="font-heading text-5xl md:text-6xl text-[#6B4F8C] mb-2"
            >
              {stats.conversion_rate || 0}%
            </motion.div>
            <div className="text-xs md:text-sm uppercase tracking-wider text-[#666]">Booked vs Total Leads</div>
            
            {/* Mini stats */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl md:text-3xl font-heading text-emerald-600">{stats.booked || 0}</div>
                <div className="text-[10px] md:text-xs text-[#666]">Booked Events</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-heading text-[#6B4F8C]">{stats.total_leads || 0}</div>
                <div className="text-[10px] md:text-xs text-[#666]">Total Leads</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
