"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Crown,
  CreditCard,
  HeartHandshake,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  UserPlus,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface DashboardData {
  kpi: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    premiumUsers: number;
    activeSubscriptions: number;
    totalMatches: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueThisYear: number;
  };
  demographics: {
    brides: number;
    grooms: number;
    parents: number;
    completedProfiles: number;
    incompleteProfiles: number;
  };
  activity: {
    totalInterests: number;
    interestsPending: number;
    interestsAccepted: number;
    interestsRejected: number;
    totalShortlists: number;
    totalMessages: number;
    totalConversations: number;
  };
  growthTimeline: { date: string; count: number }[];
  revenueTimeline: { date: string; revenue: number }[];
  recentUsers: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    gender: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [chartDays, setChartDays] = useState<7 | 30>(30);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const resData = await res.json();
        if (!ignore && resData.success) {
          setData(resData);
        } else if (!ignore) {
          throw new Error(resData.message || "Failed to load dashboard data");
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Dashboard fetch error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to fetch dashboard metrics"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const handleRefresh = () => {
    setError("");
    setRefreshing(true);
    setReloadTrigger((v) => v + 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-[var(--surface-soft)] rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-[var(--surface-soft)] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 surface-card p-4 animate-pulse bg-[var(--surface-soft)]/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="surface-card p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
          Failed to load Platform Analytics
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={handleRefresh}
          className="btn-primary text-xs px-4 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter growth timeline based on selected days
  const filteredGrowth =
    chartDays === 7
      ? data.growthTimeline.slice(-7)
      : data.growthTimeline.slice(-30);

  const maxGrowthCount = Math.max(...filteredGrowth.map((g) => g.count), 1);

  // Filter revenue timeline
  const filteredRevenue =
    chartDays === 7
      ? data.revenueTimeline.slice(-7)
      : data.revenueTimeline.slice(-30);

  const maxRevenueAmount = Math.max(
    ...filteredRevenue.map((r) => r.revenue),
    1
  );

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Platform Overview
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              Live Data
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Real-time platform activity, member registration trends, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-2 font-semibold disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
          </button>
        </div>
      </div>

      {/* Top 8 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Total Members
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
            {data.kpi.totalUsers.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Registered accounts</span>
            <span className="text-emerald-400 font-semibold">
              +{data.kpi.newUsersToday} today
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Active Users
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400">
            {data.kpi.activeUsers.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Verified & in good standing</span>
            <span>
              {data.kpi.totalUsers > 0
                ? `${Math.round((data.kpi.activeUsers / data.kpi.totalUsers) * 100)}%`
                : "0%"}
            </span>
          </div>
        </div>

        {/* New Users Today / Week */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              New This Week
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-sky-400">
            {data.kpi.newUsersThisWeek.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Last 7 days joined</span>
            <span className="text-[var(--text-secondary)]">
              {data.kpi.newUsersThisMonth} this month
            </span>
          </div>
        </div>

        {/* Verified Accounts */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
              Verified Accounts
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-teal-400">
            {data.kpi.verifiedUsers.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Email confirmed</span>
            <span className="text-amber-400">
              {data.kpi.unverifiedUsers} pending
            </span>
          </div>
        </div>

        {/* Premium Subscribers */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Premium Subscribers
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Crown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-400">
            {data.kpi.premiumUsers.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Paid members</span>
            <span>{data.kpi.activeSubscriptions} active subs</span>
          </div>
        </div>

        {/* Matches Made */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Matches Created
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-rose-400">
            {data.kpi.totalMatches.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Accepted interests</span>
            <span>{data.activity.totalInterests} sent total</span>
          </div>
        </div>

        {/* Total Platform Revenue */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400">
            ₹{data.kpi.totalRevenue.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>All-time captured</span>
            <span className="text-emerald-300 font-semibold">
              ₹{data.kpi.revenueThisMonth.toLocaleString("en-IN")} this mo
            </span>
          </div>
        </div>

        {/* Year Revenue */}
        <div className="surface-card p-5 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
              Revenue This Year
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-400">
            ₹{data.kpi.revenueThisYear.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Current calendar year</span>
            <span className="text-[var(--text-muted)]">Razorpay verified</span>
          </div>
        </div>
      </div>

      {/* Chart Section: User Growth & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Growth Chart */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                User Registration Growth
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Daily new member sign-ups from database
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold">
              <button
                onClick={() => setChartDays(7)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  chartDays === 7
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  chartDays === 30
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {filteredGrowth.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--text-muted)]">
              No registration records in this timeframe.
            </div>
          ) : (
            <div className="space-y-2 pt-4">
              <div className="h-48 flex items-end gap-1 sm:gap-2 border-b border-[var(--border)] pb-2">
                {filteredGrowth.map((item, idx) => {
                  const heightPercent = Math.max(
                    8,
                    Math.round((item.count / maxGrowthCount) * 100)
                  );
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap border border-purple-500/40">
                          {item.count} users ({item.date})
                        </div>
                        <div className="w-1.5 h-1.5 bg-black/90 rotate-45 -mt-0.5 border-r border-b border-purple-500/40" />
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-purple-600/40 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-400 transition-all duration-200"
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-1">
                <span>{filteredGrowth[0]?.date}</span>
                <span>
                  {filteredGrowth[Math.floor(filteredGrowth.length / 2)]?.date}
                </span>
                <span>{filteredGrowth[filteredGrowth.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Collection Chart */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Revenue Collection
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Daily successful captured payments (₹)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              ₹{data.kpi.totalRevenue.toLocaleString("en-IN")} Total
            </span>
          </div>

          {filteredRevenue.length === 0 ||
          filteredRevenue.every((r) => r.revenue === 0) ? (
            <div className="py-16 text-center space-y-2">
              <CreditCard className="h-8 w-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                No captured subscription transactions recorded yet.
              </p>
              <p className="text-[11px] text-[var(--text-muted)]/70">
                Revenue will appear here dynamically as members purchase plans.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-4">
              <div className="h-48 flex items-end gap-1 sm:gap-2 border-b border-[var(--border)] pb-2">
                {filteredRevenue.map((item, idx) => {
                  const heightPercent = Math.max(
                    8,
                    Math.round((item.revenue / maxRevenueAmount) * 100)
                  );
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap border border-emerald-500/40">
                          ₹{item.revenue.toLocaleString("en-IN")} ({item.date})
                        </div>
                        <div className="w-1.5 h-1.5 bg-black/90 rotate-45 -mt-0.5 border-r border-b border-emerald-500/40" />
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-emerald-600/40 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-200"
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-1">
                <span>{filteredRevenue[0]?.date}</span>
                <span>
                  {
                    filteredRevenue[Math.floor(filteredRevenue.length / 2)]
                      ?.date
                  }
                </span>
                <span>{filteredRevenue[filteredRevenue.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demographics & Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Member Demographics */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Demographic Distribution
          </h2>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Groom Profiles</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {data.demographics.grooms}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                <div
                  style={{
                    width: `${
                      data.kpi.totalUsers > 0
                        ? (data.demographics.grooms / data.kpi.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-sky-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Bride Profiles</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {data.demographics.brides}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                <div
                  style={{
                    width: `${
                      data.kpi.totalUsers > 0
                        ? (data.demographics.brides / data.kpi.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Parent Managed</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {data.demographics.parents}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                <div
                  style={{
                    width: `${
                      data.kpi.totalUsers > 0
                        ? (data.demographics.parents / data.kpi.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Status */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Profile Completion
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-soft)]">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">
                  Completed Profiles
                </span>
                <span className="text-base font-bold text-emerald-400">
                  {data.demographics.completedProfiles}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {data.kpi.totalUsers > 0
                  ? `${Math.round(
                      (data.demographics.completedProfiles /
                        data.kpi.totalUsers) *
                        100
                    )}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-soft)]">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">
                  Incomplete / In Onboarding
                </span>
                <span className="text-base font-bold text-amber-400">
                  {data.demographics.incompleteProfiles}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {data.kpi.totalUsers > 0
                  ? `${Math.round(
                      (data.demographics.incompleteProfiles /
                        data.kpi.totalUsers) *
                        100
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="surface-card p-6 space-y-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Administrative Modules
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] transition text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Search & Manage Members</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/admin/subscriptions"
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] transition text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-amber-400" />
                <span>Subscriptions & Plans</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] transition text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>Payments & Gateway Logs</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] transition text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="h-4 w-4 text-sky-400" />
                <span>Admin Audit Trail</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Recent Registrations
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Latest members who registered on ConnectSoulmate
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs text-[var(--brand-primary)] hover:underline font-semibold flex items-center gap-1"
          >
            View All Members →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Gender</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.recentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-xs text-[var(--text-muted)]"
                  >
                    No user registrations recorded yet.
                  </td>
                </tr>
              ) : (
                data.recentUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[var(--surface-soft)]/50 transition"
                  >
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                      #{u.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                      {u.fullName}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          u.role === "admin"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : u.role === "parent"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-[var(--text-muted)]">
                      {u.gender || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          u.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : u.status === "pending_verification"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)] text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
