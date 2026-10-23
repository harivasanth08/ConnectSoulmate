"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("connectsoulmate-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "theme-light",
        savedTheme === "light"
      );
      return;
    }

    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;

    const initialTheme: Theme = prefersLight ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle(
      "theme-light",
      initialTheme === "light"
    );
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    document.documentElement.classList.toggle(
      "theme-light",
      nextTheme === "light"
    );

    localStorage.setItem("connectsoulmate-theme", nextTheme);
  }

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] opacity-40" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      className="
        relative flex h-9 w-9 items-center justify-center
        rounded-full border border-[var(--border)]
        bg-[var(--surface)] text-[var(--text-primary)]
        shadow-sm transition-all duration-200
        hover:border-[var(--brand-primary)] hover:bg-[var(--surface-soft)]
        focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40
      "
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
