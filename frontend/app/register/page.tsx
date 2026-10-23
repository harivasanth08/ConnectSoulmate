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
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Step = "register" | "email_verification";

export default function RegisterPage() {
  const router = useRouter();

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("female");
  const [dateOfBirth, setDateOfBirth] = useState("");
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

  // Loading & Error States for Registration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Terms & Conditions State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Check terms acceptance & restore form draft from sessionStorage
  useEffect(() => {
    try {
      const isAccepted = sessionStorage.getItem("cs_terms_accepted") === "true";
      if (isAccepted) {
        setTermsAccepted(true);
      }

      const draftRaw = sessionStorage.getItem("cs_register_draft");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.email) setEmail(draft.email);
        if (draft.mobileNumber) setMobileNumber(draft.mobileNumber);
        if (draft.gender) setGender(draft.gender);
        if (draft.dateOfBirth) setDateOfBirth(draft.dateOfBirth);
        if (draft.password) setPassword(draft.password);
        if (draft.confirmPassword) setConfirmPassword(draft.confirmPassword);
      }
    } catch (e) {
      console.error("Failed to restore registration draft:", e);
    }
  }, []);

  const saveRegisterDraft = () => {
    try {
      sessionStorage.setItem(
        "cs_register_draft",
        JSON.stringify({ fullName, email, mobileNumber, gender, dateOfBirth, password, confirmPassword })
      );
    } catch (e) {}
  };

  // Auto-save form draft on change
  useEffect(() => {
    saveRegisterDraft();
  }, [fullName, email, mobileNumber, gender, dateOfBirth, password, confirmPassword]);

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

    if (loading) {
      return;
    }

    setError("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobileNumber.trim();

    // Client-side validations
    if (
      !cleanFullName ||
      !cleanEmail ||
      !cleanMobile ||
      !gender ||
      !dateOfBirth ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
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

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (isNaN(dob.getTime()) || age < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    if (!termsAccepted) {
      setError("You must read and accept the Terms & Conditions to create an account.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: cleanFullName,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          gender,
          dateOfBirth,
          password,
          confirmPassword,
          termsAccepted: true,
        }),
      });

      let data: {
        success?: boolean;
        message?: string;
        userId?: number;
      } = {};

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        setError("Server returned an unexpected response.");
        return;
      }

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to complete registration. Please try again."
        );
        return;
      }

      if (data.userId) {
        setUserId(data.userId);
      }

      try {
        sessionStorage.removeItem("cs_terms_accepted");
        sessionStorage.removeItem("cs_register_draft");
      } catch (e) {}

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

          <h1 className="font-serif mt-6 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {step === "register"
              ? "Create Your Account"
              : "Verify Your Email"}
          </h1>

          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {step === "register"
              ? "Begin your journey to finding a compatible life partner."
              : "Please verify your email address to activate your ConnectSoulmate account."}
          </p>
        </div>

        {/* Step 1: Registration Form */}
        {step === "register" && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 shadow-2xl">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold mb-5">
                <div className="py-2 rounded-lg text-center bg-[var(--brand-primary)] text-white shadow-sm font-bold">
                  Bride / Groom
                </div>
                <Link
                  href="/parent/register"
                  className="py-2 rounded-lg text-center text-[var(--text-secondary)] hover:text-amber-300 transition flex items-center justify-center gap-1.5"
                >
                  <span>Parent / Family</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">New</span>
                </Link>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Error Banner */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Full Name <span className="text-[var(--brand-primary)]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={loading}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>

                {/* Email & Mobile Number Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Email Address <span className="text-[var(--brand-primary)]">*</span>
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
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Mobile Number <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        id="mobileNumber"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 9876543210"
                        autoComplete="tel"
                        disabled={loading}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender & Date of Birth Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Gender <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Date of Birth <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Password <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        autoComplete="new-password"
                        disabled={loading}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((curr) => !curr)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Confirm Password <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        disabled={loading}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-10 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-60 placeholder:text-[var(--text-muted)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((curr) => !curr)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions Notice */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-[var(--text-secondary)]">
                      By creating an account, you agree to our{" "}
                      <Link
                        href="/terms"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="font-medium text-[var(--brand-primary)] underline hover:opacity-90 transition"
                      >
                        Terms & Conditions
                      </Link>
                      .
                    </p>
                    {termsAccepted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0 ml-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Accepted
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="btn-primary w-full py-3 text-xs font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              {/* Already a member link */}
              <div className="mt-6 pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </Interactive3DCard>
        )}

        {/* Step 2: Email Verification Notice */}
        {step === "email_verification" && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 shadow-2xl space-y-5">
              {/* Registration Confirmation Header */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-emerald-200">Registration Successful!</p>
                  <p className="mt-0.5 text-emerald-300/80">
                    Your ConnectSoulmate account has been created. A verification link has been sent to your email address.
                  </p>
                </div>
              </div>

              {/* Email Verification Section */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <MailCheck className="h-7 w-7" />
                </div>

                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Verify Your Email
                </h2>

                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  We have sent a verification link to{" "}
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
                    className="text-xs text-[var(--brand-primary)] hover:underline disabled:opacity-50 font-medium transition"
                  >
                    {resendingEmail
                      ? "Resending verification email..."
                      : emailCooldown > 0
                      ? `Resend email in ${emailCooldown}s`
                      : "Didn't receive email? Resend verification link"}
                  </button>
                  {resendEmailMsg && (
                    <p className="mt-2 text-xs text-emerald-400 font-medium">{resendEmailMsg}</p>
                  )}
                  {resendEmailError && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{resendEmailError}</p>
                  )}
                </div>

                <div className="mt-3 text-xs text-emerald-300/90 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-left">
                  Once your email is verified, you can sign in directly with your email and password to access your dashboard.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="btn-primary w-full py-3 text-xs font-semibold"
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

      {/* Terms & Conditions Modal Overlay */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          try {
            sessionStorage.setItem("cs_terms_accepted", "true");
            sessionStorage.setItem("cs_terms_accepted_at", new Date().toISOString());
          } catch (e) {}
        }}
        alreadyAccepted={termsAccepted}
      />
    </main>
  );
}
