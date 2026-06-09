import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle, Mail, Phone, ArrowRight, Sparkles } from "lucide-react";

const FAQS = [
  {
    question: "How early should I book?",
    answer: "We recommend booking at least 2–3 weeks in advance. For weddings or large events, 4–6 weeks ensures we have time to plan your custom setup perfectly.",
  },
  {
    question: "Do you travel outside the city?",
    answer: "Yes! We travel to nearby cities and towns. Travel charges apply depending on the distance. Contact us to discuss your location.",
  },
  {
    question: "Can I choose a custom theme or colour?",
    answer: "Absolutely. All our packages can be fully customised with your preferred theme, colour palette, and specific requirements. We love bringing unique visions to life.",
  },
  {
    question: "Is dismantling included?",
    answer: "Dismantling is included in our Bespoke package. For Essential and Premium packages, we offer dismantling as an add-on service at an additional charge.",
  },
  {
    question: "Do you do outdoor / terrace events?",
    answer: "Yes! Outdoor and terrace setups are one of our specialties. We use weather-appropriate materials and design the space to complement the natural environment.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Cancellations made 7+ days before the event receive a 50% refund of the booking amount. Cancellations within 7 days are non-refundable. We're happy to reschedule with notice.",
  },
];

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-[#6B4F8C]/20 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 md:py-6 text-left group"
      >
        <span className="text-base md:text-lg font-medium text-gray-800 group-hover:text-[#6B4F8C] transition-colors duration-300">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? "bg-[#6B4F8C] text-white" 
              : "bg-[#6B4F8C]/10 text-[#6B4F8C] group-hover:bg-[#6B4F8C] group-hover:text-white"
          }`}
        >
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-500 text-sm md:text-base leading-relaxed pb-5 md:pb-6 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-white" data-testid="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">FAQ</span>
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight mb-4">
            Things you might<br />
            <span className="text-[#BFA2DB]">want to know</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need to know about our services. Can't find what you're looking for? Feel free to contact us!
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="bg-[#FAF9F6] rounded-2xl p-6 md:p-8 shadow-sm mb-12">
          {FAQS.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              index={idx}
            />
          ))}
        </div>

        {/* Dynamic Contact CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6B4F8C] to-[#BFA2DB] p-8 md:p-10 shadow-xl"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Animated floating sparkles */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-4 text-white/30"
          >
            <Sparkles size={40} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 left-8 text-white/20"
          >
            <Sparkles size={30} />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center text-white">
            <motion.h3 
              className="text-2xl md:text-3xl font-heading mb-3"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Still have questions?
            </motion.h3>
            
            <motion.p 
              className="text-white/90 mb-6 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We're here to help you create your perfect celebration
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#6B4F8C] px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              >
                <MessageCircle size={18} />
                Chat with us
                <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </motion.a>
              
              <motion.a
                href="tel:+918796306375"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                <Phone size={18} />
                Call us
              </motion.a>
            </div>

            {/* Contact options row */}
            <motion.div 
              className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row justify-center gap-4 text-sm text-white/80"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <a href="mailto:contact@decodiaries.com" className="hover:text-white transition-colors flex items-center justify-center gap-1">
                <Mail size={14} /> contact@decodiaries.com
              </a>
              <span className="hidden sm:block">•</span>
              <a href="tel:+918796306375" className="hover:text-white transition-colors flex items-center justify-center gap-1">
                <Phone size={14} /> +91 87963 06375
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}