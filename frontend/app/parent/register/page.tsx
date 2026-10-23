"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import TermsModal from "@/components/TermsModal";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  MailCheck,
  ShieldCheck,
  Users,
  Heart,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Step = "register" | "email_verification";

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Guardian",
  "Other Family Member",
];

export default function ParentRegisterPage() {
  const router = useRouter();

  // Registration Form State
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow Step & Session State
  const [step, setStep] = useState<Step>("register");
  const [userId, setUserId] = useState<number | null>(null);

  // Resend Email State
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendEmailMsg, setResendEmailMsg] = useState("");
  const [resendEmailError, setResendEmailError] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Terms & Conditions State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Cooldown timers
  useEffect(() => {
    let timer: any;
    if (emailCooldown > 0) {
      timer = setTimeout(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCooldown]);

  async function handleResendEmail() {
    if (resendingEmail || emailCooldown > 0 || !email) return;

    setResendingEmail(true);
    setResendEmailMsg("");
    setResendEmailError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResendEmailError(data.message || "Failed to resend verification email.");
      } else {
        setResendEmailMsg(data.message || "Verification email sent successfully!");
        setEmailCooldown(30);
      }
    } catch (err) {
      setResendEmailError("Unable to connect to server.");
    } finally {
      setResendingEmail(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;
    setError("");

    const cleanName = parentName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobileNumber.trim();

    if (!cleanName || !cleanEmail || !cleanMobile || !relationship || !password || !confirmPassword) {
      setError("Please fill in all required parent registration fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cleanMobile.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("You must read and accept the Terms & Conditions to register.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          password,
          confirmPassword,
          role: "parent",
          parentRelationship: relationship,
          termsAccepted: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to complete registration. Please try again.");
        return;
      }

      if (data.userId) {
        setUserId(data.userId);
      }

      setStep("email_verification");
    } catch (requestError) {
      console.error("Registration request failed:", requestError);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
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

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Users className="h-3.5 w-3.5" />
            <span>Parent / Family Account</span>
          </div>

          <h1 className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {step === "register" ? "Find a Match for Your Child" : "Verify Your Email"}
          </h1>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {step === "register"
              ? "Register as a parent or family member to help your son or daughter discover a meaningful life partner."
              : "Please verify your email address to activate your parent account."}
          </p>
        </div>

        {step === "register" ? (
          <Interactive3DCard>
            <div className="surface-card p-7 shadow-2xl space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold">
                <Link
                  href="/register"
                  className="py-2 rounded-lg text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  Bride / Groom
                </Link>
                <div className="py-2 rounded-lg text-center bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm font-bold">
                  Parent / Family
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* 1. Parent Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Parent / Guardian Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Ramesh Rao"
                      required
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* 2. Relationship */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Your Relationship to Candidate <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RELATIONSHIPS.map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setRelationship(rel)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition text-center ${
                          relationship === rel
                            ? "border-amber-500 bg-amber-500/15 text-amber-300 font-semibold"
                            : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Email Address */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* 4. Mobile Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* 5. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-10 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 pl-10 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Terms & Conditions */}
                <div className="pt-2 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="termsAccept"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-soft)] text-amber-500 accent-amber-500"
                  />
                  <label htmlFor="termsAccept" className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="font-semibold text-amber-400 underline hover:text-amber-300"
                    >
                      Terms & Conditions and Matrimonial Privacy Policy
                    </button>
                    .
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-semibold mt-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600"
                >
                  {loading ? "Creating Parent Account..." : "Continue to Verify Contact"}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
                Already registered as a Parent?{" "}
                <Link href="/parent/login" className="font-semibold text-amber-400 hover:underline">
                  Sign In
                </Link>
              </div>

              <div className="text-center pt-2">
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to ConnectSoulmate
                </Link>
              </div>
            </div>
          </Interactive3DCard>
        ) : (
          /* Step 2: Email Verification Notice */
          <Interactive3DCard>
            <div className="surface-card p-7 shadow-2xl space-y-6">
              {/* Registration Confirmation Header */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-emerald-200">Registration Successful!</p>
                  <p className="mt-0.5 text-emerald-300/80">
                    Your Parent / Family account has been created. A verification link has been sent to your email address.
                  </p>
                </div>
              </div>

              {/* Email Verification Section */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <MailCheck className="h-7 w-7" />
                </div>

                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Verify Your Email
                </h2>

                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  We sent a verification link to{" "}
                  <span className="font-semibold text-[var(--text-primary)]">{email}</span>.
                  Please click the link in your email to verify and activate your account.
                </p>

                <p className="text-[11px] text-[var(--text-muted)]">
                  Can&apos;t find the email? Please check your spam or junk folder.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendingEmail || emailCooldown > 0}
                    className="text-xs text-amber-400 hover:underline disabled:opacity-50 font-medium transition"
                  >
                    {resendingEmail
                      ? "Resending verification email..."
                      : emailCooldown > 0
                      ? `Resend link in ${emailCooldown}s`
                      : "Didn't receive email? Resend verification link"}
                  </button>
                  {resendEmailMsg && (
                    <p className="mt-2 text-xs text-emerald-400 font-medium">{resendEmailMsg}</p>
                  )}
                  {resendEmailError && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{resendEmailError}</p>
                  )}
                </div>

                <div className="mt-3 text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-left">
                  Once your email is verified, you can sign in directly to create and manage matrimonial profiles for your family member.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/parent/login")}
                  className="btn-primary w-full py-3 text-xs font-semibold bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600"
                >
                  Proceed to Sign In
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("register");
                      setError("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Edit registration details
                  </button>
                </div>
              </div>
            </div>
          </Interactive3DCard>
        )}
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
        }}
        alreadyAccepted={termsAccepted}
      />
    </main>
  );
}
