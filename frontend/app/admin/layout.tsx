"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/layout/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  Crown,
  CreditCard,
  HeartHandshake,
  FileText,
  Activity,
  LogOut,
  ShieldCheck,
  Lock,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessErrorMsg, setAccessErrorMsg] = useState("");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("connectsoulmate_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    async function verifyAdmin() {
      try {
        const res = await fetch(`${API_URL}/api/admin/health`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("connectsoulmate_token");
          localStorage.removeItem("connectsoulmate_user");
          router.replace("/login");
          return;
        }

        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (isMounted) {
            setAccessDenied(true);
            setAccessErrorMsg(
              data.message || "Admin access required. Permission denied."
            );
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to verify administrator credentials");
        }

        // Fetch current user details if not already stored
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user && isMounted) {
            setAdminUser(userData.user);
            localStorage.setItem(
              "connectsoulmate_user",
              JSON.stringify(userData.user)
            );
          }
        }
      } catch (err: unknown) {
        console.error("Admin verification error:", err);
        if (isMounted) {
          setAccessDenied(true);
          setAccessErrorMsg(
            err instanceof Error ? err.message : "Unable to authorize admin session"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("connectsoulmate_token");
    localStorage.removeItem("connectsoulmate_user");
    router.replace("/login");
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Subscriptions",
      href: "/admin/subscriptions",
      icon: Crown,
    },
    {
      label: "Payments & Revenue",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      label: "Matrimony Activity",
      href: "/admin/activity",
      icon: HeartHandshake,
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-logs",
      icon: FileText,
    },
    {
      label: "System Health",
      href: "/admin/health",
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-500/30 border-t-purple-500" />
          <p className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
            Verifying administrator authorization...
          </p>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full surface-card p-8 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-rose-500">
              Access Restricted
            </h2>
            <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              {accessErrorMsg}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="btn-secondary text-xs px-5 py-2.5 inline-block font-semibold"
            >
              ← Return to User Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5"
              onClick={() => setMobileSidebarOpen(false)}
            >
              {/* ConnectSoulmate brand logo */}
              <Image
                src="/images/brand/connectsoulmate_logo.png"
                alt="ConnectSoulmate"
                width={140}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-400">
              <ShieldCheck className="h-3 w-3" /> Admin Console
            </span>
            <Link
              href="/dashboard"
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--brand-primary)] flex items-center gap-1 font-medium transition"
              title="Switch to member view"
            >
              Member View <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard" || pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-purple-400" : "text-[var(--text-muted)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-purple-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-soft)]/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                {adminUser?.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {adminUser?.fullName || "Administrator"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">
                  {adminUser?.email || "admin@connectsoulmate"}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile / Tablet Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-4 sm:px-6 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-soft)]"
              aria-label="Open sidebar navigation"
            >
              <Menu className="h-5 w-5 text-purple-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[var(--text-primary)]">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
