import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, Leaf, Sparkles, CheckCircle, MessageCircle, Users, Settings, PartyPopper } from "lucide-react";

// New Categories for "What We Decorate"
const DECORATE_CATEGORIES = [
  {
    emoji: "🎂",
    name: "Birthday",
    description: "Balloon arches, themed setups, photo backdrops — we turn your birthday into a whole aesthetic.",
    color: "from-pink-500 to-orange-400",
  },
  {
    emoji: "🍼",
    name: "Baby Shower",
    description: "Soft pastels, dreamy drapes, and sweet little details to welcome the newest love.",
    color: "from-blue-400 to-purple-400",
  },
  {
    emoji: "🌼",
    name: "Haldi",
    description: "Marigold magic, bright florals, and joyful setups to celebrate the pre-wedding glow.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    emoji: "✨",
    name: "Sangeet",
    description: "Fairy lights, floral curtains, and statement backdrops for a night of music and memories.",
    color: "from-purple-500 to-pink-500",
  },
  {
    emoji: "💍",
    name: "Anniversary",
    description: "Romantic, refined, and intimate — decor that celebrates years of togetherness.",
    color: "from-red-400 to-rose-400",
  },
];

// Process Steps Data
const PROCESS_STEPS = [
  {
    number: "01",
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Enquire",
    description: "Fill our quick form or WhatsApp us with your event details and date.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "02",
    icon: <Users className="w-8 h-8" />,
    title: "Consultation",
    description: "We discuss your vision, theme, and budget to create a custom plan.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    icon: <Settings className="w-8 h-8" />,
    title: "We Setup",
    description: "Our team arrives, sets everything up, and handles all the details.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    number: "04",
    icon: <PartyPopper className="w-8 h-8" />,
    title: "You Celebrate",
    description: "Walk into your beautifully decorated space and enjoy every moment.",
    color: "from-green-500 to-emerald-500",
  },
];

const VALUES = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Minimal & Intentional",
    description: "Clean palettes. No clutter. Every element earns its place in your celebration space.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Fully Customised",
    description: "No two events are the same. We design around your vision, theme, and budget.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "End-to-End Setup",
    description: "We arrive, we setup, we leave — you just walk into your perfect moment.",
  },
];

export default function EventsSection() {
  return (
    <section id="events" className="py-24 md:py-32 bg-[#FAF9F6]" data-testid="events-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Our Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-[#6B4F8C]/10 rounded-full px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-[#6B4F8C]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#6B4F8C] font-semibold">Our Story</span>
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight mb-6">
            We don't just decorate,<br />
            <span className="text-[#BFA2DB]">we create feelings</span>
          </h2>
          
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-16">
            Decodaires was born from a love of beautiful spaces and even more beautiful moments. 
            Every balloon, every drape, every bloom is placed with intention — to make you feel it.
          </p>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {VALUES.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-6 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-[#6B4F8C]/10 flex items-center justify-center text-[#6B4F8C] mx-auto mb-4 group-hover:bg-[#6B4F8C] group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-heading text-[#6B4F8C] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#6B4F8C]/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FAF9F6] px-4 text-sm text-[#6B4F8C]/60">What We Decorate</span>
          </div>
        </div>

        {/* What We Decorate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight mb-4">
            Every celebration<br />
            <span className="text-[#BFA2DB]">deserves beauty</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From the grandest sangeet to the coziest terrace party, we bring the same love and detail to every setup.
          </p>
        </motion.div>

        {/* Decorate Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {DECORATE_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="relative z-10">
                <motion.div 
                  className="text-5xl mb-4 inline-block"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {cat.emoji}
                </motion.div>
                <h3 className="text-xl font-heading text-[#6B4F8C] mb-3">{cat.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{cat.description}</p>
                <motion.a
                  href="#packages"
                  className="inline-flex items-center gap-1 text-[#6B4F8C] text-sm font-medium hover:gap-2 transition-all"
                  whileHover={{ x: 5 }}
                >
                  Explore <ArrowUpRight size={14} />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Process Section */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#6B4F8C]/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FAF9F6] px-4 text-sm text-[#6B4F8C]/60">How It Works</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#6B4F8C] leading-tight mb-4">
            Simple steps to your<br />
            <span className="text-[#BFA2DB]">perfect setup</span>
          </h2>
        </motion.div>

        {/* Process Steps - Animated Timeline */}
        <div className="relative mb-20">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#6B4F8C]/20 via-[#BFA2DB]/40 to-[#6B4F8C]/20 hidden lg:block -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="mt-4 mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                         style={{ background: `linear-gradient(135deg, ${step.color.split(' ')[1]}20, ${step.color.split(' ')[3]}20)` }}>
                      <div className="text-[#6B4F8C]">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-heading text-[#6B4F8C] mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  
                  {/* Arrow connector between steps (desktop) */}
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#BFA2DB]">
                      <ArrowUpRight className="w-5 h-5 rotate-45" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button after Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-3 bg-[#6B4F8C] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#4F3A6A] transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Celebration <ArrowUpRight size={20} />
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}