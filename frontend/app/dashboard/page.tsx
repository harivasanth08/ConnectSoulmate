"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import {
  Heart,
  Star,
  MessageCircle,
  Crown,
  Search,
  UserCheck,
  Brain,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  accountStatus: string;
  role?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick counters state
  const [shortlistCount, setShortlistCount] = useState(0);
  const [interestCount, setInterestCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("connectsoulmate_token");
          localStorage.removeItem("connectsoulmate_user");
          router.replace("/login");
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.role === "parent") {
            router.replace("/parent/dashboard");
            return;
          }
          if (data.user.profileCompleted === false) {
            router.replace("/onboarding");
            return;
          }
          setUser(data.user);
          localStorage.setItem("connectsoulmate_user", JSON.stringify(data.user));
        }

        // Fetch metrics in parallel
        try {
          const [shortlistRes, interestRes, msgRes] = await Promise.all([
            fetch(`${API_URL}/api/shortlists`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/api/interests/received`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/api/messages/conversations/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          if (shortlistRes.ok) {
            const d = await shortlistRes.json();
            if (d.success) setShortlistCount(d.shortlists?.length || 0);
          }

          if (interestRes.ok) {
            const d = await interestRes.json();
            if (d.success) setInterestCount(d.interests?.length || 0);
          }

          if (msgRes.ok) {
            const d = await msgRes.json();
            if (d.success) setUnreadMsgCount(Number(d.unreadCount || 0));
          }
        } catch (metricErr) {
          console.error("Dashboard metric fetch error:", metricErr);
        }
      } catch (err) {
        console.error("Failed to load dashboard user:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
          <p className="text-[var(--text-secondary)] text-xs">Loading your matrimonial hub...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Determine time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] transition-colors">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dynamic Welcome Hero Banner */}
        <div className="surface-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] border border-[var(--border)] shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Account</span>
              </div>

              {/* Dynamic User Name Greeting */}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                {timeGreeting}, <span className="text-gradient">{user.fullName}</span>
              </h1>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Your personal matrimonial hub. Discover compatible profiles, review incoming interests, and explore AI-generated compatibility insights.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/search" className="btn-primary text-xs px-5 py-2.5 shadow-md">
                <Search className="h-3.5 w-3.5" />
                <span>Explore Matches</span>
              </Link>

              <Link href="/profile" className="btn-secondary text-xs px-4 py-2.5">
                Edit My Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Interactive3DCard accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
            <Link
              href="/interests"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Interests Received
                  </span>
                  <Heart className="h-5 w-5 text-[var(--brand-primary)] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--text-primary)]">{interestCount}</p>
              </div>
              <span className="text-xs text-[var(--brand-primary)] font-medium mt-3 inline-flex items-center gap-1">
                Manage requests <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(245, 158, 11, 0.3)" accentLight="rgba(234, 179, 8, 0.15)">
            <Link
              href="/shortlist"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Saved Shortlist
                  </span>
                  <Star className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--text-primary)]">{shortlistCount}</p>
              </div>
              <span className="text-xs text-[var(--brand-primary)] font-medium mt-3 inline-flex items-center gap-1">
                View saved profiles <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(168, 85, 247, 0.3)" accentLight="rgba(139, 92, 246, 0.15)">
            <Link
              href="/messages"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Unread Messages
                  </span>
                  <MessageCircle className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--brand-primary)]">{unreadMsgCount}</p>
              </div>
              <span className="text-xs text-[var(--brand-primary)] font-medium mt-3 inline-flex items-center gap-1">
                Open conversations <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>

          <Interactive3DCard accentGlow="rgba(245, 158, 11, 0.3)" accentLight="rgba(234, 179, 8, 0.15)">
            <Link
              href="/subscription"
              className="p-5 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    Membership Tier
                  </span>
                  <Crown className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)] capitalize">Active Member</p>
              </div>
              <span className="text-xs text-amber-500 font-medium mt-3 inline-flex items-center gap-1">
                Explore plans <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </Interactive3DCard>
        </div>

        {/* Wedding Services Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--wedding-banner-border)] bg-[var(--wedding-banner-bg)] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[var(--wedding-banner-shadow)] transition-all">
          {/* Subtle Decorative Accents (non-intrusive, right side) */}
          <div
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-4 text-[var(--wedding-banner-decor)] select-none"
            aria-hidden="true"
          >
            {/* Ring Illustration */}
            <svg className="h-24 w-24 stroke-current fill-none" viewBox="0 0 100 100">
              <circle cx="50" cy="56" r="26" strokeWidth="3" strokeLinecap="round" />
              <polygon points="50,16 62,28 38,28" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="50,16 38,28 44,34 56,34 62,28" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {/* Small floating hearts & sparkle shapes */}
            <div className="flex flex-col gap-3">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <svg className="h-3.5 w-3.5 fill-current ml-2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <svg className="h-3 w-3 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4h7.6l-6.1 4.5 2.3 7.1-6.2-4.5-6.2 4.5 2.3-7.1-6.1-4.5h7.6z" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="Wedding Ring">💍</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--wedding-banner-eyebrow)]">
                Wedding Celebration Planning
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--wedding-banner-text)]">
              Discover Trusted Wedding Services
            </h3>
            <p className="text-xs text-[var(--wedding-banner-subtext)] leading-relaxed">
              Explore top-rated wedding photographers, luxury banquet halls, gourmet catering, and bridal stylists for your special day.
            </p>
          </div>
          <Link
            href="/services"
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all shrink-0"
          >
            <span>Explore Services</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Feature Cards Section */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-4">
            Matrimonial Features & Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Kundali Matching */}
            <Interactive3DCard accentGlow="rgba(212, 175, 55, 0.35)" accentLight="rgba(212, 175, 55, 0.15)">
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold)]/20 text-[var(--brand-gold)]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      Kundali Matching
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Compare birth details with traditional 36-Guna Ashta Koota Milan, planetary alignment, and dosha assessments.
                  </p>
                </div>
                <Link href="/kundali" className="mt-6 btn-primary text-xs w-full text-center flex items-center justify-center gap-1.5">
                  <span>Match Kundali</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Interactive3DCard>
            {/* Card 1: AI Matchmaker Advisory */}
            <Interactive3DCard accentGlow="rgba(139, 92, 246, 0.3)" accentLight="rgba(168, 85, 247, 0.15)">
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-purple)]/15 text-[var(--brand-purple)]">
                      <Brain className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      AI Matchmaker Advisory
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Evaluate alignment across personality traits, lifestyle choices, education, and values with candidate profiles via local AI.
                  </p>
                </div>
                <Link href="/search" className="mt-6 btn-secondary-brand text-xs w-full text-center">
                  Search & Test Compatibility
                </Link>
              </div>
            </Interactive3DCard>

            {/* Card 2: Profile Details */}
            <Interactive3DCard accentGlow="rgba(224, 86, 123, 0.3)" accentLight="rgba(244, 63, 94, 0.15)">
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      Profile Completeness
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Ensure your family background, lifestyle choices, and partner preferences are updated for higher mutual response rates.
                  </p>
                </div>
                <Link href="/profile" className="mt-6 btn-secondary-brand text-xs w-full text-center">
                  Update Profile Details
                </Link>
              </div>
            </Interactive3DCard>

            {/* Card 3: Premium Benefits */}
            <Interactive3DCard accentGlow="rgba(245, 158, 11, 0.3)" accentLight="rgba(234, 179, 8, 0.15)">
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                      <Crown className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      Premium Membership
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Unlock direct matched messaging, priority search visibility, and unlimited interest requests.
                  </p>
                </div>
                <Link href="/subscription" className="mt-6 btn-primary text-xs w-full text-center">
                  View Membership Plans
                </Link>
              </div>
            </Interactive3DCard>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="surface-card p-6">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
            Account Profile Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Email Address</span>
              <span className="font-medium text-[var(--text-primary)] truncate block">{user.email}</span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Mobile Number</span>
              <span className="font-medium text-[var(--text-primary)]">{user.mobileNumber || "—"}</span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Gender</span>
              <span className="font-medium text-[var(--text-primary)] capitalize">{user.gender}</span>
            </div>

            <div className="surface-panel p-4">
              <span className="text-[var(--text-muted)] block mb-1">Account Status</span>
              <span className="font-bold text-emerald-400 capitalize flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}