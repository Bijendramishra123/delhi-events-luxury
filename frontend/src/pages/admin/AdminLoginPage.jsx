
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!user && !loggingIn && !authLoading) {
      setLoggingIn(true);
      login("admin@decodiaries.com", "admin123").catch((err) => {
        console.error("Auto login failed:", err);
        setLoggingIn(false);
      });
    }
  }, [user, login, authLoading, loggingIn]);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F2] to-[#FAF9F6] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6B4F8C] to-[#BFA2DB] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-[#6B4F8C] mb-2">Admin Panel</h1>
          <p className="text-gray-500 text-sm mb-6">
            {loggingIn ? "Logging in..." : "Redirecting to dashboard..."}
          </p>
          
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4F8C] mx-auto"></div>
        </div>
      </motion.div>
    </div>
  );
}
