import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatApiErrorDetail } from "../../lib/api";

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-[0_20px_60px_rgb(107,79,140,0.12)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#BFA2DB] to-[#6B4F8C] mx-auto flex items-center justify-center text-white font-heading text-3xl mb-4">
            D
          </div>
          <h1 className="font-heading text-3xl text-[#6B4F8C] mb-2">Admin Login</h1>
          <p className="text-[#666] text-sm">Delhi NCR Event Planner</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Email</label>
            <input
              data-testid="admin-email"
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#BFA2DB]/40 focus:border-[#6B4F8C] focus:outline-none py-3 text-[#333]"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Password</label>
            <input
              data-testid="admin-password"
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#BFA2DB]/40 focus:border-[#6B4F8C] focus:outline-none py-3 text-[#333]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#6B4F8C] text-white py-4 rounded-full hover:bg-[#4F3A6A] transition-all disabled:opacity-50 text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : <>Sign In <LogIn size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
