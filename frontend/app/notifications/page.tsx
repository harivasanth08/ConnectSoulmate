"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  Bell,
  Heart,
  MessageCircle,
  Star,
  Crown,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
};

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "interest_received":
    case "interest_accepted":
      return <Heart className="h-4 w-4 text-[var(--brand-primary)]" />;
    case "new_message":
      return <MessageCircle className="h-4 w-4 text-purple-400" />;
    case "shortlist":
      return <Star className="h-4 w-4 text-amber-400" />;
    case "subscription":
      return <Crown className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-[var(--brand-purple)]" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadNotifications = useCallback(async (authToken: string, currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications?page=${currentPage}&limit=15`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadUnreadCount = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem("connectsoulmate_token");
    if (!authToken) {
      router.replace("/login");
      return;
    }
    setToken(authToken);
    loadNotifications(authToken, page);
    loadUnreadCount(authToken);
  }, [router, page, loadNotifications, loadUnreadCount]);

  const handleMarkRead = async (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (!token || notif.isRead || actionLoadingId === notif.id) return;
    setActionLoadingId(notif.id);

    try {
      const res = await fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.isRead && token) {
      fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    }

    if (notif.type === "interest_received" || notif.type === "interest_accepted") {
      router.push("/interests");
    } else if (notif.type === "new_message") {
      router.push("/messages");
    } else if (notif.type === "shortlist") {
      if (notif.referenceId) {
        router.push(`/profile/${notif.referenceId}`);
      } else {
        router.push("/shortlist");
      }
    } else if (notif.type === "subscription") {
      router.push("/subscription");
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Notifications
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Activity updates, interest requests, and messaging alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Mark all read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Notifications List Container */}
        <div className="surface-card p-6">
          {loading ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <p className="text-xs animate-pulse">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--text-muted)]">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No Notifications Yet</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                You are all caught up! Notifications regarding candidate profile views, interests, and messages will appear here.
              </p>
              <Link
                href="/search"
                className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
              >
                <span>Explore Candidate Profiles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <Interactive3DCard key={notif.id} onClick={() => handleNotificationClick(notif)}>
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition border flex items-start gap-4 ${
                      !notif.isRead
                        ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/15"
                        : "bg-[var(--surface-soft)] border-transparent hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <span>{notif.title}</span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)] shrink-0"></span>
                          )}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>

                    {!notif.isRead && (
                      <button
                        disabled={actionLoadingId === notif.id}
                        onClick={(e) => handleMarkRead(e, notif)}
                        className="btn-secondary text-[11px] px-2.5 py-1 shrink-0"
                        title="Mark as read"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border)] pt-4 mt-6">
              <span className="text-xs text-[var(--text-muted)]">
                Page {page} of {totalPages} ({total} total notifications)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-30"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
