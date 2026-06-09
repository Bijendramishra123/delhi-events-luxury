import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api, { buildWhatsAppLink, openWhatsApp, formatPrice } from "../lib/api";

export default function PackageDetailPage() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/packages/${id}`)
      .then((r) => { if (!cancelled) setPkg(r.data); })
      .catch(() => { if (!cancelled) setPkg(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6B4F8C]" data-testid="pkg-detail-loading">Loading...</div>;
  if (!pkg) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-[#666]">Package not found.</p>
      <Link to="/" className="text-[#6B4F8C] underline">Back home</Link>
    </div>
  );

  const images = pkg.gallery_images && pkg.gallery_images.length > 0
    ? pkg.gallery_images
    : [pkg.cover_image];

  const waMessage = `Hello Team,\n\nI would like to inquire about the "${pkg.package_name}" (${pkg.event_category}) package.\n\nName: \nEvent Date: \nLocation: \nBudget: \n\nPlease contact me.`;
  const wa = buildWhatsAppLink("918796306375", waMessage);

  return (
    <div className="bg-[#F8F5F2] min-h-screen" data-testid="package-detail-page">
      <Navbar />

      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/#packages" data-testid="back-to-packages" className="inline-flex items-center gap-2 text-[#6B4F8C] mb-8 text-sm uppercase tracking-wider hover:gap-3 transition-all">
          <ArrowLeft size={16} /> Back to packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-[4/3] rounded-2xl overflow-hidden mb-4"
            >
              <img src={images[active]} alt={pkg.package_name} className="w-full h-full object-cover" />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActive(images.indexOf(img))}
                    data-testid={`thumb-${images.indexOf(img)}`}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all ${active === images.indexOf(img) ? "ring-2 ring-[#6B4F8C]" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-3">{pkg.event_category}</p>
            <h1 className="font-heading text-4xl md:text-5xl text-[#6B4F8C] mb-4">{pkg.package_name}</h1>
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => <Star key={`star-${i}`} className="fill-[#BFA2DB] text-[#BFA2DB]" size={18} />)}
            </div>
            <p className="text-[#333] leading-relaxed mb-8">{pkg.description}</p>

            <div className="bg-white rounded-2xl p-6 mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xs uppercase tracking-wider text-[#666]">Starting at</span>
                {pkg.discount_price ? (
                  <>
                    <span className="font-heading text-3xl text-[#6B4F8C]">{formatPrice(pkg.discount_price)}</span>
                    <span className="text-sm text-[#999] line-through">{formatPrice(pkg.price)}</span>
                  </>
                ) : (
                  <span className="font-heading text-3xl text-[#6B4F8C]">{formatPrice(pkg.price)}</span>
                )}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#6B4F8C]">{pkg.availability_status}</div>
            </div>

            <div className="mb-8">
              <h3 className="font-heading text-xl text-[#6B4F8C] mb-4">What&apos;s Included</h3>
              <ul className="space-y-3">
                {(pkg.services || []).map((s) => (
                  <li key={s} className="flex items-start gap-3 text-[#333]">
                    <Check size={18} className="text-[#BFA2DB] mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openWhatsApp(e, "918796306375", waMessage)}
                data-testid="detail-whatsapp"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-full hover:scale-[1.02] transition-transform"
              >
                <MessageCircle size={18} /> WhatsApp Inquiry
              </a>
              <Link
                to="/#contact"
                data-testid="detail-contact"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#6B4F8C] text-white px-6 py-4 rounded-full hover:bg-[#4F3A6A] transition-all"
              >
                Send Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
