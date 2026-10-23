"use client";

import { FormEvent, Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, MailCheck, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function maskEmail(emailStr: string) {
  if (!emailStr || !emailStr.includes("@")) return emailStr;
  const [local, domain] = emailStr.split("@");
  if (local.length <= 2) return `${local.charAt(0)}*@${domain}`;
  return `${local.charAt(0)}${"*".repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedParam = searchParams.get("verified");
  const modeParam = searchParams.get("mode");
  const [activeMode, setActiveMode] = useState<"individual" | "parent">(
    modeParam === "parent" ? "parent" : "individual"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Email verification recovery state
  const [unverifiedUser, setUnverifiedUser] = useState<{
    email: string;
    userId?: number;
  } | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (verifiedParam === "email") {
      setSuccessMsg("Email verified successfully. Please sign in to your account.");
    }
  }, [verifiedParam]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMsg("");
    setUnverifiedUser(null);
    setResendMsg("");
    setResendError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        setError("Server returned an unexpected response.");
        return;
      }

      if (!response.ok || !data.success) {
        if (data.requiresEmailVerification) {
          setUnverifiedUser({
            email: data.email || cleanEmail,
            userId: data.userId,
          });
          setError(data.message || "Please verify your email before logging in.");
          return;
        }

        setError(data.message || "Unable to login. Please try again.");
        return;
      }

      if (!data.token) {
        setError("Login succeeded, but no authentication token was received.");
        return;
      }

      localStorage.setItem("connectsoulmate_token", data.token);
      if (data.user) {
        localStorage.setItem("connectsoulmate_user", JSON.stringify(data.user));
      }

      const role = String(data.user?.role || "").toLowerCase();
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "parent") {
        if (data.user?.profileCompleted === false) {
          router.push("/parent/onboarding");
        } else {
          router.push("/parent/dashboard");
        }
      } else {
        if (data.user?.profileCompleted === false) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (requestError) {
      console.error("Login request failed:", requestError);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedUser?.email || resending || resendCooldown > 0) return;

    setResending(true);
    setResendMsg("");
    setResendError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: unverifiedUser.email,
          userId: unverifiedUser.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setResendError(data.message || "Failed to resend verification email.");
      } else {
        setResendMsg(data.message || "Verification email sent. Please check your inbox.");
        setResendCooldown(30);
      }
    } catch (err) {
      setResendError("Unable to connect to the server. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <img
            src="/images/brand/connectsoulmate_logo.png"
            alt="ConnectSoulmate"
            className="h-10 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>

        <h1 className="font-serif mt-6 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {activeMode === "parent" ? "Family Sign In" : "Welcome Back"}
        </h1>

        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {activeMode === "parent"
            ? "Sign in to manage your child's matrimonial profile and family connections."
            : "Sign in to your matrimonial account to continue your journey."}
        </p>
      </div>

      {/* Login Card */}
      <Interactive3DCard>
        <div className="surface-card p-7 shadow-2xl space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode("individual")}
              className={`py-2 rounded-lg transition-all text-center ${
                activeMode === "individual"
                  ? "bg-[var(--brand-primary)] text-white shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Bride / Groom
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("parent")}
              className={`py-2 rounded-lg transition-all text-center ${
                activeMode === "parent"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Parent / Family
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 space-y-3">
                <div>{error}</div>

                {/* Email Verification Recovery Card */}
                {unverifiedUser && (
                  <div className="pt-3 border-t border-red-500/20 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MailCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-left">
                        <p className="font-semibold text-xs text-amber-200">Email Verification Required</p>
                        <p className="text-[11px] text-amber-300/90 leading-relaxed">
                          We sent a verification link to{" "}
                          <span className="font-semibold text-white">
                            {maskEmail(unverifiedUser.email)}
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {resendMsg && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
                        {resendMsg}
                      </div>
                    )}

                    {resendError && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
                        {resendError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending || resendCooldown > 0}
                        className="btn-primary text-xs px-4 py-2 w-full sm:w-auto font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {resending ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : resendCooldown > 0 ? (
                          `Resend available in ${resendCooldown}s`
                        ) : (
                          "Resend Verification Email"
                        )}
                      </button>
                      <span className="text-[10px] text-red-200/70 text-center">
                        Check your spam/junk folder.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-semibold mt-2"
            >
              {loading ? "Signing in..." : "Sign In to Account"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link
              href={activeMode === "parent" ? "/parent/register" : "/register"}
              className="font-semibold text-[var(--brand-primary)] hover:underline"
            >
              {activeMode === "parent" ? "Create Parent Account" : "Register Profile"}
            </Link>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to ConnectSoulmate
            </Link>
          </div>
        </div>
      </Interactive3DCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-xs text-[var(--text-muted)]">Loading login page...</p>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}