
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api, { buildWhatsAppLink, openWhatsApp, formatApiErrorDetail } from "../lib/api";

// UPDATED: Removed Wedding, Engagement, Housewarming. Added Haldi, Mehndi
const EVENT_TYPES = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Other"];
const BUDGETS = ["Under ₹1L", "₹1L - ₹3L", "₹3L - ₹7L", "₹7L - ₹15L", "₹15L+"];

export default function ContactSection({ whatsapp = "918796306375" }) {
  const [form, setForm] = useState({ 
    name: "", phone: "", email: "", event_type: "", event_date: "", location: "", budget: "", message: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [packageInfo, setPackageInfo] = useState(null);

  // Check for package info from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("inquiryPackage");
    if (stored) {
      try {
        const pkg = JSON.parse(stored);
        setPackageInfo(pkg);
        setForm(prev => ({ 
          ...prev, 
          event_type: pkg.category, 
          message: `I'm interested in "${pkg.name}" package.\n\nPlease contact me with more details.\n\n`
        }));
        sessionStorage.removeItem("inquiryPackage");
        setTimeout(() => toast.info(`✨ "${pkg.name}" package selected! Fill your details.`), 300);
      } catch (e) {
        console.error("Error parsing package info:", e);
      }
    }
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.event_type) {
      toast.error("Please fill in your name, phone number and event type.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/leads", form);
      toast.success("Thank you! We'll reach out to you within 24 hours.");
      setForm({ name: "", phone: "", email: "", event_type: "", event_date: "", location: "", budget: "", message: "" });
      setPackageInfo(null);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMsg = `Hello Team,\n\nI would like to inquire about an event.\n\nName: ${form.name}\nEvent Type: ${form.event_type}\nEvent Date: ${form.event_date}\nLocation: ${form.location}\nBudget: ${form.budget}\n\nMessage: ${form.message}\n\nPlease contact me.`;

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-[#F8F5F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Get in Touch</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#6B4F8C] leading-tight">
            Let's create your <span className="text-[#BFA2DB]">dream</span> celebration
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-3 max-w-2xl mx-auto">Share your vision and our team will reach out within 24 hours</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {packageInfo && (
              <div className="bg-[#BFA2DB]/20 rounded-2xl p-4 border-l-4 border-[#6B4F8C]">
                <p className="text-xs uppercase tracking-wider text-[#6B4F8C] font-semibold">Selected Package</p>
                <p className="text-[#6B4F8C] font-medium">{packageInfo.name}</p>
                <p className="text-sm text-gray-600">₹{packageInfo.price?.toLocaleString()} • {packageInfo.category}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Call us</div>
                  <a href="tel:+918796306375" className="text-gray-700 hover:text-[#6B4F8C] transition">+91 87963 06375</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</div>
                  <a href="mailto:contact@decodiaries.com" className="text-gray-700 hover:text-[#6B4F8C] transition break-all">contact@decodiaries.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Serving</div>
                  <div className="text-gray-700">Delhi · Noida · Gurgaon · NCR</div>
                </div>
              </div>
            </div>

            <a
              href={buildWhatsAppLink(whatsapp, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openWhatsApp(e, whatsapp, whatsappMsg)}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full hover:scale-105 transition-all text-sm md:text-base active:scale-95"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </motion.div>

          {/* Right side - Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={submit}
            className="bg-white rounded-2xl p-5 md:p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Event Type *</label>
                <select
                  value={form.event_type}
                  onChange={(e) => update("event_type", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 bg-white"
                >
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Event Date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => update("event_date", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition"
                  placeholder="City / Venue"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Budget Range</label>
                <select
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 bg-white"
                >
                  <option value="">Select budget</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Your Vision</label>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={3}
                  className="w-full border-b-2 border-gray-200 focus:border-[#6B4F8C] outline-none py-2 text-gray-700 transition resize-none"
                  placeholder="Tell us about your dream celebration..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>Send Inquiry <Send size={16} /></>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
