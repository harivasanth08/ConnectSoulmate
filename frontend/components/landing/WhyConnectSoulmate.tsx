"use client";

import { motion } from "framer-motion";
import { ShieldCheck, HeartHandshake, Lock, Sparkles, ArrowRight } from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    subtitle: "Email & Mobile Verified",
    description:
      "Contact verification ensures authentic member profiles and genuine matrimonial intentions.",
    accentGlow: "rgba(224, 86, 123, 0.35)",
    accentLight: "rgba(244, 63, 94, 0.18)",
  },
  {
    icon: Lock,
    title: "Safe & Secure",
    subtitle: "Your Privacy Matters",
    description:
      "Control photo visibility, contact details, and background access with flexible privacy settings.",
    accentGlow: "rgba(212, 175, 55, 0.35)",
    accentLight: "rgba(234, 179, 8, 0.18)",
  },
  {
    icon: HeartHandshake,
    title: "Meaningful Connections",
    subtitle: "Built Around Shared Values",
    description:
      "Profiles center on family background, lifestyle choices, education, and long-term relationship goals.",
    accentGlow: "rgba(244, 63, 94, 0.35)",
    accentLight: "rgba(224, 86, 123, 0.18)",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    subtitle: "Compatibility Depth",
    description:
      "Exploratory AI compatibility evaluations analyze profile attributes to highlight complementary values.",
    accentGlow: "rgba(139, 92, 246, 0.35)",
    accentLight: "rgba(168, 85, 247, 0.18)",
  },
];

export default function WhyConnectSoulmate() {
  return (
    <section id="discover" className="py-16 lg:py-24 relative overflow-hidden">
      {/* Soft Ambient Radial Glow for Discover Section (Strictly below Hero) */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-full max-w-4xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/08 via-pink-500/04 to-transparent blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
            Built for Meaningful Connection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mt-3 leading-tight">
            A matrimonial platform centered on{" "}
            <span className="text-gradient">trust and values</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Finding a life partner is one of life’s most important decisions. We prioritize dignity, privacy, and compatibility depth.
          </p>
        </motion.div>

        {/* Value Strip Pillars */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Interactive3DCard
                  accentGlow={item.accentGlow}
                  accentLight={item.accentLight}
                  className="p-6 flex flex-col justify-between h-full cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-transform duration-300"
                        style={{ transform: "translateZ(14px)" }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div
                        className="text-[var(--text-muted)] opacity-40 group-hover:text-[var(--brand-primary)] group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                        style={{ transform: "translateZ(12px)" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div style={{ transform: "translateZ(10px)" }}>
                      <h3 className="font-serif text-base font-bold text-[var(--text-primary)] mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-[var(--brand-primary)] mb-2">
                        {item.subtitle}
                      </p>
                    </div>

                    <p
                      className="text-xs text-[var(--text-secondary)] leading-relaxed"
                      style={{ transform: "translateZ(6px)" }}
                    >
                      {item.description}
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
