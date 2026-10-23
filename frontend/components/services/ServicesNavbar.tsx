"use client";

import { useEffect, useState } from "react";
import HeaderNav from "@/components/layout/HeaderNav";
import Navbar from "@/components/layout/Navbar";

export function ServicesNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    setIsLoggedIn(Boolean(token));
  }, []);

  // During SSR or initial mount, render a lightweight placeholder with brand logo to avoid layout shift
  if (isLoggedIn === null) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center shrink-0">
            <img
              src="/images/brand/connectsoulmate_logo.png"
              alt="ConnectSoulmate"
              className="h-8 sm:h-9 w-auto object-contain max-w-[180px]"
            />
          </div>
        </div>
      </header>
    );
  }

  return isLoggedIn ? <HeaderNav /> : <Navbar />;
}
