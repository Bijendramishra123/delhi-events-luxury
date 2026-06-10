
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LogIn, Sparkles, Mail, Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatApiErrorDetail } from "../../lib/api";

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F2] to-[#FAF9F6] flex items-center justify-center px-4 py-8" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6B4F8C] to-[#BFA2DB] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl text-[#6B4F8C]">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Decodiaries · Delhi NCR Event Planner</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  data-testid="admin-email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#6B4F8C] focus:ring-2 focus:ring-[#6B4F8C]/20 transition-all"
                  placeholder="admin@decodiaries.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  data-testid="admin-password"
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#6B4F8C] focus:ring-2 focus:ring-[#6B4F8C]/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="admin-login-submit"
              className="w-full bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] text-white py-3.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Sign In <LogIn size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-4 border-t border-gray-100 text-center"
          >
            <p className="text-xs text-gray-400 mb-2">Demo Credentials</p>
            <p className="text-xs text-gray-500">admin@decodiaries.com / admin123</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
