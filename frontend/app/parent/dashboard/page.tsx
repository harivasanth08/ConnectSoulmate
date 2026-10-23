"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import Interactive3DCard from "@/components/ui/Interactive3DCard";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  Heart,
  Star,
  MessageCircle,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  GraduationCap,
  Briefcase,
  Edit3,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { formatPreferenceDisplay } from "@/lib/formatPreferences";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ParentDashboardData = {
  parent: {
    userId: number;
    parentName: string;
    fullName?: string;
    relationship: string;
    childName: string;
    childRelationship: string;
    childGender: string;
    childAge: number | null;
    location: string;
    profileCompleted?: boolean;
  };
  stats: {
    shortlistCount: number;
    pendingInterestsCount: number;
    connectionsCount: number;
    unreadMessagesCount: number;
    profileCompletionPercentage: number;
  };
  recommendedMatches: Array<{
    userId: number;
    fullName: string;
    gender: string;
    age: number | null;
    role: string;
    managedBy: string;
    familyType: string | null;
    bio: string | null;
    profilePhoto: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    education: string | null;
    occupation: string | null;
    religion: string | null;
  }>;
};

export default function ParentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistingId, setShortlistingId] = useState<number | null>(null);
  const [shortlistedSet, setShortlistedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) {
      router.replace("/login?mode=parent");
      return;
    }

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/parent/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("connectsoulmate_token");
          localStorage.removeItem("connectsoulmate_user");
          router.replace("/login?mode=parent");
          return;
        }

        const resData = await res.json();
        if (!res.ok || !resData.success) {
          // If the logged-in user is an individual account, redirect to individual dashboard
          if (res.status === 403) {
            router.replace("/dashboard");
            return;
          }
          throw new Error(resData.message || "Failed to load dashboard");
        }

        // Correctly extract dashboard data from response (supports both nested and root payload)
        const dashboardPayload: ParentDashboardData | null =
          resData.dashboard && resData.dashboard.parent
            ? resData.dashboard
            : resData.parent
            ? resData
            : null;

        if (!dashboardPayload || !dashboardPayload.parent) {
          throw new Error("Parent profile data could not be found.");
        }

        // If parent onboarding is not completed, redirect to onboarding
        if (dashboardPayload.parent.profileCompleted === false) {
          router.replace("/parent/onboarding");
          return;
        }

        setData(dashboardPayload);
      } catch (err: any) {
        console.error("Parent dashboard error:", err);
        setError(err.message || "Failed to load dashboard");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  async function handleToggleShortlist(targetUserId: number) {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token || shortlistingId !== null) return;

    setShortlistingId(targetUserId);
    try {
      const isAlready = shortlistedSet.has(targetUserId);
      const endpoint = `${API_URL}/api/shortlists/${targetUserId}`;
      const res = await fetch(endpoint, {
        method: isAlready ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setShortlistedSet((prev) => {
          const next = new Set(prev);
          if (isAlready) next.delete(targetUserId);
          else next.add(targetUserId);
          return next;
        });
      }
    } catch (err) {
      console.error("Shortlist toggle error:", err);
    } finally {
      setShortlistingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
          <p className="text-[var(--text-secondary)] text-xs">Loading Family Matrimonial Hub...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.parent) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
        <HeaderNav />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
          <h2 className="text-xl font-bold">Unable to load Family Hub</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {error || "Please ensure your parent profile setup is finalized."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-xs px-4 py-2"
            >
              Retry
            </button>
            <Link href="/parent/onboarding" className="btn-primary inline-flex text-xs px-5 py-2">
              Continue Profile Setup
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { parent, stats, recommendedMatches } = data;
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] transition-colors">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dynamic Welcome Hero Banner */}
        <div className="surface-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] border border-[var(--border)] shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Family Account</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                  <Users className="h-3.5 w-3.5" />
                  <span>Parent Mode</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                {timeGreeting}, <span className="text-gradient">{parent.parentName || parent.fullName || "Family"}</span>
              </h1>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Looking for a blessed and compatible life partner for your{" "}
                <span className="font-semibold text-[var(--text-primary)]">{parent.childRelationship}</span>,{" "}
                <span className="font-semibold text-[var(--brand-primary)]">{parent.childName}</span>
                {parent.childAge ? ` (${parent.childAge} yrs)` : ""}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/parent/search" className="btn-primary text-xs px-5 py-2.5 shadow-md flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                <span>Search Matches</span>
              </Link>

              <Link href="/parent/onboarding" className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Child Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Completeness Card */}
        <div className="surface-card p-5 border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Family Profile Completeness: {stats.profileCompletionPercentage}%
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Detailed family background and partner expectations increase mutual responses from suitable families by 3x.
            </p>
          </div>
          <div className="w-full md:w-64 space-y-1.5">
            <div className="h-2 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.profileCompletionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
              <span>Basic Info</span>
              <span>Preferences</span>
              <span>100% Ready</span>
            </div>
          </div>
        </div>

        {/* Activity Metric Cards (Family Tailored) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Interactive3DCard accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
            <Link
              href="/parent/interests"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Family Interests
                  </span>
                  <Heart className="h-5 w-5 text-[var(--brand-primary)] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--text-primary)]">{stats.pendingInterestsCount}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Pending inquiries received</p>
              </div>
              <span className="text-xs text-[var(--brand-primary)] font-medium mt-3 inline-flex items-center gap-1">
                Review inquiries <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(245, 158, 11, 0.3)" accentLight="rgba(234, 179, 8, 0.15)">
            <Link
              href="/parent/shortlist"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Saved Shortlist
                  </span>
                  <Star className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--text-primary)]">{stats.shortlistCount}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Profiles saved for discussion</p>
              </div>
              <span className="text-xs text-[var(--brand-primary)] font-medium mt-3 inline-flex items-center gap-1">
                View family shortlist <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(16, 185, 129, 0.3)" accentLight="rgba(5, 150, 105, 0.15)">
            <Link
              href="/parent/interests?tab=connections"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Connected Families
                  </span>
                  <Users className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-400">{stats.connectionsCount}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Mutual accepted connections</p>
              </div>
              <span className="text-xs text-emerald-400 font-medium mt-3 inline-flex items-center gap-1">
                View connections <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(168, 85, 247, 0.3)" accentLight="rgba(139, 92, 246, 0.15)">
            <Link
              href="/parent/messages"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Family Conversations
                  </span>
                  <MessageCircle className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-purple-400">{stats.unreadMessagesCount}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Unread family messages</p>
              </div>
              <span className="text-xs text-purple-400 font-medium mt-3 inline-flex items-center gap-1">
                Open messages <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>
        </div>

        {/* Recommended Matches Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Recommended Matches for {parent.childName}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Handpicked profiles matching your child&apos;s preferences and community background.
              </p>
            </div>
            <Link
              href="/parent/search"
              className="text-xs text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>View All Matches</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recommendedMatches.length === 0 ? (
            <div className="surface-card p-8 text-center space-y-3 border border-[var(--border)]">
              <Users className="h-8 w-8 text-[var(--text-muted)] mx-auto" />
              <h3 className="text-sm font-semibold">No matches found right now</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Adjust your partner preferences or explore full search filters to find compatible profiles.
              </p>
              <Link href="/parent/search" className="btn-primary text-xs px-4 py-2 inline-flex">
                Search Matrimonial Profiles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedMatches.map((match) => {
                const isShortlisted = shortlistedSet.has(match.userId);
                return (
                  <Interactive3DCard
                    key={match.userId}
                    accentGlow="rgba(224, 86, 123, 0.2)"
                    accentLight="rgba(244, 63, 94, 0.1)"
                  >
                    <div className="surface-card border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col justify-between h-full group hover:border-[var(--brand-primary)]/40 transition-colors">
                      {/* Photo & Managed By Badge */}
                      <div className="relative aspect-4/3 bg-[var(--surface-soft)] overflow-hidden">
                        {resolveProfileImageUrl(match.profilePhoto) ? (
                          <img
                            src={resolveProfileImageUrl(match.profilePhoto)!}
                            alt={match.fullName}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                            <Users className="h-10 w-10 stroke-[1.5]" />
                            <span className="text-xs">Photo Available on Request</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                            {match.managedBy}
                          </span>
                          {match.familyType && (
                            <span className="bg-[var(--brand-primary)]/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                              {match.familyType}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleShortlist(match.userId)}
                          disabled={shortlistingId === match.userId}
                          aria-label="Shortlist profile"
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-amber-400 hover:bg-black/80 transition-all"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isShortlisted
                                ? "fill-amber-400 text-amber-400"
                                : "text-white"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-serif font-bold text-base text-[var(--text-primary)] truncate">
                              {match.fullName}
                            </h3>
                            {match.age && (
                              <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                                {match.age} yrs
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                            {(match.occupation || match.education) && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Briefcase className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)]" />
                                <span className="truncate">{match.occupation || match.education}</span>
                              </div>
                            )}

                            {(match.city || match.state) && (
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <span className="truncate">
                                  {[match.city, match.state].filter(Boolean).join(", ")}
                                </span>
                              </div>
                            )}

                            {formatPreferenceDisplay(match.religion) && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                                <span className="truncate">{formatPreferenceDisplay(match.religion)}</span>
                              </div>
                            )}
                          </div>

                          {match.bio && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 italic pt-1 border-t border-[var(--border)]">
                              &ldquo;{match.bio}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                          <Link
                            href={`/parent/profile/${match.userId}`}
                            className="btn-primary text-xs w-full py-2 text-center flex items-center justify-center gap-1"
                          >
                            <span>View Full Profile</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Interactive3DCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Wedding Planning Services Banner (Family Focused) */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">💍</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Family Wedding Planning Services
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Venues, Catering & Decor For Your Family Celebration
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Discover verified convention halls, traditional catering feasts, grand mandap decorators, and wedding photographers for your child&apos;s special day.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all shrink-0"
          >
            <span>Explore Wedding Services</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Family Advisory & Guidance Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Interactive3DCard accentGlow="rgba(212, 175, 55, 0.35)" accentLight="rgba(212, 175, 55, 0.15)">
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Kundali Compatibility</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Evaluate traditional 36-Guna Ashta Koota Milan, planetary harmony, and doshas for your child and selected matches.
                </p>
              </div>
              <Link href="/kundali" className="mt-5 btn-secondary text-xs w-full text-center flex items-center justify-center gap-1.5">
                <span>Open Kundali Milan</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Family-to-Family Connect</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  When both families accept interest, engage in respectful discussions to align on expectations and traditions.
                </p>
              </div>
              <Link href="/parent/interests?tab=connections" className="mt-5 btn-secondary text-xs w-full text-center flex items-center justify-center gap-1.5">
                <span>View Connected Families</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(139, 92, 246, 0.3)" accentLight="rgba(168, 85, 247, 0.15)">
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Privacy & Verification</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Every parent profile is authenticated and verified. Contact details are safely shared only after mutual interest confirmation.
                </p>
              </div>
              <Link href="/parent/search" className="mt-5 btn-primary text-xs w-full text-center flex items-center justify-center gap-1.5">
                <span>Explore Verified Matches</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Interactive3DCard>
        </div>

        {/* Account Details Box */}
        <div className="surface-card p-6 border border-[var(--border)]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
            Family Profile Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Parent / Guardian</span>
              <span className="font-medium text-[var(--text-primary)] truncate block">{parent.parentName || parent.fullName || "Family"} ({parent.relationship})</span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Child Candidate</span>
              <span className="font-medium text-[var(--text-primary)] truncate block">{parent.childName} ({parent.childRelationship})</span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Candidate Age & Gender</span>
              <span className="font-medium text-[var(--text-primary)] capitalize">
                {parent.childAge ? `${parent.childAge} yrs, ` : ""}{parent.childGender}
              </span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Account Mode</span>
              <span className="font-bold text-emerald-400 capitalize flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Parent Mode Active
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
