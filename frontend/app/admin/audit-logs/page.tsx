"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShieldCheck,
  UserCheck,
  Eye,
  Key,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuditLogItem {
  id: number;
  adminUserId: number;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string | null;
  targetId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger((v) => v + 1);
  };

  useEffect(() => {
    let ignore = false;
    async function loadLogs() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (search.trim()) params.append("search", search.trim());
        if (actionFilter.trim()) params.append("action", actionFilter.trim());

        const res = await fetch(
          `${API_URL}/api/admin/audit-logs?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const resData = await res.json();
          if (!ignore && resData.success) {
            setLogs(resData.logs);
            setTotal(resData.pagination.total);
            setTotalPages(resData.pagination.totalPages);
          }
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadLogs();
    return () => {
      ignore = true;
    };
  }, [page, search, actionFilter, reloadTrigger]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "admin_login":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-400">
            <Key className="h-3 w-3" /> Admin Login
          </span>
        );
      case "viewed_user":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            <Eye className="h-3 w-3" /> User Profile View
          </span>
        );
      case "updated_user_status":
      case "user_status_updated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            <UserCheck className="h-3 w-3" /> Account Status Change
          </span>
        );
      case "updated_user_role":
      case "user_role_updated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            <ShieldCheck className="h-3 w-3" /> User Role Change
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Administrative Audit Trail
            </h1>
            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-400">
              {total} Events
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Tamper-evident audit log tracking administrator logins, member inspections, and privilege modifications.
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

      {/* Filter Bar */}
      <div className="surface-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by administrator name, email, or action..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
        >
          <option value="">All Activities</option>
          <option value="admin_login">Admin Login</option>
          <option value="viewed_user">User Profile Views</option>
          <option value="updated_user_status">Account Status Changes</option>
          <option value="updated_user_role">User Role Changes</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Administrator</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-soft)]/50 transition">
                    <td className="py-3 px-4 text-[var(--text-muted)] text-[11px] font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {log.adminName}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {log.adminEmail}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      {log.targetType && log.targetId ? (
                        <span className="font-mono text-[var(--text-secondary)]">
                          {log.targetType} #{log.targetId}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[var(--text-secondary)] font-mono">
                      {log.metadata ? (
                        <span className="bg-[var(--surface-soft)] px-2 py-1 rounded text-[10px] inline-block max-w-xs truncate">
                          {JSON.stringify(log.metadata)}
                        </span>
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
        <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[var(--text-muted)]">
            Showing Page <span className="font-bold text-[var(--text-primary)]">{page}</span> of{" "}
            <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({total} logs total)
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
