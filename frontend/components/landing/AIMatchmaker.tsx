"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Heart, Users, Home as HomeIcon, MessageCircle, Gem } from "lucide-react";
import CompatibilityCard, { DEFAULT_COMPATIBILITY_METRICS } from "@/components/ui/CompatibilityCard";

const orbitBadges = [
  { icon: "❤️", label: "Shared Values", val: "96%", angle: "-top-2 left-6" },
  { icon: "👨‍👩‍👧", label: "Family Goals", val: "94%", angle: "-top-2 right-6" },
  { icon: "💍", label: "Marriage Goals", val: "95%", angle: "-bottom-2 right-6" },
  { icon: "💬", label: "Communication", val: "89%", angle: "-bottom-2 left-6" },
  { icon: "🏡", label: "Lifestyle", val: "91%", angle: "top-1/2 -right-4 -translate-y-1/2" },
];

export default function AIMatchmaker() {
  return (
    <section id="ai-compatibility" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Soft Ambient Radial Glow for HowItWorks -> AI Compatibility Transition */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 h-[550px] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/10 via-pink-500/05 to-transparent blur-[140px]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            <Brain className="h-3.5 w-3.5" />
            <span>AI Compatibility Insights</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mt-3">
            Understand where your{" "}
            <span className="text-gradient">profiles naturally align</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            AI-powered evaluation comparing shared values, family goals, lifestyle habits, communication harmony, and long-term marriage expectations.
          </p>
        </motion.div>

        {/* Main AI Showcase Container */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Orbit Score Visual with Floating Highlights */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center surface-card p-8 rounded-full border border-[var(--border)]/60 shadow-2xl"
          >
            {/* Concentric Rings */}
            <div className="absolute inset-[6%] rounded-full border border-[var(--brand-purple)]/15" />
            <div className="absolute inset-[18%] rounded-full border border-[var(--brand-primary)]/20" />
            <div className="absolute inset-[30%] rounded-full border border-dashed border-[var(--brand-purple)]/25" />

            {/* Orbit Dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[18%] rounded-full"
            >
              <span className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/80 ring-2 ring-white/60" />
            </motion.div>

            {/* Core Score Ring */}
            <div className="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white shadow-2xl ring-4 ring-pink-500/20">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-7 w-7 mb-1 text-amber-200 animate-pulse drop-shadow" />
              </motion.div>
              <span className="text-5xl font-black font-serif tracking-tight drop-shadow-sm">92%</span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/95 mt-1 bg-black/20 px-2.5 py-0.5 rounded-full">
                Strong Compatibility
              </span>
            </div>

            {/* Floating Dimension Pills around Orbit */}
            {orbitBadges.map((badge, idx) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className={`absolute ${badge.angle} z-20 hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)]/90 backdrop-blur-md px-3 py-1.5 shadow-lg text-xs font-semibold text-[var(--text-primary)]`}
              >
                <span className="text-sm select-none">{badge.icon}</span>
                <span className="text-[11px] text-[var(--text-secondary)]">{badge.label}</span>
                <span className="text-[11px] font-bold text-[var(--brand-primary)] ml-0.5">{badge.val}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Showcase: "YOUR COMPATIBILITY" Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="w-full max-w-md mx-auto lg:max-w-none"
          >
            <CompatibilityCard
              title="YOUR COMPATIBILITY"
              score={92}
              statusLabel="STRONG COMPATIBILITY"
              metrics={DEFAULT_COMPATIBILITY_METRICS}
              insightTitle="AI MATCH INSIGHT"
              insightQuote="You both share strong family values and similar long-term expectations."
              with3DEffect={true}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
