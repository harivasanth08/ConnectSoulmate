"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import {
  Heart,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Briefcase,
  MapPin,
  ArrowRight,
  User,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type InterestUser = {
  id: number;
  fullName: string;
  email: string;
  gender: string;
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

export default function InterestsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
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
      router.replace("/login");
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
        router.replace("/login");
        return;
      }

      const recData = await recRes.json();
      const sentData = await sentRes.json();

      if (!recRes.ok || !recData.success) {
        throw new Error(recData.message || "Failed to load received interests");
      }
      if (!sentRes.ok || !sentData.success) {
        throw new Error(sentData.message || "Failed to load sent interests");
      }

      setReceivedInterests(recData.interests || []);
      setSentInterests(sentData.interests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load interests"
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
        message: "Interest request accepted!",
        type: "success",
      });
    } catch (err) {
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
        message: "Interest request declined.",
        type: "success",
      });
    } catch (err) {
      setActionFeedback({
        id: interestId,
        message: "Unable to connect to server. Please try again.",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  }

  function formatLocation(user: InterestUser) {
    const parts = [user.city, user.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  }

  function getInitials(name: string) {
    if (!name) return "CS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  const pendingReceivedCount = receivedInterests.filter(
    (i) => i.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Connection Requests & Interests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Review received connection inquiries and track sent member requests.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("received");
              setActionFeedback(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold text-xs sm:text-sm transition ${
              activeTab === "received"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Received Requests</span>
            {pendingReceivedCount > 0 && (
              <span className="rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sent");
              setActionFeedback(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold text-xs sm:text-sm transition ${
              activeTab === "sent"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Sent Requests</span>
            <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] border border-[var(--border)]">
              {sentInterests.length}
            </span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300"
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="surface-card p-6 flex items-center gap-4 animate-pulse"
              >
                <div className="h-16 w-16 rounded-full bg-[var(--surface-soft)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-[var(--surface-soft)]" />
                  <div className="h-3 w-1/4 rounded bg-[var(--surface-soft)]" />
                </div>
                <div className="h-9 w-24 rounded-lg bg-[var(--surface-soft)]" />
              </div>
            ))}
          </div>
        )}

        {/* Received Interests Content */}
        {!loading && !error && activeTab === "received" && (
          <section>
            {receivedInterests.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand-primary)]">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">
                  No connection requests yet
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  When other members express interest in your profile, their requests will appear here.
                </p>
                <Link
                  href="/search"
                  className="mt-6 btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
                >
                  <span>Explore Candidate Profiles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedInterests.map((item) => {
                  const u = item.user;
                  const isProcessing = processingId === item.id;
                  const feedback = actionFeedback?.id === item.id ? actionFeedback : null;

                  return (
                    <Interactive3DCard key={item.id} accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
                      <article className="p-5 sm:p-6 space-y-3 h-full">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Profile Info */}
                          <div className="flex items-center gap-4">
                            <Link href={`/profile/${u.id}`} className="shrink-0">
                              {u.profilePhoto ? (
                                <img
                                  src={`${API_URL}${u.profilePhoto}`}
                                  alt={u.fullName}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-[var(--brand-primary)]/30 hover:opacity-90 transition"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-purple)] text-white text-base font-bold shadow-sm">
                                  {getInitials(u.fullName)}
                                </div>
                              )}
                            </Link>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/profile/${u.id}`}
                                  className="font-serif text-base font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition"
                                >
                                  {u.fullName}
                                </Link>
                                <span className="text-xs text-[var(--text-muted)] capitalize">
                                  • {u.gender}
                                </span>
                              </div>

                              <p className="text-xs text-[var(--brand-primary)] font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{formatLocation(u)}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[var(--text-secondary)]">
                                {u.education && (
                                  <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 flex items-center gap-1 text-[11px]">
                                    <GraduationCap className="h-3 w-3 shrink-0" /> {u.education}
                                  </span>
                                )}
                                {u.occupation && (
                                  <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 flex items-center gap-1 text-[11px]">
                                    <Briefcase className="h-3 w-3 shrink-0" /> {u.occupation}
                                  </span>
                                )}
                                {item.createdAt && (
                                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Received {formatDate(item.createdAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="shrink-0 flex items-center gap-2">
                            {item.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAccept(item.id)}
                                  disabled={isProcessing}
                                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>{isProcessing ? "Processing..." : "Accept"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReject(item.id)}
                                  disabled={isProcessing}
                                  className="btn-secondary text-xs px-4 py-2 text-rose-400 border-rose-500/30 flex items-center gap-1"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Decline</span>
                                </button>
                              </>
                            ) : item.status === "accepted" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
                                Declined
                              </span>
                            )}

                            <Link
                              href={`/profile/${u.id}`}
                              className="btn-secondary text-xs px-3 py-2"
                            >
                              View
                            </Link>
                          </div>
                        </div>

                        {feedback && (
                          <div
                            className={`text-xs p-2.5 rounded-lg border ${
                              feedback.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                : "bg-red-500/10 border-red-500/20 text-red-300"
                            }`}
                          >
                            {feedback.message}
                          </div>
                        )}
                      </article>
                    </Interactive3DCard>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Sent Interests Content */}
        {!loading && !error && activeTab === "sent" && (
          <section>
            {sentInterests.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--text-muted)]">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">
                  You haven't sent any interest requests yet
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Browse candidate profiles and send interest requests to members you connect with.
                </p>
                <Link
                  href="/search"
                  className="mt-6 btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
                >
                  <span>Discover Candidate Profiles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInterests.map((item) => {
                  const u = item.user;

                  return (
                    <Interactive3DCard key={item.id} className="h-full">
                      <article className="surface-card p-5 sm:p-6 h-full">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Profile Info */}
                          <div className="flex items-center gap-4">
                            <Link href={`/profile/${u.id}`} className="shrink-0">
                              {u.profilePhoto ? (
                                <img
                                  src={`${API_URL}${u.profilePhoto}`}
                                  alt={u.fullName}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-[var(--brand-primary)]/30 hover:opacity-90 transition"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-purple)] text-white text-base font-bold shadow-sm">
                                  {getInitials(u.fullName)}
                                </div>
                              )}
                            </Link>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/profile/${u.id}`}
                                  className="font-serif text-base font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition"
                                >
                                  {u.fullName}
                                </Link>
                                <span className="text-xs text-[var(--text-muted)] capitalize">
                                  • {u.gender}
                                </span>
                              </div>

                              <p className="text-xs text-[var(--brand-primary)] font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{formatLocation(u)}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[var(--text-secondary)]">
                                {u.education && (
                                  <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 flex items-center gap-1 text-[11px]">
                                    <GraduationCap className="h-3 w-3 shrink-0" /> {u.education}
                                  </span>
                                )}
                                {u.occupation && (
                                  <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 flex items-center gap-1 text-[11px]">
                                    <Briefcase className="h-3 w-3 shrink-0" /> {u.occupation}
                                  </span>
                                )}
                                {item.createdAt && (
                                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Sent {formatDate(item.createdAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 flex items-center gap-2">
                            {item.status === "pending" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-500">
                                <Clock className="h-3.5 w-3.5" /> Pending Response
                              </span>
                            ) : item.status === "accepted" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-400">
                                <XCircle className="h-3.5 w-3.5" /> Declined
                              </span>
                            )}

                            <Link
                              href={`/profile/${u.id}`}
                              className="btn-secondary text-xs px-3 py-2"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </article>
                    </Interactive3DCard>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
