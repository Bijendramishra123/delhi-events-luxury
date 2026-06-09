import React, { useEffect, useState } from "react";
import { Users, Package, Image as ImageIcon, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import api from "../../lib/api";

function Card({ icon: Icon, label, value, color, testId }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid={testId}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="font-heading text-3xl text-[#6B4F8C] mb-1">{value}</div>
      <div className="text-xs uppercase tracking-wider text-[#666]">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <div data-testid="dashboard-loading">Loading...</div>;

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-heading text-4xl text-[#6B4F8C] mb-2">Dashboard</h1>
      <p className="text-[#666] mb-10">Welcome back. Here&apos;s a snapshot of your business.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card icon={Users} label="Total Leads" value={stats.total_leads} color="bg-[#6B4F8C]" testId="stat-total-leads" />
        <Card icon={Calendar} label="Today's Leads" value={stats.today_leads} color="bg-[#BFA2DB]" testId="stat-today-leads" />
        <Card icon={TrendingUp} label="Monthly Leads" value={stats.month_leads} color="bg-[#4F3A6A]" testId="stat-month-leads" />
        <Card icon={Package} label="Total Packages" value={stats.total_packages} color="bg-emerald-500" testId="stat-packages" />
        <Card icon={ImageIcon} label="Gallery Images" value={stats.total_gallery} color="bg-amber-500" testId="stat-gallery" />
        <Card icon={MessageSquare} label="Testimonials" value={stats.total_testimonials} color="bg-blue-500" testId="stat-testimonials" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid="leads-by-category">
          <h3 className="font-heading text-xl text-[#6B4F8C] mb-6">Leads by Event Category</h3>
          {stats.leads_per_category.length === 0 ? (
            <p className="text-[#666] text-sm">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.leads_per_category.map((c) => {
                const max = Math.max(...stats.leads_per_category.map((x) => x.count));
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#333]">{c.category}</span>
                      <span className="text-[#6B4F8C] font-semibold">{c.count}</span>
                    </div>
                    <div className="h-2 bg-[#F8F5F2] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#BFA2DB] to-[#6B4F8C]" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid="conversion-card">
          <h3 className="font-heading text-xl text-[#6B4F8C] mb-6">Conversion Rate</h3>
          <div className="text-center py-8">
            <div className="font-heading text-6xl text-[#6B4F8C] mb-2">{stats.conversion_rate}%</div>
            <div className="text-sm uppercase tracking-wider text-[#666]">Booked vs Total Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}
