"use client";

import { motion } from "framer-motion";
import { Heart, Info, Users, ShieldCheck, Sparkles } from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const illustrativeStories = [
  {
    couple: "Ananya & Vikram",
    location: "Hyderabad & Bengaluru",
    journey: "Matched via Shared Values & Language Preference",
    quote:
      "Having detailed profile information about family values and lifestyle made our initial conversations feel natural and deeply respectful.",
    accentGlow: "rgba(224, 86, 123, 0.3)",
    accentLight: "rgba(244, 63, 94, 0.15)",
  },
  {
    couple: "Priya & Rajesh",
    location: "Chennai & San Jose",
    journey: "Connected through Matrimonial Search Filters",
    quote:
      "The clarity in partner preferences helped us quickly understand our mutual expectations before involving our families.",
    accentGlow: "rgba(212, 175, 55, 0.3)",
    accentLight: "rgba(234, 179, 8, 0.15)",
  },
  {
    couple: "Meera & Siddharth",
    location: "Mumbai & Pune",
    journey: "Discovered via AI Compatibility Insights",
    quote:
      "The AI compatibility report highlighted our shared perspectives on career and family, giving us a great starting point for open dialogue.",
    accentGlow: "rgba(139, 92, 246, 0.3)",
    accentLight: "rgba(168, 85, 247, 0.15)",
  },
];

const philosophyPillars = [
  {
    icon: Users,
    title: "Family & Value Compatibility",
    desc: "Understanding family background and cultural alignment creates a strong foundation for long-term marriage.",
    accentGlow: "rgba(224, 86, 123, 0.3)",
    accentLight: "rgba(244, 63, 94, 0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Mutual Respect & Dignity",
    desc: "Privacy-first controls allow members to share details and photos at their own comfortable pace.",
    accentGlow: "rgba(212, 175, 55, 0.3)",
    accentLight: "rgba(234, 179, 8, 0.15)",
  },
  {
    icon: Sparkles,
    title: "Intentional Partnerships",
    desc: "Designed for individuals looking for genuine long-term partnership rather than superficial dating.",
    accentGlow: "rgba(139, 92, 246, 0.3)",
    accentLight: "rgba(168, 85, 247, 0.15)",
  },
];

export default function SuccessStories() {
  return (
    <section id="stories" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Soft Ambient Radial Glow for AI Compatibility -> Stories Transition */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/07 via-pink-500/04 to-purple-600/0 blur-[140px]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            <Heart className="h-3.5 w-3.5" />
            <span>Relationship Philosophy</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight">
            Because choosing a life partner is different from{" "}
            <span className="text-gradient">choosing a date.</span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            ConnectSoulmate is built on the belief that enduring marriages rest on shared values, family compatibility, and long-term commitment.
          </p>
        </motion.div>

        {/* Philosophy Pillars */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {philosophyPillars.map((item, idx) => {
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
                  className="p-6 flex flex-col justify-between h-full"
                >
                  <div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-4"
                      style={{ transform: "translateZ(14px)" }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3
                      className="font-serif text-base font-bold text-[var(--text-primary)] mb-2"
                      style={{ transform: "translateZ(10px)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-xs text-[var(--text-secondary)] leading-relaxed"
                      style={{ transform: "translateZ(6px)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </Interactive3DCard>
              </motion.div>
            );
          })}
        </div>

        {/* Illustrative Candidate Journeys */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <div className="text-center mb-8 space-y-2">
            <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
              Candidate Relationship Journeys
            </h3>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] bg-[var(--surface-soft)] px-3 py-1 rounded-md border border-[var(--border)]">
              <Info className="h-3.5 w-3.5" />
              <span>Illustrative representations of candidate connection experiences on ConnectSoulmate</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {illustrativeStories.map((story, idx) => (
              <motion.div
                key={story.couple}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Interactive3DCard
                  accentGlow={story.accentGlow}
                  accentLight={story.accentLight}
                  className="p-6 flex flex-col justify-between h-full"
                >
                  <div>
                    <div
                      className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3"
                      style={{ transform: "translateZ(12px)" }}
                    >
                      <div>
                        <h4 className="font-serif text-base font-bold text-[var(--text-primary)]">
                          {story.couple}
                        </h4>
                        <p className="text-[11px] text-[var(--brand-primary)] font-medium">
                          📍 {story.location}
                        </p>
                      </div>
                      <span className="text-[10px] bg-[var(--surface-soft)] text-[var(--text-muted)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                        Demo Journey
                      </span>
                    </div>

                    <p
                      className="text-[11px] font-semibold text-[var(--text-secondary)] mb-2"
                      style={{ transform: "translateZ(8px)" }}
                    >
                      {story.journey}
                    </p>

                    <p
                      className="text-xs text-[var(--text-secondary)] italic leading-relaxed"
                      style={{ transform: "translateZ(6px)" }}
                    >
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>
                </Interactive3DCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
