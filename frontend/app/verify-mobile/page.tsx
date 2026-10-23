"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import { CheckCircle2, ArrowRight } from "lucide-react";

function VerifyMobileContent() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-block">
          <img
            src="/images/brand/connectsoulmate_logo.png"
            alt="ConnectSoulmate"
            className="h-10 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>
        <h1 className="font-serif mt-6 text-2xl font-bold text-[var(--text-primary)]">
          Mobile Verification Not Required
        </h1>
        <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
          Mobile OTP verification has been removed for a faster, smoother experience.
        </p>
      </div>

      {/* Notice Card */}
      <Interactive3DCard>
        <div className="surface-card p-8 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Direct Sign In Available
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              ConnectSoulmate accounts only require email confirmation. Once your email is verified, you can sign in directly to access your dashboard.
            </p>
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Redirecting you to the Sign In page in a few seconds...
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="btn-primary w-full py-3 text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Interactive3DCard>
    </div>
  );
}

export default function VerifyMobilePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-center text-[var(--text-muted)]">
            <p className="text-xs">Loading...</p>
          </div>
        }
      >
        <VerifyMobileContent />
      </Suspense>
    </main>
  );
}
