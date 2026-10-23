"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { ServiceProvider } from "@/lib/servicesApi";

interface ProviderCardProps {
  service: ServiceProvider;
}

export function ProviderCard({ service }: ProviderCardProps) {
  const rating = Number(service.rating || 4.8).toFixed(1);
  const reviewCount = service.reviewCount || service.review_count || 0;
  const coverImage =
    service.coverImage ||
    service.cover_image ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      href={`/services/provider/${service.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] transition-all duration-200 hover:border-[var(--brand-primary)]/40 hover:shadow-lg hover:shadow-[var(--shadow-glow)]"
    >
      {/* Provider Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-soft)]">
        <img
          src={coverImage}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-300 shadow-sm border border-white/10">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{rating}</span>
          {reviewCount > 0 && <span className="text-[10px] text-gray-300">({reviewCount})</span>}
        </div>

        {/* Category Pill */}
        {service.category?.name && (
          <div className="absolute bottom-3 left-3 rounded-full bg-[var(--brand-primary)]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            {service.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1 space-y-1.5">
          <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
            {service.name}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            {service.tagline || service.description || "Expert wedding services for your memorable day."}
          </p>
        </div>

        {/* Location & Starting Price */}
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[var(--text-muted)] font-medium truncate max-w-[55%]">
            <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{service.city || service.location}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
