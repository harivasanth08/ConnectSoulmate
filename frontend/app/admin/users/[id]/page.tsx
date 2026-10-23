"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User as UserIcon,
  ShieldCheck,
  Crown,
  CreditCard,
  HeartHandshake,
  AlertTriangle,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface UserProfileData {
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  marital_status?: string;
  religion?: string;
  community?: string;
  profile_photo?: string;
}

interface UserDossier {
  user: {
    id: number;
    fullName: string;
    email: string;
    mobileNumber: string;
    gender: string;
    dateOfBirth: string;
    status: string;
    role: string;
    parentRelationship?: string;
    emailVerified: boolean;
    mobileVerified: boolean;
    profileCompleted: boolean;
    profileCompletionStep: number;
    createdAt: string;
    updatedAt: string;
  };
  profile: UserProfileData | null;
  family: Record<string, unknown> | null;
  partnerPreferences: Record<string, unknown> | null;
  childProfile: Record<string, unknown> | null;
  subscriptions: Record<string, unknown>[];
  activeSubscription: {
    plan_name: string;
    expires_at: string;
  } | null;
  recentPayments: {
    id: number;
    maskedOrderId: string;
    maskedPaymentId: string;
    amountRupees: number;
    currency: string;
    status: string;
    errorMessage?: string;
    createdAt: string;
  }[];
  activity: {
    interestsSent: number;
    interestsReceived: number;
    matches: number;
    shortlists: number;
    messagesSent: number;
  };
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [dossier, setDossier] = useState<UserDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: "status" | "role";
    newValue: string;
    danger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionType: "status",
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
    async function loadDossier() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to load user dossier (status: ${res.status})`);
        }

        const resData = await res.json();
        if (!ignore && resData.success) {
          setDossier(resData);
        } else if (!ignore) {
          throw new Error(resData.message || "Failed to load user");
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Dossier load error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load user details"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDossier();
    return () => {
      ignore = true;
    };
  }, [userId, reloadTrigger]);

  const handleOpenConfirm = (
    actionType: "status" | "role",
    newValue: string
  ) => {
    if (!dossier) return;
    if (actionType === "status") {
      const isSuspend = newValue === "suspended";
      setConfirmModal({
        isOpen: true,
        title: isSuspend ? "Suspend Member Account" : "Activate Member Account",
        message: isSuspend
          ? `Are you sure you want to suspend the account for "${dossier.user.fullName}"? The user will be barred from login immediately.`
          : `Are you sure you want to activate the account for "${dossier.user.fullName}"?`,
        actionType,
        newValue,
        danger: isSuspend,
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: "Change Account Role",
        message: `Are you sure you want to set the role for "${dossier.user.fullName}" to "${newValue}"?`,
        actionType,
        newValue,
        danger: newValue === "admin",
      });
    }
  };

  const handleExecuteConfirmedAction = async () => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token || !dossier) return;

    setActionLoading(true);
    try {
      const endpoint =
        confirmModal.actionType === "status"
          ? `${API_URL}/api/admin/users/${dossier.user.id}/status`
          : `${API_URL}/api/admin/users/${dossier.user.id}/role`;

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
          resData.message || "Action executed successfully"
        );
        handleReload();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      } else {
        showNotification("error", resData.message || "Failed to update member");
      }
    } catch {
      showNotification("error", "Network error updating member");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[var(--surface-soft)] rounded animate-pulse" />
        <div className="h-44 surface-card p-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 surface-card p-6 animate-pulse" />
          <div className="h-64 surface-card p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="surface-card p-10 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
          Member Dossier Not Found
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        <Link href="/admin/users" className="btn-secondary text-xs px-4 py-2 inline-block">
          ← Back to Members Directory
        </Link>
      </div>
    );
  }

  const { user, profile, activity } = dossier;

  return (
    <div className="space-y-8">
      {/* Back button & Action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/users"
          className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Members
        </Link>

        {/* Status / Role Toggle Controls */}
        <div className="flex items-center gap-2">
          {user.status === "active" ? (
            <button
              onClick={() => handleOpenConfirm("status", "suspended")}
              className="btn-secondary text-xs px-3 py-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 font-semibold"
            >
              Suspend Account
            </button>
          ) : (
            <button
              onClick={() => handleOpenConfirm("status", "active")}
              className="btn-secondary text-xs px-3 py-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
            >
              Activate Account
            </button>
          )}

          {user.role !== "admin" ? (
            <button
              onClick={() => handleOpenConfirm("role", "admin")}
              className="btn-secondary text-xs px-3 py-1.5 text-purple-400 border-purple-500/30 hover:bg-purple-500/10 font-semibold flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Make Admin
            </button>
          ) : (
            <button
              onClick={() => handleOpenConfirm("role", "user")}
              className="btn-secondary text-xs px-3 py-1.5 text-[var(--text-muted)] font-semibold"
            >
              Remove Admin
            </button>
          )}
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

      {/* User Header Profile Card */}
      <div className="surface-card p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shrink-0 overflow-hidden ring-2 ring-purple-500/30">
            {profile?.profile_photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.profile_photo}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{user.fullName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                {user.fullName}
              </h1>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                  user.status === "active"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {user.status}
              </span>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                  user.role === "admin"
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : user.role === "parent"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {user.role === "admin" ? "🛡️ Admin" : user.role}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] font-mono">
              Member ID: #{user.id} • Registered:{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Top Activity Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[var(--border)] text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--surface-soft)]">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Interests Sent
            </span>
            <span className="text-base font-extrabold text-[var(--text-primary)]">
              {activity.interestsSent}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface-soft)]">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Interests Received
            </span>
            <span className="text-base font-extrabold text-[var(--text-primary)]">
              {activity.interestsReceived}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface-soft)]">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Total Matches
            </span>
            <span className="text-base font-extrabold text-rose-400">
              {activity.matches}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface-soft)]">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Shortlists
            </span>
            <span className="text-base font-extrabold text-amber-400">
              {activity.shortlists}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface-soft)] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Messages Sent
            </span>
            <span className="text-base font-extrabold text-purple-400">
              {activity.messagesSent}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Account Info & Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Account Details */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <UserIcon className="h-4 w-4" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Account Overview
            </h2>
          </div>

          <div className="space-y-3 text-xs divide-y divide-[var(--border)]">
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Email</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {user.email}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Mobile Number</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {user.mobileNumber || "—"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Gender</span>
              <span className="font-semibold capitalize text-[var(--text-primary)]">
                {user.gender || "—"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Date of Birth</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Email Verification</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  user.emailVerified ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {user.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[var(--text-muted)]">Profile Onboarding</span>
              <span
                className={`font-semibold ${
                  user.profileCompleted ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {user.profileCompleted
                  ? "Completed"
                  : `Incomplete (Step ${user.profileCompletionStep})`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Matrimonial Profile */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-pink-400">
            <HeartHandshake className="h-4 w-4" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Matrimonial Profile
            </h2>
          </div>

          {profile ? (
            <div className="space-y-3 text-xs divide-y divide-[var(--border)]">
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Location</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(", ") || "Not set"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Education</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {profile.education || "—"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Occupation</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {profile.occupation || "—"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Marital Status</span>
                <span className="font-semibold capitalize text-[var(--text-primary)]">
                  {profile.marital_status?.replace(/_/g, " ") || "—"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Religion / Caste</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {[profile.religion, profile.community].filter(Boolean).join(" / ") || "—"}
                </span>
              </div>

              <div className="py-2">
                <span className="text-[var(--text-muted)] block mb-1">Bio</span>
                <p className="text-[var(--text-secondary)] italic bg-[var(--surface-soft)] p-2.5 rounded-lg leading-relaxed">
                  &ldquo;{profile.bio || "No personal bio provided."}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matrimonial profile record created yet.
            </p>
          )}
        </div>
      </div>

      {/* Subscriptions & Payments Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Info */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="h-4 w-4" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Subscription Status
            </h2>
          </div>

          {dossier.activeSubscription ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">
                  {dossier.activeSubscription.plan_name}
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Expires:{" "}
                {new Date(
                  dossier.activeSubscription.expires_at
                ).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] text-xs text-[var(--text-muted)]">
              Member is currently on the default <span className="font-bold text-[var(--text-primary)]">Free Plan</span>.
            </div>
          )}
        </div>

        {/* Safe Payments History */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CreditCard className="h-4 w-4" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Payments History
            </h2>
          </div>

          {dossier.recentPayments.length === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--text-muted)]">
              No recorded payment transactions for this user.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {dossier.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[var(--surface-soft)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">
                      {p.maskedOrderId}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">
                      ₹{p.amountRupees.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
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
