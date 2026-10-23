"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Search,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SubItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  priceRupees: number;
  currency: string;
  status: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

interface SubscriptionsData {
  kpi: {
    totalSubscribers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    freeUsers: number;
    paidConversionRate: string | number;
  };
  planPopularity: {
    id: string;
    name: string;
    priceRupees: number;
    count: number;
  }[];
  subscriptions: SubItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<SubscriptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger((v) => v + 1);
  };

  useEffect(() => {
    let ignore = false;
    async function loadSubscriptions() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (search.trim()) params.append("search", search.trim());
        if (statusFilter.trim()) params.append("status", statusFilter.trim());

        const res = await fetch(
          `${API_URL}/api/admin/subscriptions?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const resData = await res.json();
          if (!ignore && resData.success) {
            setData(resData);
          }
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSubscriptions();
    return () => {
      ignore = true;
    };
  }, [page, search, statusFilter, reloadTrigger]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Subscription Management
            </h1>
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
              Plans & Memberships
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Analyze subscription distribution, conversion rates, and member renewal statuses.
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

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Active Subscriptions
              </span>
              <Crown className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-amber-400">
              {data.kpi.activeSubscriptions}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Active premium members
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Free Tier Users
              </span>
              <Users className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
              {data.kpi.freeUsers}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Default free plan
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Paid Conversion Rate
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-purple-400">
              {data.kpi.paidConversionRate}%
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Total converted to paid
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Expired / Lapsed
              </span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-rose-400">
              {data.kpi.expiredSubscriptions}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Past premium subscriptions
            </span>
          </div>
        </div>
      )}

      {/* Plan Popularity Breakdown */}
      {data && data.planPopularity.length > 0 && (
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Available Plans Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.planPopularity.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    {plan.name}
                  </span>
                  <span className="font-bold text-xs text-amber-400">
                    {plan.priceRupees > 0 ? `₹${plan.priceRupees}` : "Free"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Subscribed Members</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {plan.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="surface-card overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search member name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3">Expires At</th>
                <th className="py-3 px-4 text-right">User Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : !data || data.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No subscriptions match current criteria.
                  </td>
                </tr>
              ) : (
                data.subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--surface-soft)]/50 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {s.userName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {s.userEmail}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                      {s.planName}
                    </td>

                    <td className="py-3 px-3 text-amber-400 font-bold">
                      {s.priceRupees > 0 ? `₹${s.priceRupees}` : "Free"}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          s.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : s.status === "pending"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                      {s.startsAt ? new Date(s.startsAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                      {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/users/${s.userId}`}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        View User
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && (
          <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[var(--text-muted)]">
              Showing Page <span className="font-bold text-[var(--text-primary)]">{page}</span> of{" "}
              <span className="font-bold text-[var(--text-primary)]">{data.pagination.totalPages}</span> ({data.pagination.total} subscriptions total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                }
                disabled={page >= data.pagination.totalPages || loading}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
