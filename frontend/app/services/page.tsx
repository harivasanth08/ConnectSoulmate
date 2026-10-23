"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";
import { CategoryCard } from "@/components/services/CategoryCard";
import { ProviderCard } from "@/components/services/ProviderCard";
import Footer from "@/components/landing/Footer";
import {
  fetchServiceCategories,
  fetchServices,
  fetchServiceLocations,
  ServiceCategory,
  ServiceProvider,
} from "@/lib/servicesApi";

export default function ServicesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<ServiceProvider[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state in hero
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [userMode, setUserMode] = useState<"parent" | "individual" | null>(null);

  useEffect(() => {
    // Detect user mode
    try {
      const storedUser = localStorage.getItem("connectsoulmate_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role === "parent") {
          setUserMode("parent");
        } else {
          setUserMode("individual");
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [cats, srvs, locs] = await Promise.all([
        fetchServiceCategories(userMode),
        fetchServices({ featured: true, limit: 6 }),
        fetchServiceLocations(),
      ]);

      setCategories(cats);
      setFeaturedServices(srvs.services);
      setLocations(locs);
    } catch (err: any) {
      console.error("Failed to load services data:", err);
      setError("We couldn't load the services right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userMode]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
    if (selectedLocation && selectedLocation !== "all") queryParams.set("location", selectedLocation);

    // Redirect to the first category or photography with search query
    const targetCat = categories.length > 0 ? categories[0].slug : "photography";
    router.push(`/services/${targetCat}?${queryParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <ServicesNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[var(--border)] py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-[var(--surface-soft)]/60 via-[var(--background)] to-[var(--background)]">
          {/* Subtle Ambient Background Accents */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Mode Indicator Pill */}
            {userMode === "parent" ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-6">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>Family Mode: Venues, Catering & Decor Prioritized</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)] mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ConnectSoulmate Wedding Services</span>
              </div>
            )}

            {/* Main Heading */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-3xl mx-auto leading-tight">
              Everything for your <span className="text-gradient">special day</span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              From capturing your memories to creating the perfect celebration, discover wedding services in one place.
            </p>

            {/* Hero Quick Search Bar */}
            <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
              >
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search photographers, caterers, venues..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs text-[var(--text-primary)] bg-transparent placeholder-[var(--text-muted)] focus:outline-none"
                  />
                </div>

                {/* Location Select */}
                <div className="relative w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-2">
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rose-400" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-8 pr-6 py-2 text-xs text-[var(--text-primary)] bg-transparent focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="all" className="bg-[var(--surface)] text-[var(--text-primary)]">
                        All Locations
                      </option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc} className="bg-[var(--surface)] text-[var(--text-primary)]">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Explore
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ERROR STATE */}
        {error && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">Something went wrong</h3>
              <p className="text-xs text-[var(--text-secondary)]">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="mt-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)] mx-auto mb-3" />
            <p className="text-xs text-[var(--text-muted)]">Loading wedding services...</p>
          </div>
        )}

        {/* EXPLORE WEDDING SERVICES (CATEGORIES SECTION) */}
        {!loading && !error && (
          <section className="py-14 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)] uppercase">
                Categories
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                Explore Wedding Services
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
                Discover verified professionals across all major wedding arrangements
              </p>
            </div>

            {/* CATEGORIES GRID: Responsive 3-4 Desktop, 2 Tablet, 1 Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* SERVICES STORY SECTION */}
        <section className="py-16 sm:py-20 border-y border-[var(--border)] bg-[var(--surface-soft)]/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto space-y-2 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-gold)]">
                The ConnectSoulmate Journey
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                Planning your special day?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Your journey doesn&apos;t end when you find your match.
              </p>
            </div>

            {/* VISUAL PROGRESSION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center space-y-3 shadow-md hover:border-pink-500/40 transition">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">Find Your Match</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Discover compatible partners verified by email confirmation, horoscope compatibility, and family alignment.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center space-y-3 shadow-md hover:border-pink-500/40 transition">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">Build Your Connection</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Connect through expressive interests, private encrypted messaging, and mutual family conversations.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center space-y-3 shadow-md border-pink-500/30 bg-gradient-to-b from-pink-500/5 to-transparent">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <span className="text-2xl">💍</span>
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">Plan Your Celebration</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Discover trusted photographers, fairy-tale mandaps, gourmet catering, and dreamy honeymoon packages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED SERVICE PROVIDERS */}
        {!loading && featuredServices.length > 0 && (
          <section className="py-14 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)] uppercase">
                  Top Recommended
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                  Featured Service Providers
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Handpicked professionals with verified ratings and proven excellence
                </p>
              </div>

              <Link
                href="/services/photography"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <span>Browse all services</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ProviderCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
