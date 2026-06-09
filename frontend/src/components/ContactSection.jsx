import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import api, { buildWhatsAppLink, formatApiErrorDetail } from "../lib/api";

const EVENT_TYPES = ["Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming", "Other"];
const BUDGETS = ["Under ₹1L", "₹1L - ₹3L", "₹3L - ₹7L", "₹7L - ₹15L", "₹15L+"];

export default function ContactSection({ whatsapp = "918796306375" }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", event_type: "", event_date: "", location: "", budget: "", message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = `Hello Team,\n\nI would like to inquire about an event.\n\nName: ${form.name || ""}\nEvent Type: ${form.event_type || ""}\nEvent Date: ${form.event_date || ""}\nLocation: ${form.location || ""}\nBudget: ${form.budget || ""}\n\nPlease contact me.`;

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#F8F5F2]" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Let&apos;s Plan Together</p>
            <h2 className="font-heading text-4xl md:text-5xl text-[#6B4F8C] leading-tight mb-6">
              Begin your <em className="not-italic text-[#BFA2DB]">bespoke</em> event journey
            </h2>
            <p className="text-[#666] leading-relaxed mb-10">
              Share a few details and one of our event consultants will reach out within 24 hours
              to craft your perfect celebration.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#666] mb-1">Call us</div>
                  <a href="tel:+918796306375" data-testid="contact-phone-link" className="text-[#333] hover:text-[#6B4F8C]">+91 87963 06375</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#666] mb-1">Email</div>
                  <a href="mailto:contact@delhincrevents.com" data-testid="contact-email" className="text-[#333] hover:text-[#6B4F8C]">contact@delhincrevents.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BFA2DB]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-[#6B4F8C]" size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#666] mb-1">Serving</div>
                  <div className="text-[#333]">Delhi · Noida · Gurgaon · NCR</div>
                </div>
              </div>
            </div>

            <a
              href={buildWhatsAppLink(whatsapp, whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              data-testid="contact-whatsapp-cta"
              className="inline-flex items-center gap-2 mt-10 bg-[#25D366] text-white px-6 py-3 rounded-full hover:scale-105 transition-transform"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={submit}
            data-testid="contact-form"
            className="lg:col-span-3 bg-white rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="contact-name" label="Full Name *" value={form.name} onChange={(v) => update("name", v)} />
              <Input id="contact-phone" label="Mobile Number *" value={form.phone} onChange={(v) => update("phone", v)} type="tel" />
              <Input id="contact-email-input" label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
              <Select id="contact-event-type" label="Event Type *" value={form.event_type} onChange={(v) => update("event_type", v)} options={EVENT_TYPES} />
              <Input id="contact-event-date" label="Event Date" value={form.event_date} onChange={(v) => update("event_date", v)} type="date" />
              <Input id="contact-location" label="Location" value={form.location} onChange={(v) => update("location", v)} />
              <Select id="contact-budget" label="Budget Range" value={form.budget} onChange={(v) => update("budget", v)} options={BUDGETS} />
            </div>
            <div className="mt-6">
              <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">Tell us about your vision</label>
              <textarea
                data-testid="contact-message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={4}
                className="w-full bg-transparent border-b-2 border-[#BFA2DB]/40 focus:border-[#6B4F8C] focus:outline-none py-3 text-[#333] placeholder:text-[#999]"
                placeholder="Share your story, theme ideas, guest count..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="contact-submit"
              className="mt-10 inline-flex items-center gap-2 bg-[#6B4F8C] text-white px-8 py-4 rounded-full hover:bg-[#4F3A6A] hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
            >
              {submitting ? "Sending..." : <>Send Inquiry <Send size={16} /></>}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Input({ id, label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">{label}</label>
      <input
        data-testid={id}
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b-2 border-[#BFA2DB]/40 focus:border-[#6B4F8C] focus:outline-none py-3 text-[#333] placeholder:text-[#999]"
      />
    </div>
  );
}

function Select({ id, label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#666] block mb-2">{label}</label>
      <select
        data-testid={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b-2 border-[#BFA2DB]/40 focus:border-[#6B4F8C] focus:outline-none py-3 text-[#333]"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
