"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  Star,
  Trash2,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Users,
  Heart,
  Check,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ShortlistedProfile = {
  shortlistId: number;
  userId: number;
  fullName: string;
  gender: string;
  age: number | null;
  role?: string;
  managedBy?: string;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  createdAt: string;
};

export default function ParentShortlistPage() {
  const router = useRouter();

  const [shortlists, setShortlists] = useState<ShortlistedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [sendingInterestId, setSendingInterestId] = useState<number | null>(null);
  const [sentInterests, setSentInterests] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");

    if (!token) {
      router.replace("/login?mode=parent");
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
          router.replace("/login?mode=parent");
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
        throw new Error(data.message || "Failed to remove profile");
      }

      setShortlists((prev) => prev.filter((p) => p.userId !== targetUserId));
    } catch (err: any) {
      alert(err.message || "Unable to remove profile from shortlist");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleExpressInterest(targetUserId: number) {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token || sendingInterestId !== null) return;

    setSendingInterestId(targetUserId);
    try {
      const res = await fetch(`${API_URL}/api/interests/${targetUserId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSentInterests((prev) => ({ ...prev, [targetUserId]: true }));
      }
    } catch (err) {
      console.error("Failed to send interest:", err);
    } finally {
      setSendingInterestId(null);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="surface-card p-6 sm:p-8 border border-[var(--border)] relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span>Family Shortlist</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Candidates Saved for Family Review
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Review candidate profiles shortlisted for your child. Discuss with your family and send interest requests when ready.
              </p>
            </div>

            <Link
              href="/parent/search"
              className="btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5 shrink-0 shadow-md"
            >
              <span>Explore More Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Loading family shortlist...</p>
          </div>
        ) : error ? (
          <div className="surface-card p-8 text-center text-rose-400 space-y-2 border border-rose-500/20">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : shortlists.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3 border border-[var(--border)]">
            <Star className="h-10 w-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="text-base font-bold">No candidates shortlisted yet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              While searching matrimonial profiles, click the star icon on any card to save it here for family discussions.
            </p>
            <Link href="/parent/search" className="btn-primary text-xs px-5 py-2.5 inline-flex mt-2">
              Browse Matches for Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shortlists.map((p) => {
              const isInterestSent = sentInterests[p.userId];
              const isSending = sendingInterestId === p.userId;
              const isRemoving = removingId === p.userId;

              return (
                <Interactive3DCard
                  key={p.shortlistId}
                  accentGlow="rgba(245, 158, 11, 0.25)"
                  accentLight="rgba(234, 179, 8, 0.1)"
                >
                  <div className="surface-card border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col justify-between h-full group hover:border-amber-400/40 transition-colors">
                    {/* Photo */}
                    <div className="relative aspect-4/3 bg-[var(--surface-soft)] overflow-hidden">
                      {resolveProfileImageUrl(p.profilePhoto) ? (
                        <img
                          src={resolveProfileImageUrl(p.profilePhoto)!}
                          alt={p.fullName}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                          <Users className="h-10 w-10 stroke-[1.5]" />
                          <span className="text-xs">Photo on Request</span>
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                          {p.managedBy || "Managed by Family"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(p.userId)}
                        disabled={isRemoving}
                        aria-label="Remove from shortlist"
                        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-rose-400 hover:bg-black/80 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Content */}
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
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[var(--border)] space-y-2">
                        <button
                          onClick={() => handleExpressInterest(p.userId)}
                          disabled={isInterestSent || isSending}
                          className={`w-full text-xs py-1.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                            isInterestSent
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                              : "btn-primary"
                          }`}
                        >
                          {isInterestSent ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Interest Expressed</span>
                            </>
                          ) : isSending ? (
                            <span>Sending...</span>
                          ) : (
                            <>
                              <Heart className="h-3 w-3" />
                              <span>Express Family Interest</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/parent/profile/${p.userId}`}
                          className="btn-secondary text-[11px] w-full py-1.5 text-center flex items-center justify-center gap-1"
                        >
                          <span>Profile & Family Info</span>
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
      </main>
    </div>
  );
}
