"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface TransactionItem {
  id: number;
  userId: number | null;
  userName: string;
  userEmail: string;
  maskedOrderId: string;
  maskedPaymentId: string;
  amountRupees: number;
  currency: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
}

interface PaymentsData {
  kpi: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  };
  transactions: TransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentsData | null>(null);
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
    async function loadPayments() {
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
          `${API_URL}/api/admin/payments?${params.toString()}`,
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
        console.error("Failed to load payments:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPayments();
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
              Payments & Revenue
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              Razorpay Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Platform transaction records, revenue breakdown, and gateway reconciliation logs.
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
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Total Captured Revenue
              </span>
              <CreditCard className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-400">
              ₹{data.kpi.totalRevenue.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              All-time completed payments
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Revenue This Month
              </span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-purple-400">
              ₹{data.kpi.revenueThisMonth.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Current calendar month
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Successful Payments
              </span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-400">
              {data.kpi.successfulPayments}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Captured & verified orders
            </span>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Failed Payments
              </span>
              <XCircle className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-rose-400">
              {data.kpi.failedPayments}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              {data.kpi.pendingPayments} orders pending
            </span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="surface-card overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search member, email, or order ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="captured">Captured (Successful)</option>
            <option value="created">Created (Pending)</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Order ID (Masked)</th>
                <th className="py-3 px-3">Payment ID (Masked)</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">User Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Loading payment records...
                  </td>
                </tr>
              ) : !data || data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No payment transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                data.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--surface-soft)]/50 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {t.userName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t.userEmail}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-secondary)]">
                      {t.maskedOrderId}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-secondary)]">
                      {t.maskedPaymentId}
                    </td>

                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      ₹{t.amountRupees.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          t.status === "captured"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : t.status === "failed"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {t.userId ? (
                        <Link
                          href={`/admin/users/${t.userId}`}
                          className="btn-secondary text-[11px] px-2.5 py-1"
                        >
                          View Member
                        </Link>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
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
              <span className="font-bold text-[var(--text-primary)]">{data.pagination.totalPages}</span> ({data.pagination.total} payments total)
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
