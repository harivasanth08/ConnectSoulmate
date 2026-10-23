"use client";

import { useEffect, useState } from "react";
import {
  HeartHandshake,
  Heart,
  Star,
  MessageCircle,
  MessagesSquare,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ActivityData {
  interests: {
    total: number;
    accepted: number;
    pending: number;
    rejected: number;
    acceptanceRatePercent: number;
  };
  shortlists: {
    total: number;
  };
  messaging: {
    totalMessages: number;
    totalConversations: number;
  };
}

export default function AdminActivityPage() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger((v) => v + 1);
  };

  useEffect(() => {
    let ignore = false;
    async function loadActivity() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const resData = await res.json();
          if (!ignore && resData.success) {
            setData(resData);
          }
        }
      } catch (err) {
        console.error("Failed to load activity analytics:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadActivity();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Matrimony Platform Activity
            </h1>
            <span className="rounded-full bg-pink-500/15 border border-pink-500/30 px-2.5 py-0.5 text-[10px] font-bold text-pink-400">
              Engagement Metrics
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Member interactions, interest exchange velocity, match acceptance rates, and messaging volumes.
          </p>
        </div>

        <button
          onClick={handleReload}
          disabled={loading}
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Loading platform activity metrics...
        </div>
      ) : !data ? (
        <div className="surface-card p-8 text-center text-xs text-rose-400">
          Failed to fetch activity metrics.
        </div>
      ) : (
        <>
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between text-pink-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Total Interests Sent
                </span>
                <Heart className="h-4 w-4" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
                {data.interests.total.toLocaleString()}
              </p>
              <span className="text-[11px] text-[var(--text-muted)]">
                Proposals initiated
              </span>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between text-rose-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Mutual Matches
                </span>
                <HeartHandshake className="h-4 w-4" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-rose-400">
                {data.interests.accepted.toLocaleString()}
              </p>
              <span className="text-[11px] text-[var(--text-muted)]">
                Accepted interests
              </span>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Total Shortlists
                </span>
                <Star className="h-4 w-4" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-amber-400">
                {data.shortlists.total.toLocaleString()}
              </p>
              <span className="text-[11px] text-[var(--text-muted)]">
                Bookmarked profiles
              </span>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between text-purple-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Messages Exchanged
                </span>
                <MessageCircle className="h-4 w-4" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-purple-400">
                {data.messaging.totalMessages.toLocaleString()}
              </p>
              <span className="text-[11px] text-[var(--text-muted)]">
                Across {data.messaging.totalConversations} conversations
              </span>
            </div>
          </div>

          {/* Detailed Engagement Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interest Status Distribution */}
            <div className="surface-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Interest Conversion Funnel
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--text-secondary)]">Accepted (Match Created)</span>
                    <span className="font-bold text-emerald-400">
                      {data.interests.accepted} ({data.interests.total > 0 ? Math.round((data.interests.accepted / data.interests.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div
                      style={{
                        width: `${
                          data.interests.total > 0
                            ? (data.interests.accepted / data.interests.total) * 100
                            : 0
                        }%`,
                      }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--text-secondary)]">Pending Member Review</span>
                    <span className="font-bold text-amber-400">
                      {data.interests.pending} ({data.interests.total > 0 ? Math.round((data.interests.pending / data.interests.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div
                      style={{
                        width: `${
                          data.interests.total > 0
                            ? (data.interests.pending / data.interests.total) * 100
                            : 0
                        }%`,
                      }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--text-secondary)]">Declined / Rejected</span>
                    <span className="font-bold text-rose-400">
                      {data.interests.rejected} ({data.interests.total > 0 ? Math.round((data.interests.rejected / data.interests.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div
                      style={{
                        width: `${
                          data.interests.total > 0
                            ? (data.interests.rejected / data.interests.total) * 100
                            : 0
                        }%`,
                      }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Overall Match Acceptance Rate</span>
                <span className="font-extrabold text-base text-purple-400">
                  {data.interests.acceptanceRatePercent}%
                </span>
              </div>
            </div>

            {/* Direct Communication Metrics */}
            <div className="surface-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Direct Messaging Health
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[var(--surface-soft)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">
                      Active Dialogs
                    </span>
                    <span className="text-xl font-bold text-[var(--text-primary)]">
                      {data.messaging.totalConversations}
                    </span>
                  </div>
                  <MessagesSquare className="h-6 w-6 text-purple-400 opacity-60" />
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-soft)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">
                      Total Messages Delivered
                    </span>
                    <span className="text-xl font-bold text-purple-400">
                      {data.messaging.totalMessages}
                    </span>
                  </div>
                  <MessageCircle className="h-6 w-6 text-purple-400 opacity-60" />
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-soft)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">
                      Avg. Messages Per Conversation
                    </span>
                    <span className="text-xl font-bold text-pink-400">
                      {data.messaging.totalConversations > 0
                        ? (
                            data.messaging.totalMessages /
                            data.messaging.totalConversations
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  <TrendingUp className="h-6 w-6 text-pink-400 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
