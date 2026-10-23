"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";
import { ProviderCard } from "@/components/services/ProviderCard";
import { getCategoryEmoji } from "@/components/services/CategoryIcon";
import Footer from "@/components/landing/Footer";
import {
  fetchCategoryBySlug,
  fetchServices,
  fetchServiceLocations,
  ServiceCategory,
  ServiceProvider,
} from "@/lib/servicesApi";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryListingPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Next.js App Router dynamic route param
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.category;

  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [selectedTag, setSelectedTag] = useState("all");

  // Load category details and locations once on mount/slug change
  useEffect(() => {
    async function initCategory() {
      try {
        const [catData, locData] = await Promise.all([
          fetchCategoryBySlug(categorySlug),
          fetchServiceLocations(),
        ]);

        if (!catData) {
          setError(`The service category "${categorySlug}" was not found.`);
          setLoading(false);
          return;
        }

        setCategory(catData);
        setLocations(locData);
      } catch (err: any) {
        setError(err.message || "Failed to load category details");
      }
    }

    initCategory();
  }, [categorySlug]);

  // Load providers whenever category, search, location, or tag changes
  useEffect(() => {
    if (!categorySlug) return;

    let isCancelled = false;

    async function loadProviders() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchServices({
          category: categorySlug,
          location: selectedLocation !== "all" ? selectedLocation : undefined,
          search: search.trim() ? search.trim() : undefined,
          tag: selectedTag !== "all" ? selectedTag : undefined,
        });

        if (!isCancelled) {
          setProviders(res.services);
          setTotalCount(res.total);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError("We couldn't load the services right now. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadProviders();

    return () => {
      isCancelled = true;
    };
  }, [categorySlug, selectedLocation, selectedTag, search]);

  function handleResetFilters() {
    setSearch("");
    setSelectedLocation("all");
    setSelectedTag("all");
  }

  const categoryEmoji = getCategoryEmoji(categorySlug);

  // Subcategories / filter pills
  const filterPills = [
    "All",
    ...(category?.subcategories || [
      "Wedding",
      "Pre-Wedding",
      "Candid",
      "Traditional",
      "Cinematic",
    ]),
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <ServicesNavbar />

      <main className="flex-1">
        {/* Breadcrumb & Category Header */}
        <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/50 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-4">
              <Link href="/" className="hover:text-[var(--text-primary)] transition">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/services" className="hover:text-[var(--text-primary)] transition">
                Services
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[var(--text-primary)] font-semibold capitalize">
                {category?.name || categorySlug}
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl" role="img" aria-label={category?.name || ""}>
                    {categoryEmoji}
                  </span>
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                      {category?.name || categorySlug}
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                      {category?.description || `Find top rated ${categorySlug} for your special moments.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Count */}
              {!loading && (
                <div className="text-xs text-[var(--text-muted)] font-medium shrink-0">
                  Showing <span className="font-bold text-[var(--text-primary)]">{providers.length}</span> verified{" "}
                  {providers.length === 1 ? "specialist" : "specialists"}
                </div>
              )}
            </div>

            {/* FILTERS & SEARCH TOOLBAR */}
            <div className="mt-6 pt-5 border-t border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by provider name or style..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="relative w-full sm:w-56 shrink-0">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rose-400 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-8 pr-8 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 cursor-pointer appearance-none"
                >
                  <option value="all">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Category Subcategory Filter Pills */}
            <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
                <SlidersHorizontal className="h-3 w-3" /> Filter:
              </span>
              {filterPills.map((pill) => {
                const isActive = selectedTag.toLowerCase() === pill.toLowerCase();
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setSelectedTag(pill.toLowerCase() === "all" ? "all" : pill)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[var(--brand-primary)] text-white shadow-sm"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]/40"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROVIDERS GRID SECTION */}
        <section className="py-10 sm:py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ERROR STATE */}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">Something went wrong</h3>
              <p className="text-xs text-[var(--text-secondary)]">{error}</p>
              <button
                type="button"
                onClick={() => setSelectedTag("all")}
                className="mt-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3 animate-pulse"
                >
                  <div className="aspect-[16/10] w-full rounded-xl bg-[var(--surface-soft)]" />
                  <div className="h-4 w-3/4 rounded bg-[var(--surface-soft)]" />
                  <div className="h-3 w-full rounded bg-[var(--surface-soft)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--surface-soft)]" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && providers.length === 0 && (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)] border border-[var(--border)] text-2xl">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No services found</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  We couldn&apos;t find services matching your search. Try another category or location.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* PROVIDERS GRID: 3 on Desktop, 2 on Tablet, 1 on Mobile */}
          {!loading && !error && providers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((service) => (
                <ProviderCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
