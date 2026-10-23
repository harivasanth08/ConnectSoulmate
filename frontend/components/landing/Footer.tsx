"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[var(--background)] py-12 text-[var(--text-secondary)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/images/brand/connectsoulmate_logo.png"
                alt="ConnectSoulmate"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs leading-relaxed text-[var(--text-muted)] max-w-sm">
              ConnectSoulmate is a modern matrimonial platform designed to help you find meaningful, compatible life connections based on shared values, family background, and lifestyle alignment.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)] pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> OTP Verified
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-[var(--brand-primary)]" /> Privacy Protected
              </span>
            </div>
          </div>

          {/* Column 1: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#discover" className="hover:text-[var(--text-primary)] transition">
                  Discover Matches
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-[var(--text-primary)] transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#ai-compatibility" className="hover:text-[var(--text-primary)] transition">
                  AI Compatibility
                </Link>
              </li>
              <li>
                <Link href="#stories" className="hover:text-[var(--text-primary)] transition">
                  Relationship Stories
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[var(--text-primary)] transition">
                  Wedding Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-[var(--text-primary)] transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-[var(--text-primary)] transition">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[var(--text-primary)] transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[var(--text-primary)] transition">
                  Register Profile
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-[var(--text-primary)] transition">
                  Premium Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition">
                  Member Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>OTP Verification</li>
              <li>Encrypted Security</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} ConnectSoulmate. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with care for serious relationship seekers <Heart className="h-3.5 w-3.5 text-[var(--brand-primary)] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
}
