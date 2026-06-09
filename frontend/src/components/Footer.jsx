import React from "react";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#2d1a3d] text-white pt-20 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/assets/logo.png" alt="Decodiaries" className="h-14 w-auto" />
              <div className="border-l border-white/20 pl-3 leading-tight">
                <div className="font-heading text-base">Delhi NCR</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/70">Event Planner</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Crafting bespoke luxury events across Delhi, Noida and Gurgaon with passion and precision.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/deco.diariesnoida?igsh=cmthdWlud3BoYndq&utm_source=qr" target="_blank" rel="noreferrer" data-testid="footer-instagram" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#BFA2DB] flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" data-testid="footer-facebook" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#BFA2DB] flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" data-testid="footer-youtube" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#BFA2DB] flex items-center justify-center transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-[#BFA2DB]">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><a href="/#home" className="hover:text-[#BFA2DB] transition-colors">Home</a></li>
              <li><a href="/#events" className="hover:text-[#BFA2DB] transition-colors">Events</a></li>
              <li><a href="/#packages" className="hover:text-[#BFA2DB] transition-colors">Packages</a></li>
              <li><a href="/#gallery" className="hover:text-[#BFA2DB] transition-colors">Gallery</a></li>
              <li><a href="/#contact" className="hover:text-[#BFA2DB] transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-[#BFA2DB]">Services</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>Wedding Planning</li>
              <li>Birthday Parties</li>
              <li>Anniversary Celebrations</li>
              <li>Baby Showers</li>
              <li>Corporate Events</li>
              <li>Engagement Ceremonies</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-5 text-[#BFA2DB]">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#BFA2DB] mt-0.5" />
                <a href="tel:+918796306375" className="hover:text-[#BFA2DB]">+91 87963 06375</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#BFA2DB] mt-0.5" />
                <a href="mailto:contact@decodiaries.com" className="hover:text-[#BFA2DB]">contact@decodiaries.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#BFA2DB] mt-0.5" />
                <span>Delhi · Noida · Gurgaon</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <div>© {new Date().getFullYear()} Decodiaries — Delhi NCR Event Planner. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/admin/login" data-testid="footer-admin-link" className="hover:text-[#BFA2DB]">Admin</Link>
            <span>Made with ♡ in Delhi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
