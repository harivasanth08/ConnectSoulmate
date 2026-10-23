"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCategory } from "@/lib/servicesApi";
import { CategoryIcon, getCategoryEmoji } from "./CategoryIcon";

interface CategoryCardProps {
  category: ServiceCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const emoji = getCategoryEmoji(category.slug);
  const count = category.service_count;

  return (
    <Link
      href={`/services/${category.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 sm:p-6 transition-all duration-200 hover:border-[var(--brand-primary)]/40 hover:bg-[var(--surface)] hover:shadow-lg hover:shadow-[var(--shadow-glow)]"
    >
      <div>
        {/* Top Icon & Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-purple-500/15 border border-[var(--border)] text-[var(--brand-primary)] transition-transform duration-200 group-hover:scale-110">
            <span className="text-xl" role="img" aria-label={category.name}>
              {emoji}
            </span>
          </div>

          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
              {count} {count === 1 ? "service" : "services"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
          {category.name}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Action CTA */}
      <div className="mt-5 pt-3.5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)]">
        <span>View Services</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
