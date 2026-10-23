"use client";

import { motion } from "framer-motion";
import { UserPlus, Compass, MessageSquareHeart } from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    subtitle: "Contact Verified Account",
    description:
      "Register with email & mobile verification. Add your family background, education, lifestyle preferences, and partner expectations.",
    accentGlow: "rgba(224, 86, 123, 0.3)",
    accentLight: "rgba(244, 63, 94, 0.15)",
  },
  {
    number: "02",
    icon: Compass,
    title: "Discover Meaningful Matches",
    subtitle: "Filter & AI Compatibility",
    description:
      "Filter profiles by location, community, or mother tongue, and explore AI compatibility insights to understand shared values.",
    accentGlow: "rgba(139, 92, 246, 0.3)",
    accentLight: "rgba(168, 85, 247, 0.15)",
  },
  {
    number: "03",
    icon: MessageSquareHeart,
    title: "Connect & Build Your Future",
    subtitle: "Respectful Dialogue",
    description:
      "Express interest to candidate profiles you connect with. Once accepted, start private conversations to build a lasting relationship.",
    accentGlow: "rgba(212, 175, 55, 0.3)",
    accentLight: "rgba(234, 179, 8, 0.15)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Soft Ambient Radial Glow for Discover -> HowItWorks Transition */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/07 via-rose-500/04 to-purple-600/0 blur-[140px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
            Simple &amp; Respectful Process
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mt-3">
            Your journey <span className="text-gradient">starts here.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            A straightforward process designed to safeguard your privacy and help you find an authentic connection.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <Interactive3DCard
                  accentGlow={step.accentGlow}
                  accentLight={step.accentLight}
                  className="p-8 flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="font-serif text-5xl font-extrabold text-[var(--brand-primary)]/30 group-hover:text-[var(--brand-primary)]/50 transition-colors"
                        style={{ transform: "translateZ(16px)" }}
                      >
                        {step.number}
                      </span>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow-sm"
                        style={{ transform: "translateZ(14px)" }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    <div style={{ transform: "translateZ(10px)" }}>
                      <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-1">
                        {step.title}
                      </h3>

                      <p className="text-[11px] font-semibold text-[var(--brand-primary)] mb-3">
                        {step.subtitle}
                      </p>
                    </div>

                    <p
                      className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                      style={{ transform: "translateZ(6px)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </Interactive3DCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
