"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import {
  Search as SearchIcon,
  Filter,
  RotateCcw,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";
import { formatPreferenceDisplay, sanitizeAgeInput } from "@/lib/formatPreferences";

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
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function SearchContent() {
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

  // Interest Tracking State
  const [sendingInterestId, setSendingInterestId] = useState<number | null>(null);
  const [sentInterestUserIds, setSentInterestUserIds] = useState<Record<number, string>>({});

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

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
        router.replace("/login");
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

    router.push(`/search?${query.toString()}`);
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
    router.push("/search");
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
        [targetUserId]: "Interest Sent ✓",
      }));
    } catch (err) {
      setSentInterestUserIds((prev) => ({
        ...prev,
        [targetUserId]: "Failed to send",
      }));
    } finally {
      setSendingInterestId(null);
    }
  }

  function formatLocation(p: ProfileCard) {
    const parts = [p.city, p.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  }

  function formatMaritalStatus(status: string | null) {
    if (!status) return null;
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function getInitials(name: string) {
    if (!name) return "CS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <>
      <HeaderNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="border-b border-[var(--border)] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Discover Matches
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Search candidate profiles aligned with your expectations and partner preferences.
          </p>
        </div>

        {/* Main Layout: Filters Sidebar + Results Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filter Panel Sidebar */}
          <aside className="h-fit surface-card p-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Filters</span>
              </h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            <form onSubmit={handleFilterSubmit} className="mt-4 space-y-4">
              {/* Gender */}
              <div>
                <label htmlFor="genderFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Looking For
                </label>
                <select
                  id="genderFilter"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Genders</option>
                  <option value="female">Woman (Female)</option>
                  <option value="male">Man (Male)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="minAgeFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Min Age
                  </label>
                  <input
                    id="minAgeFilter"
                    type="number"
                    min="18"
                    max="100"
                    value={minAge}
                    onChange={(e) => setMinAge(sanitizeAgeInput(e.target.value))}
                    placeholder="18"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="maxAgeFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Max Age
                  </label>
                  <input
                    id="maxAgeFilter"
                    type="number"
                    min="18"
                    max="100"
                    value={maxAge}
                    onChange={(e) => setMaxAge(sanitizeAgeInput(e.target.value))}
                    placeholder="60"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              {/* Religion */}
              <div>
                <label htmlFor="religionFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Religion
                </label>
                <select
                  id="religionFilter"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
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
                <label htmlFor="motherTongueFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Mother Tongue
                </label>
                <select
                  id="motherTongueFilter"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Languages</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="locationFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  City / Location
                </label>
                <input
                  id="locationFilter"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hyderabad, Bengaluru"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              {/* Marital Status */}
              <div>
                <label htmlFor="maritalStatusFilter" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Marital Status
                </label>
                <select
                  id="maritalStatusFilter"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Statuses</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 text-xs font-semibold mt-2"
              >
                Apply Search Filters
              </button>
            </form>
          </aside>

          {/* Results Column */}
          <section>
            {/* Results Bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {pagination ? `${pagination.total} Candidate Profiles Found` : "Profiles"}
              </h2>
              {pagination && (
                <span className="text-xs text-[var(--text-muted)]">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-xs text-red-300"
              >
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="surface-card p-4 space-y-4 animate-pulse"
                  >
                    <div className="aspect-[4/5] rounded-xl bg-[var(--surface-soft)]" />
                    <div className="h-4 w-3/4 rounded bg-[var(--surface-soft)]" />
                    <div className="h-3 w-1/2 rounded bg-[var(--surface-soft)]" />
                    <div className="h-9 rounded-lg bg-[var(--surface-soft)]" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && profiles.length === 0 && (
              <div className="surface-card p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--text-muted)]">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">
                  No profiles found matching your filters
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Try broadening your search parameters or clearing specific filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-6 btn-secondary text-xs px-5 py-2.5"
                >
                  Clear Search Filters
                </button>
              </div>
            )}

            {/* Profiles Grid */}
            {!loading && !error && profiles.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {profiles.map((p) => {
                  const interestState = sentInterestUserIds[p.userId];
                  const isInterestSent = interestState === "Interest Sent ✓";

                  return (
                    <Interactive3DCard key={p.userId} accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
                      <article className="group flex flex-col justify-between h-full">
                        <div>
                          {/* Photography Header: Aspect 4:5 with object-cover and zero distortion */}
                          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-soft)]">
                            {p.profilePhoto ? (
                              <img
                                src={`${API_URL}${p.profilePhoto}`}
                                alt={p.fullName}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--surface-soft)] to-[var(--surface)] text-[var(--text-primary)]">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold text-xl mb-2">
                                  {getInitials(p.fullName)}
                                </div>
                                <span className="text-[11px] text-[var(--text-muted)]">No Photo Uploaded</span>
                              </div>
                            )}

                            {/* Age & Gender Pill */}
                            <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white">
                              {p.age !== null ? `${p.age} yrs` : "Age N/A"} •{" "}
                              <span className="capitalize">{p.gender}</span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 space-y-2">
                            <h3 className="font-serif text-base font-bold text-[var(--text-primary)] truncate">
                              {p.fullName}
                            </h3>

                            <p className="text-xs text-[var(--brand-primary)] font-medium truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>{formatLocation(p)}</span>
                            </p>

                            {/* Attribute Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-[var(--text-secondary)]">
                              {formatPreferenceDisplay(p.religion) && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5">
                                  {formatPreferenceDisplay(p.religion)}
                                </span>
                              )}
                              {formatPreferenceDisplay(p.motherTongue) && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5">
                                  {formatPreferenceDisplay(p.motherTongue)}
                                </span>
                              )}
                              {p.maritalStatus && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5">
                                  {formatMaritalStatus(p.maritalStatus)}
                                </span>
                              )}
                              {p.education && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 truncate max-w-[150px] flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3 shrink-0" />
                                  <span>{p.education}</span>
                                </span>
                              )}
                              {p.occupation && (
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 truncate max-w-[150px] flex items-center gap-1">
                                  <Briefcase className="h-3 w-3 shrink-0" />
                                  <span>{p.occupation}</span>
                                </span>
                              )}
                            </div>

                            {/* Bio snippet */}
                            {p.bio && (
                              <p className="text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2 pt-1">
                                {p.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Action Controls */}
                        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                          <Link
                            href={`/profile/${p.userId}`}
                            className="btn-secondary text-xs text-center py-2 px-3 rounded-lg"
                          >
                            View Profile
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleSendInterest(p.userId)}
                            disabled={sendingInterestId === p.userId || isInterestSent}
                            className={`btn-primary text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 ${
                              isInterestSent ? "bg-emerald-600 text-white cursor-default" : ""
                            }`}
                          >
                            {sendingInterestId === p.userId ? (
                              "Sending..."
                            ) : isInterestSent ? (
                              <>
                                <Check className="h-3 w-3" /> Sent
                              </>
                            ) : (
                              <>
                                <Heart className="h-3 w-3" /> Interest
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    </Interactive3DCard>
                  );
                })}
              </div>
            )}

            {/* Pagination Bar */}
            {!loading && pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="btn-secondary text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <span className="text-xs text-[var(--text-muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="btn-secondary text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-xs text-[var(--text-muted)]">Loading search page...</p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
