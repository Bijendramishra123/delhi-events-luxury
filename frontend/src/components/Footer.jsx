
import React from "react";
import { motion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#2d1a3d] to-[#1f1230] text-white pt-16 md:pt-20 pb-6 md:pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-10 md:mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4 md:mb-6">
              <img src="/assets/logo.png" alt="Decodiaries" className="h-12 md:h-14 w-auto" />
              <div className="border-l border-white/20 pl-3 leading-tight">
                <div className="font-heading text-sm md:text-base">Delhi NCR</div>
                <div className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/70">Event Planner</div>
              </div>
            </div>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-xs mx-auto sm:mx-0">
              Crafting bespoke luxury events across Delhi, Noida, and Ghaziabad with passion and precision.
            </p>
            <div className="flex justify-center sm:justify-start gap-3">
              <motion.a
                href="https://www.instagram.com/deco.diariesnoida?igsh=cmthdWlud3BoYndq&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                data-testid="footer-instagram"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-gradient-to-tr hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F56040] flex items-center justify-center transition-all duration-300 hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={16} className="md:w-4 md:h-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <h4 className="font-heading text-lg md:text-xl mb-4 md:mb-5 text-[#BFA2DB]">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3 text-sm text-white/80">
              {["Home", "Events", "Packages", "Gallery", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`/#${item.toLowerCase()}`}
                    className="hover:text-[#BFA2DB] transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services - Updated with Haldi, Mehndi */}
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <h4 className="font-heading text-lg md:text-xl mb-4 md:mb-5 text-[#BFA2DB]">Our Services</h4>
            <ul className="space-y-2 md:space-y-3 text-sm text-white/80">
              {["Haldi", "Mehndi", "Birthday Parties", "Anniversary Celebrations", "Baby Showers", "Corporate Events"].map((service) => (
                <li key={service} className="hover:text-[#BFA2DB] transition-colors duration-300">
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <h4 className="font-heading text-lg md:text-xl mb-4 md:mb-5 text-[#BFA2DB]">Get in Touch</h4>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/80">
              <li className="flex items-center justify-center sm:justify-start gap-3 group">
                <Phone size={16} className="text-[#BFA2DB] group-hover:scale-110 transition-transform" />
                <a href="tel:+918796306375" className="hover:text-[#BFA2DB] transition-colors">+91 87963 06375</a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3 group">
                <Mail size={16} className="text-[#BFA2DB] group-hover:scale-110 transition-transform" />
                <a href="mailto:contact@decodiaries.com" className="hover:text-[#BFA2DB] transition-colors break-all">contact@decodiaries.com</a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-3 group">
                <MapPin size={16} className="text-[#BFA2DB] group-hover:scale-110 transition-transform" />
                <span>Delhi · Noida · Ghaziabad</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-white/60"
        >
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} Decodiaries — Delhi NCR Event Planner. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link to="/admin/login" className="hover:text-[#BFA2DB] transition-colors duration-300 hover:scale-105 inline-block">
              Admin
            </Link>
            <span className="flex items-center gap-1">
              Made with <Sparkles size={12} className="text-pink-400" /> in Delhi NCR
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
