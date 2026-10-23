"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface UserItem {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  role: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  profileCompleted: boolean;
  planName: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: "status" | "role";
    userId: number;
    newValue: string;
    danger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionType: "status",
    userId: 0,
    newValue: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger((v) => v + 1);
  };

  useEffect(() => {
    let ignore = false;
    async function loadUsers() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });

        if (search.trim()) params.append("search", search.trim());
        if (statusFilter.trim()) params.append("status", statusFilter.trim());
        if (roleFilter.trim()) params.append("role", roleFilter.trim());
        if (genderFilter.trim()) params.append("gender", genderFilter.trim());

        const res = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.success) {
            setUsers(data.users);
            setTotal(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch {
        if (!ignore) {
          showNotification("error", "Network error loading users list");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      ignore = true;
    };
  }, [page, search, statusFilter, roleFilter, genderFilter, reloadTrigger]);

  const handleOpenConfirm = (
    actionType: "status" | "role",
    userId: number,
    newValue: string,
    userName: string
  ) => {
    if (actionType === "status") {
      const isSuspend = newValue === "suspended";
      setConfirmModal({
        isOpen: true,
        title: isSuspend ? "Suspend Member Account" : "Activate Member Account",
        message: isSuspend
          ? `Are you sure you want to suspend the account for "${userName}"? The user will immediately be barred from signing in.`
          : `Are you sure you want to activate the account for "${userName}"?`,
        actionType,
        userId,
        newValue,
        danger: isSuspend,
      });
    } else {
      const isMakeAdmin = newValue === "admin";
      setConfirmModal({
        isOpen: true,
        title: isMakeAdmin ? "Grant System Administrator Access" : "Change User Role",
        message: isMakeAdmin
          ? `Grant administrator privileges to "${userName}"? They will gain full access to view user dossiers and administrative actions.`
          : `Change role of "${userName}" to "${newValue}"?`,
        actionType,
        userId,
        newValue,
        danger: isMakeAdmin,
      });
    }
  };

  const handleExecuteConfirmedAction = async () => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token || !confirmModal.userId) return;

    setActionLoading(true);
    try {
      const endpoint =
        confirmModal.actionType === "status"
          ? `${API_URL}/api/admin/users/${confirmModal.userId}/status`
          : `${API_URL}/api/admin/users/${confirmModal.userId}/role`;

      const body =
        confirmModal.actionType === "status"
          ? { status: confirmModal.newValue }
          : { role: confirmModal.newValue };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showNotification(
          "success",
          resData.message || "Operation completed successfully"
        );
        handleReload();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      } else {
        showNotification(
          "error",
          resData.message || "Failed to execute administrative action"
        );
      }
    } catch {
      showNotification("error", "Network error executing action");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Members Directory
            </h1>
            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-400">
              {total.toLocaleString()} Members
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Search, filter, inspect full matrimonial dossiers, and manage account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            disabled={loading}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div
          className={`rounded-xl border p-3.5 text-xs flex items-center justify-between shadow-lg ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="font-bold text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="surface-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 transition"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 transition"
            >
              <option value="">All Roles</option>
              <option value="user">Bride / Groom (Individual)</option>
              <option value="parent">Parent / Family Mode</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500 transition"
            >
              <option value="">All Genders</option>
              <option value="male">Male (Groom)</option>
              <option value="female">Female (Bride)</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Mobile</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Profile</th>
                <th className="py-3 px-3">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-purple-400" />
                    Fetching member accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No members match the current search or filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[var(--surface-soft)]/50 transition group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-bold text-[11px] text-purple-300 shrink-0">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {u.fullName}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[var(--text-secondary)] font-mono text-[11px]">
                      {u.mobileNumber || "—"}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          u.role === "admin"
                            ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                            : u.role === "parent"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                      >
                        {u.role === "admin" ? "🛡️ Admin" : u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          u.planName !== "Free"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {u.planName}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
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

                    <td className="py-3 px-3 text-[11px]">
                      {u.profileCompleted ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Incomplete</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="btn-secondary text-[11px] px-2.5 py-1 font-semibold flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Dossier
                        </Link>

                        {u.status === "active" ? (
                          <button
                            onClick={() =>
                              handleOpenConfirm(
                                "status",
                                u.id,
                                "suspended",
                                u.fullName
                              )
                            }
                            className="btn-secondary text-[11px] px-2.5 py-1 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenConfirm(
                                "status",
                                u.id,
                                "active",
                                u.fullName
                              )
                            }
                            className="btn-secondary text-[11px] px-2.5 py-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          >
                            Activate
                          </button>
                        )}
                      </div>
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
            <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({total} members total)
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

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full surface-card p-6 space-y-4 shadow-2xl border border-[var(--border)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    confirmModal.danger
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  {confirmModal.title}
                </h3>
              </div>
              <button
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                disabled={actionLoading}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                disabled={actionLoading}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition shadow-sm ${
                  confirmModal.danger
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
