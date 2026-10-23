"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, ArrowRight } from "lucide-react";

const navItems = [
  { label: "Discover", href: "#discover" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI Compatibility", href: "#ai-compatibility" },
  { label: "Stories", href: "#stories" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[var(--background)]/85 backdrop-blur-md transition-colors">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/brand/connectsoulmate_logo.png"
            alt="ConnectSoulmate"
            className="h-9 sm:h-10 lg:h-11 w-auto object-contain max-w-[180px] sm:max-w-[210px]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-pink-400"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            href="/parent/login"
            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            title="Switch to Parent / Family Mode"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>Parent Mode</span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition-all duration-200 hover:border-pink-500 hover:text-pink-400"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-[1.02] transition-all flex items-center gap-1.5"
          >
            <span>Create Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-primary)]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-5 lg:hidden shadow-2xl">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-pink-400"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-2.5 border-t border-[var(--border)] pt-4">
              <Link
                href="/parent/login"
                onClick={() => setMenuOpen(false)}
                className="w-full rounded-full border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-300 text-center flex items-center justify-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>Parent / Family Mode</span>
              </Link>

              <div className="flex gap-3">
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 text-xs font-semibold text-white text-center shadow-md"
                >
                  Create Profile
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full border border-[var(--border)] px-4 py-2.5 text-center text-xs font-semibold text-[var(--text-primary)]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
