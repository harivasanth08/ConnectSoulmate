"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  Heart,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  MapPin,
  ArrowRight,
  Users,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type InterestUser = {
  id: number;
  fullName: string;
  email: string;
  gender: string;
  age?: number | null;
  role?: string;
  managedBy?: string;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
};

type InterestItem = {
  id: number;
  senderUserId: number;
  receiverUserId: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  user: InterestUser;
};

function ParentInterestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "connections" ? "connections" : (searchParams.get("tab") === "sent" ? "sent" : "received");

  const [activeTab, setActiveTab] = useState<"received" | "sent" | "connections">(initialTab);
  const [receivedInterests, setReceivedInterests] = useState<InterestItem[]>([]);
  const [sentInterests, setSentInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: number;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login?mode=parent");
      return;
    }

    loadInterests();
  }, [token, router]);

  async function loadInterests() {
    setLoading(true);
    setError("");

    try {
      const [recRes, sentRes] = await Promise.all([
        fetch(`${API_URL}/api/interests/received`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/interests/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (recRes.status === 401 || sentRes.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login?mode=parent");
        return;
      }

      const recData = await recRes.json();
      const sentData = await sentRes.json();

      if (!recRes.ok || !recData.success) {
        throw new Error(recData.message || "Failed to load received inquiries");
      }
      if (!sentRes.ok || !sentData.success) {
        throw new Error(sentData.message || "Failed to load sent inquiries");
      }

      setReceivedInterests(recData.interests || []);
      setSentInterests(sentData.interests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load family interests"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(interestId: number) {
    if (!token || processingId !== null) return;
    setProcessingId(interestId);
    setActionFeedback(null);

    try {
      const res = await fetch(`${API_URL}/api/interests/${interestId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionFeedback({
          id: interestId,
          message: data.message || "Failed to accept interest",
          type: "error",
        });
        return;
      }

      setReceivedInterests((prev) =>
        prev.map((item) =>
          item.id === interestId ? { ...item, status: "accepted" } : item
        )
      );

      setActionFeedback({
        id: interestId,
        message: "Family interest accepted! You can now start conversations.",
        type: "success",
      });
    } catch {
      setActionFeedback({
        id: interestId,
        message: "Unable to connect to server. Please try again.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(interestId: number) {
    if (!token || processingId !== null) return;
    setProcessingId(interestId);
    setActionFeedback(null);

    try {
      const res = await fetch(`${API_URL}/api/interests/${interestId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionFeedback({
          id: interestId,
          message: data.message || "Failed to decline interest",
          type: "error",
        });
        return;
      }

      setReceivedInterests((prev) =>
        prev.map((item) =>
          item.id === interestId ? { ...item, status: "rejected" } : item
        )
      );

      setActionFeedback({
        id: interestId,
        message: "Family interest politely declined.",
        type: "success",
      });
    } catch {
      setActionFeedback({
        id: interestId,
        message: "Unable to connect to server. Please try again.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  }

  // Deduce Connected Families (Mutual Accepted from either sent or received)
  const connectedInterests = [
    ...receivedInterests.filter((i) => i.status === "accepted"),
    ...sentInterests.filter((i) => i.status === "accepted"),
  ];

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="surface-card p-6 sm:p-8 border border-[var(--border)] relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                <Users className="h-3.5 w-3.5" />
                <span>Family Inquiries & Connections</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Manage Matrimonial Interests
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Review inquiries received from prospective families, track sent interests, and connect with mutually interested parties.
              </p>
            </div>

            <Link
              href="/parent/search"
              className="btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5 shrink-0 shadow-md"
            >
              <span>Explore Candidates</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("received")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "received"
                ? "bg-[var(--brand-primary)] text-white shadow-md"
                : "surface-card border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Inquiries Received ({receivedInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "sent"
                ? "bg-[var(--brand-primary)] text-white shadow-md"
                : "surface-card border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Interests Sent ({sentInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("connections")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "connections"
                ? "bg-emerald-500 text-white shadow-md"
                : "surface-card border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Connected Families ({connectedInterests.length})</span>
          </button>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Loading inquiries...</p>
          </div>
        ) : error ? (
          <div className="surface-card p-8 text-center text-rose-400 space-y-2 border border-rose-500/20">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <div>
            {/* TAB 1: INQUIRIES RECEIVED */}
            {activeTab === "received" && (
              receivedInterests.length === 0 ? (
                <div className="surface-card p-12 text-center space-y-3 border border-[var(--border)]">
                  <Heart className="h-10 w-10 text-[var(--text-muted)] mx-auto" />
                  <h3 className="text-base font-bold">No incoming inquiries yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    When prospective families find your child&apos;s profile suitable, their requests will appear here for your review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {receivedInterests.map((item) => (
                    <Interactive3DCard
                      key={item.id}
                      accentGlow="rgba(224, 86, 123, 0.25)"
                      accentLight="rgba(244, 63, 94, 0.1)"
                    >
                      <div className="surface-card border border-[var(--border)] rounded-2xl overflow-hidden p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-[var(--surface-soft)] overflow-hidden shrink-0 border border-[var(--border)]">
                            {resolveProfileImageUrl(item.user.profilePhoto) ? (
                              <img
                                src={resolveProfileImageUrl(item.user.profilePhoto)!}
                                alt={item.user.fullName}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
                                <Users className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] bg-black/60 text-white font-semibold px-2 py-0.5 rounded-full">
                                {item.user.managedBy || "Managed by Family"}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] truncate">
                              {item.user.fullName}
                              {item.user.age ? `, ${item.user.age} yrs` : ""}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {item.user.occupation || item.user.education || "Candidate"}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-500" />
                              {[item.user.city, item.user.state].filter(Boolean).join(", ") || "Location on profile"}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--border)]">
                          <span className="text-[var(--text-muted)] text-[11px]">
                            Received on {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] capitalize ${
                              item.status === "accepted"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : item.status === "rejected"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {actionFeedback?.id === item.id && (
                          <p
                            className={`text-xs font-medium ${
                              actionFeedback.type === "success"
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {actionFeedback.message}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2 pt-2">
                          {item.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAccept(item.id)}
                                disabled={processingId === item.id}
                                className="btn-primary text-xs flex-1 py-1.5 flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Accept Interest</span>
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={processingId === item.id}
                                className="surface-panel text-xs py-1.5 px-3 rounded-xl hover:text-rose-400 transition-colors border border-[var(--border)]"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {item.status === "accepted" && (
                            <Link
                              href={`/parent/messages?userId=${item.user.id}`}
                              className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Message Family</span>
                            </Link>
                          )}

                          <Link
                            href={`/parent/profile/${item.user.id}`}
                            className="btn-secondary text-[11px] w-full py-1.5 text-center flex items-center justify-center gap-1"
                          >
                            <span>View Full Profile</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </Interactive3DCard>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: INTERESTS SENT */}
            {activeTab === "sent" && (
              sentInterests.length === 0 ? (
                <div className="surface-card p-12 text-center space-y-3 border border-[var(--border)]">
                  <Send className="h-10 w-10 text-[var(--text-muted)] mx-auto" />
                  <h3 className="text-base font-bold">No interests sent yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    Browse profiles for your child and click &ldquo;Express Interest&rdquo; to reach out to families.
                  </p>
                  <Link href="/parent/search" className="btn-primary text-xs px-5 py-2.5 inline-flex mt-2">
                    Discover Matches
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sentInterests.map((item) => (
                    <Interactive3DCard
                      key={item.id}
                      accentGlow="rgba(168, 85, 247, 0.25)"
                      accentLight="rgba(139, 92, 246, 0.1)"
                    >
                      <div className="surface-card border border-[var(--border)] rounded-2xl overflow-hidden p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-[var(--surface-soft)] overflow-hidden shrink-0 border border-[var(--border)]">
                            {resolveProfileImageUrl(item.user.profilePhoto) ? (
                              <img
                                src={resolveProfileImageUrl(item.user.profilePhoto)!}
                                alt={item.user.fullName}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
                                <Users className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] bg-black/60 text-white font-semibold px-2 py-0.5 rounded-full">
                                {item.user.managedBy || "Managed by Family"}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] truncate">
                              {item.user.fullName}
                              {item.user.age ? `, ${item.user.age} yrs` : ""}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {item.user.occupation || item.user.education || "Candidate"}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-500" />
                              {[item.user.city, item.user.state].filter(Boolean).join(", ") || "Location on profile"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--border)]">
                          <span className="text-[var(--text-muted)] text-[11px]">
                            Sent on {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] capitalize ${
                              item.status === "accepted"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : item.status === "rejected"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="space-y-2 pt-2">
                          {item.status === "accepted" ? (
                            <Link
                              href={`/parent/messages?userId=${item.user.id}`}
                              className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Message Family</span>
                            </Link>
                          ) : (
                            <div className="text-[11px] text-[var(--text-muted)] text-center py-1">
                              Awaiting family response
                            </div>
                          )}

                          <Link
                            href={`/parent/profile/${item.user.id}`}
                            className="btn-secondary text-[11px] w-full py-1.5 text-center flex items-center justify-center gap-1"
                          >
                            <span>View Full Profile</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </Interactive3DCard>
                  ))}
                </div>
              )
            )}

            {/* TAB 3: CONNECTED FAMILIES */}
            {activeTab === "connections" && (
              connectedInterests.length === 0 ? (
                <div className="surface-card p-12 text-center space-y-3 border border-[var(--border)]">
                  <CheckCircle2 className="h-10 w-10 text-[var(--text-muted)] mx-auto" />
                  <h3 className="text-base font-bold">No connected families yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    Once both you and another family accept mutual interest, your connection is verified here and messaging is unlocked.
                  </p>
                  <Link href="/parent/search" className="btn-primary text-xs px-5 py-2.5 inline-flex mt-2">
                    Search Profiles
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectedInterests.map((item) => (
                    <Interactive3DCard
                      key={`conn-${item.id}`}
                      accentGlow="rgba(16, 185, 129, 0.3)"
                      accentLight="rgba(5, 150, 105, 0.15)"
                    >
                      <div className="surface-card border border-emerald-500/30 rounded-2xl overflow-hidden p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-[var(--surface-soft)] overflow-hidden shrink-0 border border-emerald-500/20">
                            {resolveProfileImageUrl(item.user.profilePhoto) ? (
                              <img
                                src={resolveProfileImageUrl(item.user.profilePhoto)!}
                                alt={item.user.fullName}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
                                <Users className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Mutual Connected Family</span>
                            </span>
                            <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] truncate">
                              {item.user.fullName}
                              {item.user.age ? `, ${item.user.age} yrs` : ""}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {item.user.occupation || item.user.education || "Candidate"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                          <Link
                            href={`/parent/messages?userId=${item.user.id}`}
                            className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Open Family Conversation</span>
                          </Link>

                          <Link
                            href={`/parent/profile/${item.user.id}`}
                            className="btn-secondary text-[11px] w-full py-1.5 text-center flex items-center justify-center gap-1"
                          >
                            <span>Review Full Family Profile</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </Interactive3DCard>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ParentInterestsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Loading interests...</p>
          </div>
        </div>
      }
    >
      <ParentInterestsContent />
    </Suspense>
  );
}
