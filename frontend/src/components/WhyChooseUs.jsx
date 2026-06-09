import React from "react";
import { motion } from "framer-motion";
import { Users, Sparkles, Wallet, Clock, Heart, Crown } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Professional Team", desc: "A decade-trained crew of decorators, coordinators, and creatives." },
  { icon: Sparkles, title: "Custom Planning", desc: "Every detail tailored to your story, palette and vision." },
  { icon: Wallet, title: "Affordable Packages", desc: "Transparent pricing without compromising on premium quality." },
  { icon: Clock, title: "Timely Execution", desc: "Punctual setups, seamless coordination, zero surprises." },
  { icon: Heart, title: "Customer Satisfaction", desc: "98% client delight rate, driven by relentless attention." },
  { icon: Crown, title: "Premium Decoration", desc: "Designer florals, custom installations, luxury aesthetics." },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32 bg-white" data-testid="why-choose-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B4F8C] mb-4">Why Choose Us</p>
          <h2 className="font-heading text-4xl md:text-5xl text-[#6B4F8C] leading-tight">
            Crafting events with <em className="not-italic text-[#BFA2DB]">soul</em> and precision
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                data-testid={`feature-${i}`}
                className="group"
              >
                <div className="w-14 h-14 rounded-full bg-[#BFA2DB]/15 flex items-center justify-center mb-6 group-hover:bg-[#6B4F8C] transition-colors duration-500">
                  <Icon className="text-[#6B4F8C] group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="font-heading text-2xl text-[#6B4F8C] mb-3">{f.title}</h3>
                <p className="text-[#666] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
