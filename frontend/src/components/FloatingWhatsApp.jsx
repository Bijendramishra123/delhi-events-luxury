import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, openWhatsApp } from "../lib/api";

const DEFAULT_MESSAGE = "Hello Team,\n\nI would like to inquire about an event.\n\nName: \nEvent Type: \nEvent Date: \nLocation: \nBudget: \n\nPlease contact me.";

export default function FloatingWhatsApp({ phone = "918796306375" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <a
      href={buildWhatsAppLink(phone, DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => openWhatsApp(e, phone, DEFAULT_MESSAGE)}
      data-testid="floating-whatsapp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
