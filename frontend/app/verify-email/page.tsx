"use client";

import { Suspense, useEffect, useRef, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import { MailCheck, CheckCircle2, AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  // Resend form state for expired links
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verificationStarted = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/email/verify/${encodeURIComponent(token!)}`
        );

        let data: { success?: boolean; message?: string; accountStatus?: string } = {};
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          console.error("Non-JSON response received from server");
          data = { message: "Server returned an unexpected response" };
        }

        if (!response.ok) {
          setStatus("error");
          setMessage(data.message || "Email verification failed or link has expired.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully");
        if (data.accountStatus) {
          setAccountStatus(data.accountStatus);
        }
      } catch (error) {
        console.error("Email verification request failed:", error);

        setStatus("error");
        setMessage("Unable to verify your email. Please try again later.");
      }
    }

    verifyEmail();
  }, [searchParams]);

  async function handleResendSubmit(e: FormEvent) {
    e.preventDefault();

    if (!resendEmail.trim() || resending || cooldown > 0) return;

    setResending(true);
    setResendMessage("");
    setResendError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResendError(data.message || "Failed to resend verification email.");
      } else {
        setResendMessage(data.message || "Verification email sent successfully! Please check your inbox.");
        setCooldown(30);
      }
    } catch (err) {
      setResendError("Unable to connect to server. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <img
            src="/images/brand/connectsoulmate_logo.png"
            alt="ConnectSoulmate"
            className="h-10 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>
      </div>

      {status === "verifying" && (
        <Interactive3DCard>
          <div className="surface-card p-8 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
            <h1 className="font-serif text-xl font-bold text-[var(--text-primary)]">
              Verifying your email...
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Please wait while we verify your email address.
            </p>
          </div>
        </Interactive3DCard>
      )}

      {status === "success" && (
        <Interactive3DCard>
          <div className="surface-card p-8 shadow-2xl space-y-4 text-center border-emerald-500/30">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-emerald-400">
              Email Verified!
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {message}
            </p>
            <p className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
              Your account is now active! You can proceed to sign in to your dashboard.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="btn-primary w-full py-3 text-xs font-semibold inline-block"
              >
                Proceed to Sign In
              </Link>
            </div>
          </div>
        </Interactive3DCard>
      )}

      {status === "error" && (
        <Interactive3DCard>
          <div className="surface-card p-7 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-xl font-bold text-rose-400">
                Verification Failed or Expired
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {message}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Verification links expire after 30 minutes. Enter your email below to request a new link.
              </p>
            </div>

            <form onSubmit={handleResendSubmit} className="space-y-3 pt-2">
              {resendMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                  {resendMessage}
                </div>
              )}
              {resendError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                  {resendError}
                </div>
              )}

              <div>
                <label htmlFor="resendEmail" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    id="resendEmail"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={resending}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resending || !resendEmail.trim() || cooldown > 0}
                className="btn-primary w-full py-2.5 text-xs font-semibold disabled:opacity-50"
              >
                {resending ? (
                  "Sending New Link..."
                ) : cooldown > 0 ? (
                  `Resend available in ${cooldown}s`
                ) : (
                  "Request New Verification Link"
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[var(--border)]">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </Interactive3DCard>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-center max-w-md">
            <p className="text-xs text-[var(--text-muted)]">Loading verification page...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}