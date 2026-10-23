"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart, Search } from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Soft Ambient Radial Glow for Contact -> Final CTA Transition */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[450px] w-full max-w-4xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/07 via-pink-500/04 to-purple-600/0 blur-[130px]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Interactive3DCard
            accentGlow="rgba(224, 86, 123, 0.35)"
            accentLight="rgba(244, 63, 94, 0.18)"
            className="p-8 sm:p-12 text-center bg-gradient-to-br from-[var(--surface)] via-[var(--surface-soft)] to-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-3xl"
          >
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] mb-4"
              style={{ transform: "translateZ(14px)" }}
            >
              <Heart className="h-6 w-6" />
            </div>

            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight"
              style={{ transform: "translateZ(12px)" }}
            >
              Your next chapter <span className="text-gradient">could start here.</span>
            </h2>

            <p
              className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
              style={{ transform: "translateZ(8px)" }}
            >
              Create your confidential matrimonial profile today and explore verified candidate profiles tailored to your family background and core values.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
              style={{ transform: "translateZ(14px)" }}
            >
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-7 py-3.5 text-xs font-semibold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>Create Your Profile</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/search"
                className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-6 py-3.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all flex items-center gap-2"
              >
                <Search className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Explore Matches</span>
              </Link>
            </div>
          </Interactive3DCard>
        </motion.div>
      </div>
    </section>
  );
}
