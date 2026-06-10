
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api, { buildWhatsAppLink, openWhatsApp, formatApiErrorDetail } from "../lib/api";

const EVENT_TYPES = ["Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Other"];
const BUDGETS = ["Under ₹1L", "₹1L - ₹3L", "₹3L - ₹7L", "₹7L - ₹15L", "₹15L+"];

export default function ContactSection({ whatsapp = "918796306375" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", event_type: "", event_date: "", location: "", budget: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [packageInfo, setPackageInfo] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("inquiryPackage");
    if (stored) {
      const pkg = JSON.parse(stored);
      setPackageInfo(pkg);
      setForm(prev => ({ ...prev, event_type: pkg.category, message: `I'm interested in "${pkg.name}" package.\n\nPlease contact me.` }));
      sessionStorage.removeItem("inquiryPackage");
      setTimeout(() => toast.info(`✨ "${pkg.name}" package selected! Fill your details.`), 300);
    }
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.event_type) return toast.error("Name, phone & event type required.");
    setSubmitting(true);
    try {
      await api.post("/leads", form);
      toast.success("Thank you! We'll reach out within 24 hours.");
      setForm({ name: "", phone: "", email: "", event_type: "", event_date: "", location: "", budget: "", message: "" });
      setPackageInfo(null);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMsg = `Hello Team,\n\nName: ${form.name}\nEvent: ${form.event_type}\nDate: ${form.event_date}\nLocation: ${form.location}\nBudget: ${form.budget}\nMessage: ${form.message}`;

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-[#F8F5F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Get in Touch</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#6B4F8C] leading-tight">Let's create your <span className="text-[#BFA2DB]">dream</span> celebration</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            {packageInfo && (
              <div className="bg-[#BFA2DB]/20 rounded-2xl p-4 border-l-4 border-[#6B4F8C]">
                <p className="text-xs uppercase tracking-wider text-[#6B4F8C] font-semibold">Selected Package</p>
                <p className="text-[#6B4F8C] font-medium">{packageInfo.name}</p>
                <p className="text-sm text-gray-600">₹{packageInfo.price?.toLocaleString()} • {packageInfo.category}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center"><Phone className="text-[#6B4F8C]" size={18} /></div><div><div className="text-xs uppercase text-gray-500">Call us</div><a href="tel:+918796306375" className="text-gray-700 hover:text-[#6B4F8C]">+91 87963 06375</a></div></div>
              <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center"><Mail className="text-[#6B4F8C]" size={18} /></div><div><div className="text-xs uppercase text-gray-500">Email</div><a href="mailto:contact@decodiaries.com" className="text-gray-700 hover:text-[#6B4F8C]">contact@decodiaries.com</a></div></div>
              <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center"><MapPin className="text-[#6B4F8C]" size={18} /></div><div><div className="text-xs uppercase text-gray-500">Serving</div><div className="text-gray-700">Delhi · Noida · Gurgaon · NCR</div></div></div>
            </div>
            <a href={buildWhatsAppLink(whatsapp, whatsappMsg)} target="_blank" rel="noreferrer" onClick={(e) => openWhatsApp(e, whatsapp, whatsappMsg)} className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full hover:scale-105 transition-all"><MessageCircle size={18} /> Chat on WhatsApp</a>
          </motion.div>

          <motion.form initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} onSubmit={submit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full Name *" className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none" />
              <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Mobile Number *" className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none" />
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email" className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none" />
              <select value={form.event_type} onChange={e => update("event_type", e.target.value)} className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none bg-white"><option value="">Event Type *</option>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              <input type="date" value={form.event_date} onChange={e => update("event_date", e.target.value)} placeholder="Event Date" className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none" />
              <input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Location" className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none" />
              <select value={form.budget} onChange={e => update("budget", e.target.value)} className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none col-span-2"><option value="">Budget Range</option>{BUDGETS.map(b => <option key={b}>{b}</option>)}</select>
              <textarea value={form.message} onChange={e => update("message", e.target.value)} rows={3} placeholder="Tell us about your vision..." className="border-b-2 border-gray-200 focus:border-[#6B4F8C] py-2 outline-none resize-none col-span-2" />
            </div>
            <button type="submit" disabled={submitting} className="mt-6 w-full bg-[#6B4F8C] text-white py-3 rounded-full hover:bg-[#4F3A6A] transition-all disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center gap-2">{submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <>Send Inquiry <Send size={16} /></>}</button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
