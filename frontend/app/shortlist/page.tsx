"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import {
  Star,
  Trash2,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ShortlistedProfile = {
  shortlistId: number;
  userId: number;
  fullName: string;
  gender: string;
  age: number | null;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  createdAt: string;
};

export default function ShortlistPage() {
  const router = useRouter();

  const [shortlists, setShortlists] = useState<ShortlistedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchShortlists() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/shortlists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("connectsoulmate_token");
          localStorage.removeItem("connectsoulmate_user");
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load shortlisted profiles");
        }

        setShortlists(data.shortlists || []);
      } catch (err: any) {
        setError(err.message || "Unable to load shortlist");
      } finally {
        setLoading(false);
      }
    }

    fetchShortlists();
  }, [router]);

  async function handleRemove(targetUserId: number) {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token || removingId) return;

    setRemovingId(targetUserId);

    try {
      const res = await fetch(`${API_URL}/api/shortlists/${targetUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to remove from shortlist");
        return;
      }

      setShortlists((prev) => prev.filter((item) => item.userId !== targetUserId));
    } catch (err) {
      alert("Network error. Could not remove profile.");
    } finally {
      setRemovingId(null);
    }
  }

  function getInitials(name: string) {
    if (!name) return "CS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function formatLocation(city: string | null, state: string | null) {
    const parts = [city, state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-400 fill-current" /> My Saved Shortlist
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Candidate profiles you have saved for quick access and review.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-soft)] px-3 py-1 rounded-full border border-[var(--border)]">
            {shortlists.length} {shortlists.length === 1 ? "Profile" : "Profiles"} Saved
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="surface-card p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--surface-soft)] shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--surface-soft)] rounded w-3/4"></div>
                    <div className="h-3 bg-[var(--surface-soft)] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-9 bg-[var(--surface-soft)] rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : shortlists.length === 0 ? (
          /* Empty State */
          <div className="surface-card p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-amber-400 mb-4 border border-[var(--border)]">
              <Star className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">No profiles shortlisted yet</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              When you find candidate profiles that align with your expectations, save them to your shortlist for easy reference.
            </p>
            <div className="pt-6">
              <Link
                href="/search"
                className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
              >
                <span>Discover Candidates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Shortlist Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shortlists.map((item) => (
              <Interactive3DCard key={item.shortlistId} accentGlow="rgba(245, 158, 11, 0.3)" accentLight="rgba(234, 179, 8, 0.15)">
                <div className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-primary)]/30 overflow-hidden bg-[var(--surface-soft)]">
                        {item.profilePhoto ? (
                          <img
                            src={`${API_URL}${item.profilePhoto}`}
                            alt={item.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[var(--brand-primary)]">
                            {getInitials(item.fullName)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-base font-bold text-[var(--text-primary)] truncate">
                          {item.fullName}
                        </h3>
                        <p className="text-xs text-[var(--brand-primary)] font-medium">
                          {item.age ? `${item.age} Yrs` : "Age N/A"} •{" "}
                          <span className="capitalize">{item.gender}</span>
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{formatLocation(item.city, item.state)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-[var(--text-secondary)] border-t border-[var(--border)] pt-3 mb-4">
                      {item.education && (
                        <p className="truncate flex items-center gap-1 text-[11px]">
                          <GraduationCap className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                          <span>{item.education}</span>
                        </p>
                      )}
                      {item.occupation && (
                        <p className="truncate flex items-center gap-1 text-[11px]">
                          <Briefcase className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                          <span>{item.occupation}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                    <Link
                      href={`/profile/${item.userId}`}
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.userId)}
                      disabled={removingId === item.userId}
                      className="btn-secondary text-xs py-2 text-rose-400 border-rose-500/30 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{removingId === item.userId ? "Removing..." : "Remove"}</span>
                    </button>
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
