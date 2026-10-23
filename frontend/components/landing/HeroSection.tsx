"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Heart,
  Shield,
  Sparkles,
  UserCheck,
  Lock,
  Users,
  Brain,
  ChevronDown,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const ages = Array.from({ length: 43 }, (_, index) => index + 18);

export default function HeroSection() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [lookingFor, setLookingFor] = useState("Woman");
  const [ageFrom, setAgeFrom] = useState("22");
  const [ageTo, setAgeTo] = useState("27");
  const [religion, setReligion] = useState("");
  const [motherTongue, setMotherTongue] = useState("Telugu");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const from = Number(ageFrom);
    const to = Number(ageTo);

    if (from > to) {
      alert("Age From cannot be greater than Age To.");
      return;
    }

    const params = new URLSearchParams();
    if (lookingFor) {
      const normalizedGender =
        lookingFor.toLowerCase() === "woman"
          ? "female"
          : lookingFor.toLowerCase() === "man"
          ? "male"
          : lookingFor.toLowerCase();
      params.set("gender", normalizedGender);
    }
    if (ageFrom) params.set("minAge", ageFrom);
    if (ageTo) params.set("maxAge", ageTo);
    if (religion) params.set("religion", religion);
    if (motherTongue) params.set("motherTongue", motherTongue);

    router.push(`/search?${params.toString()}`);
  }

  const fadeIn = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 25 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7 },
      };

  return (
    <>
      {/* 1. MAIN HERO SECTION WITH BACKGROUND IMAGE */}
      <section
        id="home"
        className="relative overflow-hidden pt-28 pb-10 lg:pt-34 lg:pb-14 text-white"
      >
        {/* BASE BACKGROUND LAYER (z-0) */}
        <div className="absolute inset-0 z-0 bg-black" />

        {/* FULL HERO BACKGROUND IMAGE LAYER — ENGAGEMENT CEREMONY VISUAL (z-10) */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none select-none">
          {/* Full-bleed Hero Background Image — Positioned at top to reveal couple's hands */}
          <img
            src="/images/hero/hero-background.png"
            alt="ConnectSoulmate Matrimonial Background"
            className="h-full w-full object-cover object-[75%_top] lg:object-[right_top]"
          />

          {/* Sophisticated Dual Gradient Overlay for 100% Text Readability & Natural Visual Fade */}
          {/* Left Dark Gradient: Guarantees headline and text on left are 100% readable while leaving right-side wedding visual clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent w-full lg:w-[65%]" />

          {/* Top Soft Vignette */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

          {/* Bottom Fade Layer ensuring complete seamless transition into normal page background after feature cards */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent [.theme-light_&]:from-[#faf8f5] [.theme-light_&]:via-[#faf8f5]/70 [.theme-light_&]:to-transparent" />
        </div>

        {/* 2. MAIN CONTAINER — HERO CONTENT & UI OVER BACKGROUND (z-30) */}
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 w-full relative z-30">
          
          {/* Top Hero Section Header & Editorial Headline Block */}
          <div className="relative mb-8 lg:mb-10">
            {/* Handwritten Cursive Script Accent (Top Right Desktop) */}
            <motion.div
              {...fadeIn}
              className="hidden lg:block absolute right-4 top-0 text-right pointer-events-none drop-shadow-lg"
            >
              <p className="font-serif italic text-2xl lg:text-3xl text-pink-200/90 tracking-wide font-semibold">
                Two Lives
              </p>
              <p className="font-serif italic text-xl lg:text-2xl text-purple-200/80 tracking-widest mt-0.5">
                One Beautiful Journey
              </p>
            </motion.div>

            {/* Editorial Headline Block (Positioned over Left Gradient) */}
            <div className="max-w-3xl space-y-6">
              {/* Eyebrow with Line */}
              <motion.div {...fadeIn} className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                  A Modern Matrimonial Platform
                </span>
                <div className="h-px w-24 bg-gradient-to-r from-pink-500/50 to-transparent" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                {...fadeIn}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-serif leading-[1.08] drop-shadow-md"
              >
                Meet someone who <br />
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                  feels like home.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                {...fadeIn}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-sm sm:text-base lg:text-lg text-slate-200/95 leading-relaxed max-w-2xl drop-shadow"
              >
                ConnectSoulmate is designed for individuals seeking intentional, long-term life partners built on shared values, family background, and mutual respect.
              </motion.p>

              {/* Three Feature Indicators / Badges */}
              <motion.div
                {...fadeIn}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                {/* Indicator 1 */}
                <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-md text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span>Privacy First Controls</span>
                </div>

                {/* Indicator 2 */}
                <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-md text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                    <Brain className="h-3.5 w-3.5" />
                  </div>
                  <span>AI Compatibility Insights</span>
                </div>

                {/* Indicator 3 */}
                <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-md text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <span>Serious Relationships</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 3. "FIND YOUR MATCH" SEARCH PANEL (Below Hero Text Content) */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 sm:mt-12 lg:mt-16 w-full"
          >
            <div className="rounded-[2.2rem] border border-white/20 bg-black/65 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
              {/* Panel Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-serif">
                      Find Your Match
                    </h2>
                    <p className="text-xs text-slate-300">
                      Start your journey with people who share your values.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 self-start sm:self-auto bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                  <Users className="h-3.5 w-3.5 text-pink-400" />
                  <span>Real People. Real Intentions.</span>
                </div>
              </div>

              {/* Filter Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end">
                  {/* Looking For */}
                  <div>
                    <label htmlFor="lookingFor" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Looking for
                    </label>
                    <select
                      id="lookingFor"
                      value={lookingFor}
                      onChange={(e) => setLookingFor(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white outline-none focus:border-pink-500 transition shadow-inner"
                    >
                      <option value="Woman" className="bg-slate-900 text-white">Woman</option>
                      <option value="Man" className="bg-slate-900 text-white">Man</option>
                    </select>
                  </div>

                  {/* Mother Tongue */}
                  <div>
                    <label htmlFor="motherTongue" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Mother Tongue
                    </label>
                    <select
                      id="motherTongue"
                      value={motherTongue}
                      onChange={(e) => setMotherTongue(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white outline-none focus:border-pink-500 transition shadow-inner"
                    >
                      <option value="Telugu" className="bg-slate-900 text-white">Telugu</option>
                      <option value="Hindi" className="bg-slate-900 text-white">Hindi</option>
                      <option value="Tamil" className="bg-slate-900 text-white">Tamil</option>
                      <option value="Kannada" className="bg-slate-900 text-white">Kannada</option>
                      <option value="Malayalam" className="bg-slate-900 text-white">Malayalam</option>
                      <option value="Marathi" className="bg-slate-900 text-white">Marathi</option>
                      <option value="Bengali" className="bg-slate-900 text-white">Bengali</option>
                      <option value="Gujarati" className="bg-slate-900 text-white">Gujarati</option>
                      <option value="Other" className="bg-slate-900 text-white">Other</option>
                    </select>
                  </div>

                  {/* Age From */}
                  <div>
                    <label htmlFor="ageFrom" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Age From
                    </label>
                    <select
                      id="ageFrom"
                      value={ageFrom}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAgeFrom(value);
                        if (Number(value) > Number(ageTo)) setAgeTo(value);
                      }}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white outline-none focus:border-pink-500 transition shadow-inner"
                    >
                      {ages.map((age) => (
                        <option key={age} value={age} className="bg-slate-900 text-white">
                          {age} yrs
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age To */}
                  <div>
                    <label htmlFor="ageTo" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Age To
                    </label>
                    <select
                      id="ageTo"
                      value={ageTo}
                      onChange={(e) => setAgeTo(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white outline-none focus:border-pink-500 transition shadow-inner"
                    >
                      {ages
                        .filter((age) => age >= Number(ageFrom))
                        .map((age) => (
                          <option key={age} value={age} className="bg-slate-900 text-white">
                            {age} yrs
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label htmlFor="religion" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Religion
                    </label>
                    <select
                      id="religion"
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white outline-none focus:border-pink-500 transition shadow-inner"
                    >
                      <option value="" className="bg-slate-900 text-white">All</option>
                      <option value="Hindu" className="bg-slate-900 text-white">Hindu</option>
                      <option value="Muslim" className="bg-slate-900 text-white">Muslim</option>
                      <option value="Christian" className="bg-slate-900 text-white">Christian</option>
                      <option value="Sikh" className="bg-slate-900 text-white">Sikh</option>
                      <option value="Jain" className="bg-slate-900 text-white">Jain</option>
                    </select>
                  </div>

                  {/* Primary Search CTA Button */}
                  <div className="lg:col-span-1">
                    <button
                      type="submit"
                      className="w-full h-[46px] rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search Profiles</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* 4. TRUST INDICATORS BAR (FEATURE CARDS) */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Indicator 1 */}
            <Interactive3DCard
              accentGlow="rgba(236, 72, 153, 0.3)"
              accentLight="rgba(244, 63, 94, 0.15)"
              className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 [.theme-light_&]:bg-white [.theme-light_&]:border-slate-200/80 [.theme-light_&]:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 [.theme-light_&]:bg-pink-50 [.theme-light_&]:text-pink-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white [.theme-light_&]:text-[#18131D]">Verified Profiles</h4>
                  <p className="text-[11px] text-slate-300 [.theme-light_&]:text-[#6B6475]">Email &amp; Mobile Verified</p>
                </div>
              </div>
            </Interactive3DCard>

            {/* Indicator 2 */}
            <Interactive3DCard
              accentGlow="rgba(245, 158, 11, 0.3)"
              accentLight="rgba(234, 179, 8, 0.15)"
              className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 [.theme-light_&]:bg-white [.theme-light_&]:border-slate-200/80 [.theme-light_&]:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 [.theme-light_&]:bg-amber-50 [.theme-light_&]:text-amber-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white [.theme-light_&]:text-[#18131D]">Safe &amp; Secure</h4>
                  <p className="text-[11px] text-slate-300 [.theme-light_&]:text-[#6B6475]">Your privacy matters</p>
                </div>
              </div>
            </Interactive3DCard>

            {/* Indicator 3 */}
            <Interactive3DCard
              accentGlow="rgba(244, 63, 94, 0.3)"
              accentLight="rgba(224, 86, 123, 0.15)"
              className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 [.theme-light_&]:bg-white [.theme-light_&]:border-slate-200/80 [.theme-light_&]:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 [.theme-light_&]:bg-rose-50 [.theme-light_&]:text-rose-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white [.theme-light_&]:text-[#18131D]">Meaningful Connections</h4>
                  <p className="text-[11px] text-slate-300 [.theme-light_&]:text-[#6B6475]">Built on shared values</p>
                </div>
              </div>
            </Interactive3DCard>

            {/* Indicator 4 */}
            <Interactive3DCard
              accentGlow="rgba(168, 85, 247, 0.3)"
              accentLight="rgba(139, 92, 246, 0.15)"
              className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 [.theme-light_&]:bg-white [.theme-light_&]:border-slate-200/80 [.theme-light_&]:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 [.theme-light_&]:bg-purple-50 [.theme-light_&]:text-purple-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white [.theme-light_&]:text-[#18131D]">AI-Powered Insights</h4>
                  <p className="text-[11px] text-slate-300 [.theme-light_&]:text-[#6B6475]">Understand compatibility better</p>
                </div>
              </div>
            </Interactive3DCard>
          </motion.div>
        </div>
      </section>

      {/* 5. SCROLL TO EXPLORE INDICATOR (OUTSIDE HERO IMAGE IN NORMAL DOCUMENT FLOW) */}
      <div className="py-6 sm:py-8 text-center relative flex flex-col items-center justify-center bg-[var(--background)] z-20">
        <svg className="w-full max-w-lg h-6 opacity-40 [.theme-light_&]:opacity-75" viewBox="0 0 500 30" fill="none">
          <path
            d="M 0 15 Q 125 30 250 15 Q 375 0 500 15"
            stroke="url(#line-gradient)"
            strokeWidth="1.5"
          />
          <circle cx="250" cy="15" r="4" fill="#ec4899" />
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ec4899" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 [.theme-light_&]:text-[#4A4353] mt-2">
          Scroll to Explore
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-pink-400 [.theme-light_&]:text-pink-600 animate-bounce mt-1" />
      </div>
    </>
  );
}
