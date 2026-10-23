"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";
import { EnquiryModal } from "@/components/services/EnquiryModal";
import Footer from "@/components/landing/Footer";
import { fetchServiceDetails, ServiceProvider } from "@/lib/servicesApi";

interface ProviderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProviderDetailsPage({ params }: ProviderDetailsPageProps) {
  const resolvedParams = use(params);
  const providerId = Number(resolvedParams.id);

  const [service, setService] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active portfolio image selection
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Enquiry Modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(providerId) || providerId <= 0) {
      setError("Invalid provider ID.");
      setLoading(false);
      return;
    }

    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchServiceDetails(providerId);
        if (!data) {
          setError("Service provider not found or no longer active.");
        } else {
          setService(data);
          setSelectedImage(data.coverImage || data.cover_image || null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load provider details.");
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [providerId]);

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <ServicesNavbar />

      <main className="flex-1">
        {/* LOADING STATE */}
        {loading && (
          <div className="mx-auto max-w-5xl px-4 py-20 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-[var(--brand-primary)] mx-auto mb-3" />
            <p className="text-xs text-[var(--text-muted)]">Loading provider details...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 space-y-4">
              <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Provider Not Available</h2>
              <p className="text-xs text-[var(--text-secondary)]">{error}</p>
              <div className="pt-2">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-semibold text-white shadow hover:scale-[1.02] transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Services</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PROVIDER DETAILS CONTENT */}
        {!loading && service && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text-primary)] transition">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/services" className="hover:text-[var(--text-primary)] transition">
                Services
              </Link>
              {service.category?.slug && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <Link
                    href={`/services/${service.category.slug}`}
                    className="hover:text-[var(--text-primary)] transition capitalize"
                  >
                    {service.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3" />
              <span className="text-[var(--text-primary)] font-semibold truncate max-w-[200px]">
                {service.name}
              </span>
            </nav>

            {/* 1. COVER & PORTFOLIO AREA */}
            <div className="space-y-3">
              {/* Main Preview Image */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] shadow-xl">
                <img
                  src={
                    selectedImage ||
                    service.coverImage ||
                    service.cover_image ||
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={service.name}
                  className="h-full w-full object-cover transition-all duration-300"
                />

                {/* Rating Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-white/10 shadow-lg">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{Number(service.rating || 4.8).toFixed(1)}</span>
                  {(service.reviewCount || service.review_count || 0) > 0 && (
                    <span className="text-[11px] text-gray-300">
                      ({service.reviewCount || service.review_count} reviews)
                    </span>
                  )}
                </div>

                {/* Verified Partner Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 shadow-lg">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified Service Provider</span>
                </div>
              </div>

              {/* Portfolio Thumbnail Strip */}
              {((service.portfolioImages && service.portfolioImages.length > 0) ||
                (service.portfolio_images && service.portfolio_images.length > 0)) && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {/* Include cover image as first thumbnail */}
                  {(service.coverImage || service.cover_image) && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(service.coverImage || service.cover_image || null)}
                      className={`relative h-16 sm:h-20 w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition-all ${
                        selectedImage === (service.coverImage || service.cover_image)
                          ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/40 scale-102"
                          : "border-[var(--border)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={service.coverImage || service.cover_image || ""}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )}

                  {(service.portfolioImages || service.portfolio_images || []).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-16 sm:h-20 w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition-all ${
                        selectedImage === img
                          ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/40 scale-102"
                          : "border-[var(--border)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Portfolio ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PROVIDER HEADER & PRIMARY CTA BAR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] shadow-lg">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 px-3 py-0.5 text-xs font-bold text-[var(--brand-primary)]">
                    {service.category?.name || "Wedding Specialist"}
                  </span>
                  {service.isFeatured && (
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      ★ Featured
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {service.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                    {service.location}
                  </span>
                  {(service.priceRange || service.price_range) && (
                    <span className="text-[var(--brand-primary)] font-bold">
                      Price Range: {service.priceRange || service.price_range}
                    </span>
                  )}
                </div>

                {service.tagline && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic pt-1 max-w-2xl">
                    &ldquo;{service.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share Provider Link"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]/40 transition"
                  title="Copy link to share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {copiedShare && (
                  <span className="text-[11px] text-emerald-400 font-semibold">Link copied!</span>
                )}

                {/* PRIMARY CTA: Contact Service */}
                <button
                  type="button"
                  onClick={() => setIsEnquiryOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact Service</span>
                </button>
              </div>
            </div>

            {/* TWO-COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT 2 COLUMNS: About & Services Offered */}
              <div className="lg:col-span-2 space-y-8">
                {/* 3. ABOUT SECTION */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 sm:p-7 space-y-3 shadow-sm">
                  <h2 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
                    About {service.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {service.about || service.description || "Dedicated wedding professionals ensuring your celebration is flawless, beautiful, and memorable."}
                  </p>
                </div>

                {/* 4. SERVICES OFFERED */}
                {((service.servicesOffered && service.servicesOffered.length > 0) ||
                  (service.services_offered && service.services_offered.length > 0)) && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 sm:p-7 space-y-4 shadow-sm">
                    <h2 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
                      Services Offered
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(service.servicesOffered || service.services_offered || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-xl bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-medium border border-[var(--border)]"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. PACKAGES (Informational Only) */}
                {service.packages && service.packages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                        <span>📦</span> Available Packages
                      </h2>
                      <span className="text-[11px] text-[var(--text-muted)] italic">
                        * Packages are customizable to your event requirements
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-sm hover:border-[var(--brand-primary)]/40 transition"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-sm text-[var(--text-primary)]">{pkg.name}</h3>
                              <span className="rounded-lg bg-[var(--brand-primary)]/15 px-2.5 py-1 text-xs font-extrabold text-[var(--brand-primary)] shrink-0">
                                {pkg.price}
                              </span>
                            </div>

                            {pkg.description && (
                              <p className="text-xs text-[var(--text-secondary)] mb-4">{pkg.description}</p>
                            )}

                            {pkg.features && pkg.features.length > 0 && (
                              <ul className="space-y-2 text-xs text-[var(--text-secondary)] pt-1">
                                {pkg.features.map((feat, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-2">
                                    <span className="text-emerald-400 shrink-0">✓</span>
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="mt-5 pt-3 border-t border-[var(--border)]">
                            <button
                              type="button"
                              onClick={() => setIsEnquiryOpen(true)}
                              className="w-full rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 py-2 text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                            >
                              Enquire for this Package
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT 1 COLUMN: Contact Card & Quick Info */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 space-y-5 shadow-sm sticky top-24">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">Contact & Overview</h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] block">Operating Region</span>
                        <span className="text-[var(--text-secondary)]">{service.location}</span>
                      </div>
                    </div>

                    {service.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] block">Phone</span>
                          <span className="text-[var(--text-secondary)]">{service.phone}</span>
                        </div>
                      </div>
                    )}

                    {service.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] block">Email</span>
                          <span className="text-[var(--text-secondary)]">{service.email}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] block">Customer Satisfaction</span>
                        <span className="text-[var(--text-secondary)]">
                          {Number(service.rating || 4.8).toFixed(1)} / 5.0 Rating
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryOpen(true)}
                      className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 py-3 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-98 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Contact Service</span>
                    </button>
                    <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
                      No booking fees. Direct consultation with provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ENQUIRY MODAL */}
            <EnquiryModal
              isOpen={isEnquiryOpen}
              onClose={() => setIsEnquiryOpen(false)}
              service={service}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
