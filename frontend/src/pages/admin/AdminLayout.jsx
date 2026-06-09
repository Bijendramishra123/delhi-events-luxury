import React from "react";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, MessageSquare, Image as ImageIcon, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Toaster } from "sonner";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
    { to: "/admin/leads", label: "Leads", icon: Users, testId: "nav-leads" },
    { to: "/admin/packages", label: "Packages", icon: Package, testId: "nav-packages" },
    { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, testId: "nav-testimonials" },
    { to: "/admin/gallery", label: "Gallery", icon: ImageIcon, testId: "nav-gallery" },
  ];

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen flex bg-[#F8F5F2]" data-testid="admin-layout">
      <aside className="w-64 bg-white border-r border-[#BFA2DB]/20 flex flex-col">
        <div className="p-6 border-b border-[#BFA2DB]/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BFA2DB] to-[#6B4F8C] flex items-center justify-center text-white font-heading text-xl">D</div>
            <div>
              <div className="font-heading text-lg text-[#6B4F8C]">Admin</div>
              <div className="text-xs text-[#666]">Event Planner</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={l.testId}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm transition-all ${
                    isActive ? "bg-[#6B4F8C] text-white" : "text-[#333] hover:bg-[#BFA2DB]/20"
                  }`
                }
              >
                <Icon size={18} /> {l.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#BFA2DB]/20">
          <div className="text-xs text-[#666] mb-2 px-2 truncate">{user.email}</div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
