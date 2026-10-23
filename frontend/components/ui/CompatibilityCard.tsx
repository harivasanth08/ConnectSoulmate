"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { Interactive3DCard } from "./Interactive3DCard";

export interface CompatibilityMetric {
  icon: string | React.ReactNode;
  label: string;
  value: number;
}

export interface CompatibilityCardProps {
  title?: string;
  score?: number;
  statusLabel?: string;
  metrics?: CompatibilityMetric[];
  insightTitle?: string;
  insightQuote?: string;
  candidateName?: string;
  className?: string;
  with3DEffect?: boolean;
}

export const DEFAULT_COMPATIBILITY_METRICS: CompatibilityMetric[] = [
  { icon: "❤️", label: "Shared Values", value: 96 },
  { icon: "👨‍👩‍👧", label: "Family Goals", value: 94 },
  { icon: "🏡", label: "Lifestyle", value: 91 },
  { icon: "💬", label: "Communication", value: 89 },
  { icon: "💍", label: "Marriage Goals", value: 95 },
];

export default function CompatibilityCard({
  title = "YOUR COMPATIBILITY",
  score = 92,
  statusLabel = "STRONG COMPATIBILITY",
  metrics = DEFAULT_COMPATIBILITY_METRICS,
  insightTitle = "AI MATCH INSIGHT",
  insightQuote = "You both share strong family values and similar long-term expectations.",
  candidateName,
  className = "",
  with3DEffect = true,
}: CompatibilityCardProps) {
  const cardContent = (
    <div
      className={`relative surface-card rounded-3xl border border-[var(--border)] p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        with3DEffect ? "" : "hover:border-[var(--brand-primary)]/40 hover:shadow-[var(--shadow-glow)]"
      } ${className}`}
    >
      {/* Top Ambient Glow Accent */}
      <div
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-56 rounded-full bg-gradient-to-r from-pink-500/15 via-rose-500/20 to-purple-600/15 blur-2xl"
        aria-hidden="true"
      />

      {/* 1. Header: YOUR COMPATIBILITY */}
      <div className="text-center relative z-10">
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
          {title}
        </h3>
        {candidateName && (
          <p className="mt-1 text-xs text-[var(--text-muted)] font-medium">
            with {candidateName}
          </p>
        )}
      </div>

      {/* 2. Score Section: Sparkle, 92%, STRONG COMPATIBILITY */}
      <div className="mt-6 flex flex-col items-center justify-center text-center relative z-10">
        {/* Sparkle Icon */}
        <div className="flex items-center justify-center mb-1">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl select-none"
            aria-label="Sparkles"
          >
            ✨
          </motion.div>
        </div>

        {/* 92% Big Score */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-6xl font-black font-serif tracking-tight text-gradient my-1"
        >
          {score}%
        </motion.div>

        {/* Status Badge: STRONG COMPATIBILITY */}
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 px-3.5 py-1 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-[var(--brand-primary)] shadow-sm">
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* 3. Divider Line */}
      <div className="relative my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* 4. Compatibility Metrics List */}
      <div className="space-y-3.5 relative z-10">
        {metrics.map((item, idx) => (
          <div key={item.label} className="group">
            <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                <span className="text-base leading-none select-none drop-shadow-sm">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </span>
              <span className="font-bold text-[var(--brand-primary)] tabular-nums">
                {item.value}%
              </span>
            </div>

            {/* Gradient Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-soft)] border border-[var(--border)]/40 p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, delay: 0.1 + idx * 0.08, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_8px_rgba(224,86,123,0.4)]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Divider Line */}
      <div className="relative my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* 6. AI MATCH INSIGHT */}
      <div className="relative z-10 text-center space-y-2.5">
        <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <Brain className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
          <span>{insightTitle}</span>
        </div>

        <div className="surface-panel rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/70 px-4 py-3 sm:px-5 sm:py-3.5">
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] italic font-medium">
            &ldquo;{insightQuote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );

  if (with3DEffect) {
    return (
      <Interactive3DCard
        accentGlow="rgba(139, 92, 246, 0.35)"
        accentLight="rgba(224, 86, 123, 0.20)"
      >
        {cardContent}
      </Interactive3DCard>
    );
  }

  return cardContent;
}
