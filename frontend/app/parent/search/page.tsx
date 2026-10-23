"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import Interactive3DCard from "@/components/ui/Interactive3DCard";
import { formatPreferenceDisplay, sanitizeAgeInput, resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  Search as SearchIcon,
  Filter,
  RotateCcw,
  MapPin,
  Briefcase,
  Heart,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ProfileCard = {
  userId: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: number | null;
  bio: string | null;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  education: string | null;
  occupation: string | null;
  heightCm: number | null;
  maritalStatus: string | null;
  religion: string | null;
  community: string | null;
  motherTongue: string | null;
  diet: string | null;
  role?: string;
  managedBy?: string;
  familyType?: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function CandidateCardImage({
  photoPath,
  fullName,
}: {
  photoPath: string | null | undefined;
  fullName: string;
}) {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveProfileImageUrl(photoPath);

  if (!resolvedUrl || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
        <Users className="h-10 w-10 stroke-[1.5]" />
        <span className="text-xs">Photo on Request</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={fullName}
      onError={() => setImgError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}

function ParentSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters State
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [minAge, setMinAge] = useState(searchParams.get("minAge") || "");
  const [maxAge, setMaxAge] = useState(searchParams.get("maxAge") || "");
  const [religion, setReligion] = useState(searchParams.get("religion") || "");
  const [motherTongue, setMotherTongue] = useState(searchParams.get("motherTongue") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [maritalStatus, setMaritalStatus] = useState(searchParams.get("maritalStatus") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Data & Loading States
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interest & Shortlist Tracking State
  const [sendingInterestId, setSendingInterestId] = useState<number | null>(null);
  const [sentInterestUserIds, setSentInterestUserIds] = useState<Record<number, string>>({});
  const [shortlistingId, setShortlistingId] = useState<number | null>(null);
  const [shortlistedSet, setShortlistedSet] = useState<Set<number>>(new Set());

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login?mode=parent");
      return;
    }

    // Load initial shortlists to highlight already shortlisted cards
    fetchShortlistIds();
    fetchProfiles();
  }, [token, searchParams, page]);

  useEffect(() => {
    setGender(searchParams.get("gender") || "");
    setMinAge(searchParams.get("minAge") || "");
    setMaxAge(searchParams.get("maxAge") || "");
    setReligion(searchParams.get("religion") || "");
    setMotherTongue(searchParams.get("motherTongue") || "");
    setLocation(searchParams.get("location") || "");
    setMaritalStatus(searchParams.get("maritalStatus") || "");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  async function fetchShortlistIds() {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/shortlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.shortlists) {
          const ids = new Set<number>(d.shortlists.map((s: { userId: number }) => s.userId));
          setShortlistedSet(ids);
        }
      }
    } catch (e) {
      console.error("Failed to load shortlists", e);
    }
  }

  async function fetchProfiles() {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();
      if (gender) query.set("gender", gender);
      if (minAge) query.set("minAge", minAge);
      if (maxAge) query.set("maxAge", maxAge);
      if (religion) query.set("religion", religion);
      if (motherTongue) query.set("motherTongue", motherTongue);
      if (location) query.set("location", location);
      if (maritalStatus) query.set("maritalStatus", maritalStatus);
      query.set("page", String(page));
      query.set("limit", "12");

      const response = await fetch(
        `${API_URL}/api/profile/search?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login?mode=parent");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to search profiles");
      }

      setProfiles(data.profiles || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profiles"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      alert("Minimum age cannot be greater than maximum age.");
      return;
    }

    setPage(1);

    const query = new URLSearchParams();
    if (gender) query.set("gender", gender);
    if (minAge) query.set("minAge", minAge);
    if (maxAge) query.set("maxAge", maxAge);
    if (religion) query.set("religion", religion);
    if (motherTongue) query.set("motherTongue", motherTongue);
    if (location) query.set("location", location);
    if (maritalStatus) query.set("maritalStatus", maritalStatus);
    query.set("page", "1");

    router.push(`/parent/search?${query.toString()}`);
  }

  function handleClearFilters() {
    setGender("");
    setMinAge("");
    setMaxAge("");
    setReligion("");
    setMotherTongue("");
    setLocation("");
    setMaritalStatus("");
    setPage(1);
    router.push("/parent/search");
  }

  async function handleSendInterest(targetUserId: number) {
    if (!token || sendingInterestId !== null) return;

    setSendingInterestId(targetUserId);

    try {
      const response = await fetch(`${API_URL}/api/interests/${targetUserId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setSentInterestUserIds((prev) => ({
          ...prev,
          [targetUserId]: data.message || "Unable to send interest",
        }));
        return;
      }

      setSentInterestUserIds((prev) => ({
        ...prev,
        [targetUserId]: "Interest Sent",
      }));
    } catch {
      setSentInterestUserIds((prev) => ({
        ...prev,
        [targetUserId]: "Failed to send interest",
      }));
    } finally {
      setSendingInterestId(null);
    }
  }

  async function handleToggleShortlist(targetUserId: number) {
    if (!token || shortlistingId !== null) return;

    setShortlistingId(targetUserId);
    const isAlready = shortlistedSet.has(targetUserId);

    try {
      const res = await fetch(`${API_URL}/api/shortlists/${targetUserId}`, {
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
      console.error("Shortlist error:", err);
    } finally {
      setShortlistingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="surface-card p-6 sm:p-8 border border-[var(--border)] relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                <Users className="h-3.5 w-3.5" />
                <span>Family Discovery Mode</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Find Compatible Matches for Your Child
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Filter verified matrimonial candidates by community, background, education, and family values.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/parent/shortlist" className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span>View Shortlist ({shortlistedSet.size})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="surface-card p-6 border border-[var(--border)] shadow-sm">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                <Filter className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Search Filters</span>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Looking for / Gender */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Looking For
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">Any Gender</option>
                  <option value="female">Bride (Female)</option>
                  <option value="male">Groom (Male)</option>
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Age Range
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAge}
                    onChange={(e) => setMinAge(sanitizeAgeInput(e.target.value))}
                    className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    min="18"
                    max="80"
                  />
                  <span className="text-[var(--text-muted)] text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAge}
                    onChange={(e) => setMaxAge(sanitizeAgeInput(e.target.value))}
                    className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    min="18"
                    max="80"
                  />
                </div>
              </div>

              {/* Religion */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Religion
                </label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Religions</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Jain">Jain</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Mother Tongue */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Mother Tongue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telugu, Hindi"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Marital Status
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">Any Status</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 shadow-md"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
          <span>
            {pagination ? `Showing ${profiles.length} of ${pagination.total} profiles` : "Searching profiles..."}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          )}
        </div>

        {/* Profiles Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Discovering compatible candidate profiles...</p>
          </div>
        ) : error ? (
          <div className="surface-card p-8 text-center text-rose-400 space-y-2 border border-rose-500/20">
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={fetchProfiles} className="btn-secondary text-xs px-4 py-2 mt-2">
              Try Again
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3 border border-[var(--border)]">
            <Users className="h-10 w-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="text-base font-bold">No candidate profiles found</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Try broadening your age, religion, or location criteria to see more matrimonial matches.
            </p>
            <button onClick={handleClearFilters} className="btn-secondary text-xs px-4 py-2 mt-2">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((p) => {
              const isShortlisted = shortlistedSet.has(p.userId);
              const interestState = sentInterestUserIds[p.userId];
              const isSendingInterest = sendingInterestId === p.userId;

              return (
                <Interactive3DCard
                  key={p.userId}
                  accentGlow="rgba(224, 86, 123, 0.2)"
                  accentLight="rgba(244, 63, 94, 0.1)"
                >
                  <div className="surface-card border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col justify-between h-full group hover:border-[var(--brand-primary)]/40 transition-colors">
                    {/* Candidate Photo */}
                    <div className="relative aspect-4/3 bg-[var(--surface-soft)] overflow-hidden">
                      <CandidateCardImage photoPath={p.profilePhoto} fullName={p.fullName} />

                      {/* Managed By Badge */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                          {p.managedBy || (p.role === "parent" ? "Managed by Family" : "Self")}
                        </span>
                        {p.familyType && (
                          <span className="bg-[var(--brand-primary)]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {p.familyType}
                          </span>
                        )}
                      </div>

                      {/* Shortlist Toggle Button */}
                      <button
                        onClick={() => handleToggleShortlist(p.userId)}
                        disabled={shortlistingId === p.userId}
                        aria-label="Shortlist profile"
                        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-amber-400 hover:bg-black/80 transition-all"
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

                    {/* Candidate Information */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] truncate">
                            {p.fullName}
                          </h3>
                          {p.age && (
                            <span className="text-xs text-[var(--text-secondary)] shrink-0 font-medium">
                              {p.age} yrs
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                          {(p.occupation || p.education) && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Briefcase className="h-3 w-3 shrink-0 text-[var(--brand-primary)]" />
                              <span className="truncate">{p.occupation || p.education}</span>
                            </div>
                          )}

                          {(p.city || p.state) && (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-amber-500" />
                              <span className="truncate">{[p.city, p.state].filter(Boolean).join(", ")}</span>
                            </div>
                          )}

                          {(formatPreferenceDisplay(p.religion) || formatPreferenceDisplay(p.community)) && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Sparkles className="h-3 w-3 shrink-0 text-purple-400" />
                              <span className="truncate">{[formatPreferenceDisplay(p.religion), formatPreferenceDisplay(p.community)].filter(Boolean).join(" • ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-[var(--border)] space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendInterest(p.userId)}
                            disabled={isSendingInterest || interestState === "Interest Sent"}
                            className={`flex-1 text-xs py-1.5 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                              interestState === "Interest Sent"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                : "btn-primary"
                            }`}
                          >
                            {interestState === "Interest Sent" ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Sent</span>
                              </>
                            ) : isSendingInterest ? (
                              <span>Sending...</span>
                            ) : (
                              <>
                                <Heart className="h-3 w-3" />
                                <span>Express Interest</span>
                              </>
                            )}
                          </button>
                        </div>

                        <Link
                          href={`/parent/profile/${p.userId}`}
                          className="btn-secondary text-[11px] w-full py-1.5 text-center flex items-center justify-center gap-1"
                        >
                          <span>Full Profile & Family Info</span>
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

        {/* Pagination Navigation */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => {
                const nextP = Math.max(page - 1, 1);
                setPage(nextP);
                const q = new URLSearchParams(searchParams.toString());
                q.set("page", String(nextP));
                router.push(`/parent/search?${q.toString()}`);
              }}
              disabled={page <= 1}
              className="surface-card p-2 rounded-xl border border-[var(--border)] disabled:opacity-40 hover:border-[var(--brand-primary)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs text-[var(--text-secondary)] px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => {
                const nextP = Math.min(page + 1, pagination.totalPages);
                setPage(nextP);
                const q = new URLSearchParams(searchParams.toString());
                q.set("page", String(nextP));
                router.push(`/parent/search?${q.toString()}`);
              }}
              disabled={page >= pagination.totalPages}
              className="surface-card p-2 rounded-xl border border-[var(--border)] disabled:opacity-40 hover:border-[var(--brand-primary)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ParentSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Loading search filters...</p>
          </div>
        </div>
      }
    >
      <ParentSearchContent />
    </Suspense>
  );
}
