"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  LayoutDashboard,
  Compass,
  Heart,
  Star,
  MessageCircle,
  Crown,
  User as UserIcon,
  ShieldCheck,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  CheckCheck,
  Mail,
  LifeBuoy,
  Sparkles,
  Gem,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber?: string;
  gender?: string;
  accountStatus?: string;
  role?: string;
  parentRelationship?: string | null;
  childProfile?: any;
  profilePhoto?: string | null;
};

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

function getNotificationTypeIcon(type: string) {
  switch (type) {
    case "interest_received":
    case "interest_accepted":
      return <Heart className="h-4 w-4 text-[var(--brand-primary)]" />;
    case "new_message":
      return <MessageCircle className="h-4 w-4 text-sky-400" />;
    case "shortlist":
      return <Star className="h-4 w-4 text-amber-400" />;
    case "subscription":
      return <Crown className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-[var(--brand-purple)]" />;
  }
}

export default function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [fetchingDropdownNotifs, setFetchingDropdownNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCounts = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("connectsoulmate_token") : null;
    if (!token) return;

    try {
      // Unread messages
      const msgRes = await fetch(`${API_URL}/api/messages/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgData = await msgRes.json();
      if (msgRes.ok && msgData.success) {
        setUnreadMsgCount(Number(msgData.unreadCount || 0));
      }

      // Unread notifications
      const notifRes = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifData = await notifRes.json();
      if (notifRes.ok && notifData.success) {
        setUnreadNotifCount(Number(notifData.unreadCount || 0));
      }
    } catch (err) {
      console.error("Failed to fetch header counts:", err);
    }
  }, []);

  const loadDropdownNotifications = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("connectsoulmate_token") : null;
    if (!token) return;
    setFetchingDropdownNotifs(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentNotifs(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch dropdown notifications:", err);
    } finally {
      setFetchingDropdownNotifs(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;

    const storedUser = localStorage.getItem("connectsoulmate_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    async function initUser() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("connectsoulmate_user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.error("Failed to load user profile in header:", err);
      }
    }

    initUser();
    fetchUnreadCounts();

    const intervalId = setInterval(fetchUnreadCounts, 20000);
    return () => clearInterval(intervalId);
  }, [fetchUnreadCounts]);

  // Click outside and Escape key handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => {
      if (!prev) setShowNotifDropdown(false);
      return !prev;
    });
  };

  const handleToggleNotifDropdown = () => {
    const nextState = !showNotifDropdown;
    if (nextState) setMenuOpen(false);
    setShowNotifDropdown(nextState);
    if (nextState) {
      loadDropdownNotifications();
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!notif.isRead && token) {
      try {
        await fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadNotifCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    setShowNotifDropdown(false);

    if (notif.type === "interest_received" || notif.type === "interest_accepted") {
      router.push("/interests");
    } else if (notif.type === "new_message") {
      router.push("/messages");
    } else if (notif.type === "shortlist") {
      if (notif.referenceId) router.push(`/profile/${notif.referenceId}`);
      else router.push("/shortlist");
    } else if (notif.type === "subscription") {
      router.push("/subscription");
    } else {
      router.push("/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecentNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotifCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  function handleLogout() {
    localStorage.removeItem("connectsoulmate_token");
    localStorage.removeItem("connectsoulmate_user");
    router.replace("/login");
  }

  const isParent = user?.role === "parent";
  const homeRoute = isParent ? "/parent/dashboard" : "/dashboard";
  const searchRoute = isParent ? "/parent/search" : "/search";
  const interestsRoute = isParent ? "/parent/interests" : "/interests";
  const shortlistRoute = isParent ? "/parent/shortlist" : "/shortlist";
  const messagesRoute = isParent ? "/parent/messages" : "/messages";
  const profileRoute = isParent ? "/parent/onboarding?step=2" : "/profile";

  const isLinkActive = (path: string) => pathname === path || (isParent && pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href={homeRoute} className="flex items-center shrink-0">
          <img
            src="/images/brand/connectsoulmate_logo.png"
            alt="ConnectSoulmate"
            className="h-8 sm:h-9 lg:h-10 w-auto object-contain max-w-[180px] sm:max-w-[210px]"
          />
          {isParent && (
            <span className="ml-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              Family Mode
            </span>
          )}
        </Link>

        {/* Header Right Controls: 🔔 Notifications | ☀ Theme Toggle | [☰ Menu ▼] | [Avatar] */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Notification Bell & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={handleToggleNotifDropdown}
              aria-label="In-App Notifications"
              title="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] transition-all hover:bg-[var(--surface-soft)]"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text-primary)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadNotifCount > 0 && (
                      <span className="rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-2 py-0.5 text-xs font-semibold">
                        {unreadNotifCount} unread
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[var(--brand-primary)] hover:underline font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {fetchingDropdownNotifs ? (
                    <p className="py-4 text-center text-xs text-[var(--text-muted)]">Loading notifications...</p>
                  ) : recentNotifs.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[var(--text-muted)]">No notifications yet.</p>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 rounded-xl cursor-pointer transition border flex items-start gap-3 ${
                          !n.isRead
                            ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/20"
                            : "bg-[var(--surface-soft)] border-transparent hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getNotificationTypeIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">{n.title}</h4>
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 border-t border-[var(--border)] pt-2 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. Theme Toggle */}
          <ThemeToggle />

          {/* 3. Menu Dropdown Button & Panel */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label="Toggle Navigation Menu"
              aria-expanded={menuOpen}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-soft)] hover:border-[var(--border-hover)] ${
                menuOpen ? "ring-2 ring-[var(--brand-primary)]/40 border-[var(--brand-primary)]/50 bg-[var(--surface-soft)]" : ""
              }`}
            >
              <Menu className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
              <span>Menu</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menu Dropdown Content */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 sm:w-64 max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-primary)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
                aria-orientation="vertical"
              >
                {user && (
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1.5">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {isParent ? "Signed in as Family" : "Signed in as"}
                    </p>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {user.fullName} {isParent && user.parentRelationship ? `(${user.parentRelationship})` : ""}
                    </p>
                  </div>
                )}

                <div className="space-y-0.5">
                  {/* 1. Dashboard */}
                  <Link
                    href={homeRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(homeRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-pink-400 shrink-0" />
                      <span>{isParent ? "Parent Dashboard" : "Dashboard"}</span>
                    </div>
                    {isLinkActive(homeRoute) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 2. Matches */}
                  <Link
                    href={searchRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(searchRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="h-4 w-4 text-sky-400 shrink-0" />
                      <span>{isParent ? "Discover Matches" : "Matches"}</span>
                    </div>
                    {isLinkActive(searchRoute) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 3. Interests */}
                  <Link
                    href={interestsRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(interestsRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Interests</span>
                    </div>
                    {isLinkActive(interestsRoute) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 4. Shortlist */}
                  <Link
                    href={shortlistRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(shortlistRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Star className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Shortlist</span>
                    </div>
                    {isLinkActive(shortlistRoute) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 5. Messages */}
                  <Link
                    href={messagesRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(messagesRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>Messages</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {unreadMsgCount > 0 && (
                        <span className="rounded-full bg-[var(--brand-primary)] px-1.5 py-0.2 text-[10px] font-bold text-white shadow-sm">
                          {unreadMsgCount}
                        </span>
                      )}
                      {isLinkActive(messagesRoute) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                      )}
                    </div>
                  </Link>

                  {/* 6. Kundali Matching */}
                  {!isParent && (
                    <Link
                      href="/kundali"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isLinkActive("/kundali")
                          ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-[var(--brand-gold)] shrink-0" />
                        <span>Kundali Matching</span>
                      </div>
                      {isLinkActive("/kundali") && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                      )}
                    </Link>
                  )}

                  {/* 7. Premium */}
                  <Link
                    href="/subscription"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive("/subscription")
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Premium</span>
                    </div>
                    {isLinkActive("/subscription") && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 8. Services */}
                  <Link
                    href="/services"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      pathname === "/services" || pathname.startsWith("/services/")
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gem className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{isParent ? "Wedding Services" : "Services"}</span>
                    </div>
                    {(pathname === "/services" || pathname.startsWith("/services/")) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 8. Profile */}
                  <Link
                    href={profileRoute}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive(profileRoute)
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{isParent ? "Child & Family Profile" : "My Profile"}</span>
                    </div>
                    {isLinkActive(profileRoute) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* Admin (Conditional) */}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        pathname?.startsWith("/admin")
                          ? "bg-purple-950/40 text-purple-300 border border-purple-500/40 font-bold"
                          : "text-purple-400 hover:bg-purple-950/30 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>Admin Console</span>
                      </div>
                      {pathname?.startsWith("/admin") && (
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                      )}
                    </Link>
                  )}

                  {/* Visual Divider */}
                  <div className="my-1 border-t border-[var(--border)]" />

                  {/* 8. Contact Us */}
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive("/contact")
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                      <span>Contact Us</span>
                    </div>
                    {isLinkActive("/contact") && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* 9. Support */}
                  <Link
                    href="/support"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isLinkActive("/support")
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LifeBuoy className="h-4 w-4 text-sky-400 shrink-0" />
                      <span>Support</span>
                    </div>
                    {isLinkActive("/support") && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    )}
                  </Link>

                  {/* Visual Divider */}
                  <div className="my-1 border-t border-[var(--border)]" />

                  {/* 10. Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. User Avatar Indicator */}
          <Link
            href="/profile"
            title={user?.fullName || "My Profile"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 font-bold text-xs text-white shadow-md shadow-pink-500/20 ring-2 ring-pink-500/30 hover:scale-105 transition shrink-0 overflow-hidden"
          >
            {resolveProfileImageUrl(user?.profilePhoto) ? (
              <img src={resolveProfileImageUrl(user?.profilePhoto)!} alt={user?.fullName || "User Avatar"} className="h-full w-full object-cover" />
            ) : (
              <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4 text-white" />}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

