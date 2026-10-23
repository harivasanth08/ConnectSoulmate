"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Star,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Search,
  BookOpen,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PersonFormState = {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
};

type Candidate = {
  userId: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  profilePhoto?: string | null;
  occupation?: string | null;
};

type KootaResult = {
  koota: string;
  maxScore: number;
  obtainedScore: number;
  interpretation: string;
  hasDosha?: boolean;
};

type KundaliMatchData = {
  person1: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    birthPlace: string;
    rashi: string;
    rashiLord: string;
    nakshatra: string;
    pada: number;
    gana: string;
    yoni: string;
    nadi: string;
  };
  person2: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    birthPlace: string;
    rashi: string;
    rashiLord: string;
    nakshatra: string;
    pada: number;
    gana: string;
    yoni: string;
    nadi: string;
  };
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: string;
  verdictBadge: string;
  kootaBreakdown: KootaResult[];
  doshaDetails: {
    mangalDosha: {
      person1HasDosha: boolean;
      person2HasDosha: boolean;
      isCancelled: boolean;
      summary: string;
    };
    bhakootDosha: boolean;
    nadiDosha: boolean;
  };
  strengths: string[];
  concerns: string[];
  disclaimer: string;
};

export default function KundaliMatchingPage() {
  const router = useRouter();

  // Form states
  const [person1, setPerson1] = useState<PersonFormState>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "10:30",
    birthPlace: "",
  });

  const [person2, setPerson2] = useState<PersonFormState>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "14:15",
    birthPlace: "",
  });

  // Prefill & candidate state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [prefilledP1, setPrefilledP1] = useState(false);

  // Status & calculation states
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<KundaliMatchData | null>(null);

  // UI state
  const [expandedKoota, setExpandedKoota] = useState<string | null>(null);

  useEffect(() => {
    async function initData() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) {
        setFetchingProfile(false);
        return;
      }

      try {
        // Fetch logged-in user profile & candidates in parallel
        const [profRes, candRes] = await Promise.all([
          fetch(`${API_URL}/api/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/kundali/candidates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.success && profData.profile) {
            const p = profData.profile;
            setUserProfile(p);

            // Format date string YYYY-MM-DD
            let formattedDob = "";
            if (p.dateOfBirth) {
              const d = new Date(p.dateOfBirth);
              if (!isNaN(d.getTime())) {
                formattedDob = d.toISOString().split("T")[0];
              }
            }

            const p1Place = p.birthPlace || [p.city, p.state, p.country].filter(Boolean).join(", ");

            setPerson1({
              name: p.fullName || "My Profile",
              dateOfBirth: formattedDob,
              timeOfBirth: p.timeOfBirth || "10:30",
              birthPlace: p1Place || "",
            });
            setPrefilledP1(true);
          }
        }

        if (candRes.ok) {
          const cData = await candRes.json();
          if (cData.success && Array.isArray(cData.candidates)) {
            setCandidates(cData.candidates);
          }
        }
      } catch (err) {
        console.error("Error loading user profile for Kundali matching:", err);
      } finally {
        setFetchingProfile(false);
      }
    }

    initData();
  }, []);

  // Handle Candidate Selection for Person 2
  const handleSelectCandidate = (candidateIdStr: string) => {
    setSelectedCandidateId(candidateIdStr);
    if (!candidateIdStr) return;

    const cand = candidates.find((c) => String(c.userId) === candidateIdStr);
    if (cand) {
      let formattedDob = "";
      if (cand.dateOfBirth) {
        const d = new Date(cand.dateOfBirth);
        if (!isNaN(d.getTime())) {
          formattedDob = d.toISOString().split("T")[0];
        }
      }

      setPerson2({
        name: cand.fullName,
        dateOfBirth: formattedDob,
        timeOfBirth: cand.timeOfBirth || "12:00",
        birthPlace: cand.birthPlace || "",
      });
    }
  };

  // Prefill Person 1 manually if requested
  const handlePrefillPerson1 = () => {
    if (!userProfile) return;

    let formattedDob = "";
    if (userProfile.dateOfBirth) {
      const d = new Date(userProfile.dateOfBirth);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toISOString().split("T")[0];
      }
    }

    const place = userProfile.birthPlace || [userProfile.city, userProfile.state, userProfile.country].filter(Boolean).join(", ");

    setPerson1({
      name: userProfile.fullName || "My Profile",
      dateOfBirth: formattedDob,
      timeOfBirth: userProfile.timeOfBirth || "10:30",
      birthPlace: place || "",
    });
    setPrefilledP1(true);
  };

  // Calculate Kundali Matching
  const handleCalculateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!person1.dateOfBirth) {
      setError("Please enter Date of Birth for Person 1");
      return;
    }
    if (!person2.dateOfBirth) {
      setError("Please enter Date of Birth for Person 2");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/kundali/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: {
            name: person1.name.trim() || "Person 1",
            dateOfBirth: person1.dateOfBirth,
            timeOfBirth: person1.timeOfBirth,
            birthPlace: person1.birthPlace,
          },
          person2: {
            name: person2.name.trim() || "Person 2",
            dateOfBirth: person2.dateOfBirth,
            timeOfBirth: person2.timeOfBirth,
            birthPlace: person2.birthPlace,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to calculate Kundali match");
      }

      setMatchResult(data.data);
      // Smooth scroll to top of result
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Calculation failed. Please verify birth details.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeColor = (verdictBadge: string) => {
    switch (verdictBadge) {
      case "Highly Auspicious":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Auspicious":
        return "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border-[var(--brand-primary)]/30";
      case "Acceptable":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors">
      <HeaderNav />

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-soft)]/60 via-[var(--background)] to-[var(--background)] py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--brand-gold)] shadow-sm mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>Vedic Astrology Compatibility</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Kundali <span className="text-gradient">Matching</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
          >
            Compare birth details with traditional 36-Guna Ashta Koota Milan. Discover planetary harmony, nakshatra alignment, strengths, and dosha insights for matrimonial compatibility.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* RESULT VIEW */}
        {matchResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* 1. Header Names & Birth Summaries */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                {/* Person 1 Card */}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                    Person 1 (Groom / Partner A)
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold">{matchResult.person1.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[var(--text-secondary)] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person1.dateOfBirth}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person1.timeOfBirth}
                    </span>
                    {matchResult.person1.birthPlace && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person1.birthPlace}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">Rashi:</span> {matchResult.person1.rashi} | <span className="font-semibold text-[var(--text-primary)]">Nakshatra:</span> {matchResult.person1.nakshatra} (Pada {matchResult.person1.pada})
                  </div>
                </div>

                {/* Heart Divider */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow-md">
                  <Heart className="h-6 w-6 fill-current animate-pulse" />
                </div>

                {/* Person 2 Card */}
                <div className="flex-1 space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                    Person 2 (Bride / Partner B)
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold">{matchResult.person2.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs text-[var(--text-secondary)] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person2.dateOfBirth}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person2.timeOfBirth}
                    </span>
                    {matchResult.person2.birthPlace && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[var(--brand-gold)]" /> {matchResult.person2.birthPlace}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">Rashi:</span> {matchResult.person2.rashi} | <span className="font-semibold text-[var(--text-primary)]">Nakshatra:</span> {matchResult.person2.nakshatra} (Pada {matchResult.person2.pada})
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-6 border-t border-[var(--border)] pt-4 text-center">
                <button
                  onClick={() => setMatchResult(null)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Calculate Another Match
                </button>
              </div>
            </div>

            {/* 2. Overall Score Gauge Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface)] p-8 text-center shadow-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Ashta Koota Compatibility Score
              </span>

              {/* Large Score Ring */}
              <div className="relative mx-auto my-6 flex h-44 w-44 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-[var(--surface-soft)]"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * matchResult.percentage) / 100}
                    strokeLinecap="round"
                    className="text-[var(--brand-primary)] transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-4xl font-extrabold text-[var(--text-primary)]">
                    {matchResult.totalScore}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">out of 36</span>
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={`inline-block rounded-full border px-4 py-1 text-xs font-bold ${getScoreBadgeColor(
                    matchResult.verdictBadge
                  )}`}
                >
                  {matchResult.verdictBadge}
                </div>

                <h2 className="text-xl font-bold text-[var(--text-primary)]">{matchResult.verdict}</h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  {matchResult.totalScore >= 18
                    ? `Guna Milan score of ${matchResult.totalScore}/36 indicates acceptable matrimonial compatibility under traditional Vedic astrology.`
                    : `Guna Milan score of ${matchResult.totalScore}/36 suggests caution. Personal alignment and astrological consultation are recommended.`}
                </p>
              </div>
            </div>

            {/* 3. Ashta Koota 8-Factor Breakdown */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Ashta Koota Breakdown</h3>
                  <p className="text-xs text-[var(--text-muted)]">Individual scores across all 8 traditional compatibility factors</p>
                </div>
                <span className="text-xs font-semibold text-[var(--brand-gold)] border border-[var(--brand-gold)]/30 rounded-full px-3 py-1 bg-[var(--brand-gold)]/10">
                  8 Factors
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {matchResult.kootaBreakdown.map((item, idx) => {
                  const pct = Math.round((item.obtainedScore / item.maxScore) * 100);
                  const isExpanded = expandedKoota === item.koota;

                  return (
                    <div
                      key={item.koota}
                      onClick={() => setExpandedKoota(isExpanded ? null : item.koota)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        item.hasDosha
                          ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60"
                          : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[var(--text-primary)]">{item.koota}</span>
                          {item.hasDosha && (
                            <span className="rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5">
                              Dosha
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-[var(--brand-primary)]">
                            {item.obtainedScore} / {item.maxScore}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-[var(--surface-hover)] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            item.hasDosha
                              ? "bg-rose-500"
                              : pct >= 75
                              ? "bg-emerald-400"
                              : pct >= 40
                              ? "bg-[var(--brand-primary)]"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
                        {item.interpretation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Dosha Information & Warnings */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold">Important Dosha Information</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                {/* Nadi Dosha */}
                <div
                  className={`p-4 rounded-2xl border ${
                    matchResult.doshaDetails.nadiDosha
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center justify-between">
                    <span>Nadi Dosha</span>
                    {matchResult.doshaDetails.nadiDosha ? (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">
                    {matchResult.doshaDetails.nadiDosha
                      ? "Present (Both partners share same Nadi). Remedial consultation recommended."
                      : "Absent. High physiological & progeny harmony."}
                  </p>
                </div>

                {/* Bhakoot Dosha */}
                <div
                  className={`p-4 rounded-2xl border ${
                    matchResult.doshaDetails.bhakootDosha
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center justify-between">
                    <span>Bhakoot Dosha</span>
                    {matchResult.doshaDetails.bhakootDosha ? (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">
                    {matchResult.doshaDetails.bhakootDosha
                      ? "Present. Requires conscious financial & domestic cooperation."
                      : "Absent. Auspicious financial & family harmony."}
                  </p>
                </div>

                {/* Mangal Dosha */}
                <div
                  className={`p-4 rounded-2xl border ${
                    matchResult.doshaDetails.mangalDosha.isCancelled
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : matchResult.doshaDetails.mangalDosha.person1HasDosha || matchResult.doshaDetails.mangalDosha.person2HasDosha
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center justify-between">
                    <span>Chandra Mangal</span>
                    {matchResult.doshaDetails.mangalDosha.isCancelled ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Info className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{matchResult.doshaDetails.mangalDosha.summary}</p>
                </div>
              </div>
            </div>

            {/* 5. Strengths & Considerations */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Strengths */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm sm:text-base font-bold text-emerald-400">Clear Compatibility Strengths</h3>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {matchResult.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Considerations */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-amber-400">Potential Considerations</h3>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {matchResult.concerns.length > 0 ? (
                    matchResult.concerns.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2 text-[var(--text-muted)]">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>No major astrological concerns identified for this match.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* 6. Traditional Vedic Astrology Disclaimer */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center text-xs text-[var(--text-muted)] space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-[var(--text-secondary)]">
                <BookOpen className="h-4 w-4 text-[var(--brand-gold)]" /> Traditional Vedic Astrology Disclaimer
              </div>
              <p className="max-w-3xl mx-auto leading-relaxed">{matchResult.disclaimer}</p>
            </div>
          </motion.div>
        ) : (
          /* INPUT FORM VIEW */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <form onSubmit={handleCalculateMatch} className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* PERSON 1 CARD */}
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-5 relative">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--brand-primary)]" />
                      <h3 className="font-bold text-base sm:text-lg">Person 1 Details</h3>
                    </div>
                    {userProfile && !prefilledP1 && (
                      <button
                        type="button"
                        onClick={handlePrefillPerson1}
                        className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                      >
                        <UserCheck className="h-3.5 w-3.5" /> Prefill My Profile
                      </button>
                    )}
                  </div>

                  {prefilledP1 && (
                    <div className="rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 px-3 py-2 text-xs text-[var(--brand-primary)] font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 shrink-0" /> Prefilled from your logged-in ConnectSoulmate profile
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter Person 1 Name"
                      value={person1.name}
                      onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Date of Birth *</span>
                      <span className="text-[10px] text-[var(--text-muted)]">YYYY-MM-DD</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={person1.dateOfBirth}
                        onChange={(e) => setPerson1({ ...person1, dateOfBirth: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Time of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Exact Time of Birth</span>
                      <span className="text-[10px] text-[var(--text-muted)]">24-Hr or AM/PM</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={person1.timeOfBirth}
                        onChange={(e) => setPerson1({ ...person1, timeOfBirth: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Birth Place */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Birth Place (City, State/Country)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, India"
                        value={person1.birthPlace}
                        onChange={(e) => setPerson1({ ...person1, birthPlace: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PERSON 2 CARD */}
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-5 relative">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--brand-gold)]" />
                      <h3 className="font-bold text-base sm:text-lg">Person 2 Details</h3>
                    </div>
                  </div>

                  {/* Quick Select from Shortlist / Candidates */}
                  {candidates.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--brand-gold)] flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current" /> Select from Shortlisted Profiles
                      </label>
                      <select
                        value={selectedCandidateId}
                        onChange={(e) => handleSelectCandidate(e.target.value)}
                        className="w-full rounded-xl border border-[var(--brand-gold)]/30 bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] transition focus:border-[var(--brand-gold)] focus:outline-none"
                      >
                        <option value="">-- Choose Shortlisted Match (Optional) --</option>
                        {candidates.map((c) => (
                          <option key={c.userId} value={String(c.userId)}>
                            {c.fullName} ({c.occupation || "Member"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter Person 2 Name"
                      value={person2.name}
                      onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Date of Birth *</span>
                      <span className="text-[10px] text-[var(--text-muted)]">YYYY-MM-DD</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={person2.dateOfBirth}
                      onChange={(e) => setPerson2({ ...person2, dateOfBirth: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Time of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Exact Time of Birth</span>
                      <span className="text-[10px] text-[var(--text-muted)]">24-Hr or AM/PM</span>
                    </label>
                    <input
                      type="time"
                      value={person2.timeOfBirth}
                      onChange={(e) => setPerson2({ ...person2, timeOfBirth: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Birth Place */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Birth Place (City, State/Country)</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi, India"
                      value={person2.birthPlace}
                      onChange={(e) => setPerson2({ ...person2, birthPlace: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Error Message */}
              {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading ? (
                    <span>Calculating Astronomical Alignment...</span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Calculate Kundali Compatibility</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
