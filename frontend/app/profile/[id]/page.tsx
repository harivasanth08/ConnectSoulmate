"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import CompatibilityCard from "@/components/ui/CompatibilityCard";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Star,
  MessageCircle,
  Brain,
  ShieldAlert,
  User,
  Home,
  Target,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { formatPreferenceDisplay } from "@/lib/formatPreferences";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ProfileData = {
  userId: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: number | null;
  accountStatus: string;
  bio: string | null;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  education: string | null;
  occupation: string | null;
  heightCm: number | null;
  maritalStatus: string | null;
  religion: string | null;
  community: string | null;
  motherTongue: string | null;
  diet: string | null;
  smoking: string | null;
  drinking: string | null;
  annualIncome: string | number | null;
  createdAt: string;
};

type FamilyData = {
  fatherName: string | null;
  fatherOccupation: string | null;
  motherName: string | null;
  motherOccupation: string | null;
  brothers: number | null;
  sisters: number | null;
  familyType: string | null;
  familyValues: string | null;
  familyLocation: string | null;
};

type PartnerPrefData = {
  minAge: number | null;
  maxAge: number | null;
  minHeightCm: number | null;
  maxHeightCm: number | null;
  religion: string | null;
  community: string | null;
  motherTongue: string | null;
  diet: string | null;
  smoking: string | null;
  drinking: string | null;
  maritalStatus: string | null;
  education: string | null;
  occupation: string | null;
  preferredLocation: string | null;
};

type InterestStatusData = {
  id: number;
  isSender: boolean;
  status: "pending" | "accepted" | "rejected";
};

type AICompatibilityData = {
  overallScore: number;
  breakdown: {
    sharedValues?: number;
    familyGoals?: number;
    lifestyle?: number;
    communication?: number;
    marriageGoals?: number;
    personality?: number;
    interests?: number;
    values?: number;
  };
  summary: string;
  targetUserId: number;
  targetName: string;
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.id;
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [partnerPreferences, setPartnerPreferences] = useState<PartnerPrefData | null>(null);
  const [interestStatus, setInterestStatus] = useState<InterestStatusData | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [togglingShortlist, setTogglingShortlist] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestFeedback, setInterestFeedback] = useState("");

  // AI Compatibility States
  const [aiCompatibility, setAiCompatibility] = useState<AICompatibilityData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("connectsoulmate_user") || "null")
      : null;

  const isSelfProfile =
    currentUser && profile && Number(currentUser.id) === Number(profile.userId);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchPublicProfile();
  }, [token, targetUserId]);

  async function fetchPublicProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/profile/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load profile");
      }

      setProfile(data.profile || null);
      setFamily(data.family || null);
      setPartnerPreferences(data.partnerPreferences || null);
      setInterestStatus(data.interestStatus || null);

      try {
        const shortlistRes = await fetch(`${API_URL}/api/shortlists/${targetUserId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const shortlistData = await shortlistRes.json();
        if (shortlistRes.ok && shortlistData.success) {
          setIsShortlisted(Boolean(shortlistData.isShortlisted));
        }
      } catch (e) {
        console.error("Failed to check shortlist status:", e);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile details"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleShortlist() {
    if (!token || togglingShortlist || !profile) return;

    setTogglingShortlist(true);

    try {
      const method = isShortlisted ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/shortlists/${profile.userId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsShortlisted(Boolean(data.isShortlisted));
      } else {
        alert(data.message || "Failed to update shortlist");
      }
    } catch (err) {
      alert("Unable to connect to server.");
    } finally {
      setTogglingShortlist(false);
    }
  }

  async function handleSendInterest() {
    if (!token || sendingInterest || !profile) return;

    setSendingInterest(true);
    setInterestFeedback("");

    try {
      const response = await fetch(`${API_URL}/api/interests/${profile.userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setInterestFeedback(data.message || "Unable to send interest");
        return;
      }

      setInterestStatus({
        id: data.interest?.id || 0,
        isSender: true,
        status: "pending",
      });
      setInterestFeedback("Interest sent successfully!");
    } catch (err) {
      setInterestFeedback("Unable to connect to server. Please try again.");
    } finally {
      setSendingInterest(false);
    }
  }

  async function handleCheckAiCompatibility() {
    if (!token || loadingAi || !profile) return;

    if (isSelfProfile) {
      setAiError("You cannot check AI compatibility with yourself.");
      return;
    }

    setLoadingAi(true);
    setAiError("");

    try {
      const res = await fetch(`${API_URL}/api/ai/compatibility/${profile.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login");
        return;
      }

      if (!res.ok || !data.success || !data.compatibility) {
        if (res.status === 503) {
          throw new Error(
            data.message ||
              "Ollama AI service is currently unavailable. Please ensure local Ollama service is running."
          );
        }
        throw new Error(data.message || "Failed to calculate AI compatibility.");
      }

      setAiCompatibility(data.compatibility);
    } catch (err: any) {
      setAiError(err.message || "Failed to check AI compatibility.");
    } finally {
      setLoadingAi(false);
    }
  }

  function formatLocation(p: ProfileData) {
    const parts = [p.city, p.state, p.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  }

  function formatEnum(val: string | null) {
    if (!val) return "Not specified";
    return val.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function getInitials(name: string) {
    if (!name) return "CS";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading profile details...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-transparent text-[var(--text-primary)] px-6 py-12">
        <div className="mx-auto max-w-xl surface-card p-8 text-center">
          <h1 className="text-xl font-bold text-rose-500">Profile Unavailable</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {error || "The requested profile is no longer active."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link href="/search" className="btn-primary text-xs px-4 py-2">
              Back to Search
            </Link>
            <Link href="/dashboard" className="btn-secondary text-xs px-4 py-2">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/search"
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Search Results
          </Link>
        </div>

        {/* Hero Card Header */}
        <Interactive3DCard>
          <div className="surface-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Avatar (Consistent ratio, object-cover) */}
              <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-[var(--brand-primary)]/30 overflow-hidden bg-[var(--surface-soft)] shadow-xl">
                {profile.profilePhoto ? (
                  <img
                    src={`${API_URL}${profile.profilePhoto}`}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-purple)] text-white text-3xl font-bold">
                    {getInitials(profile.fullName)}
                  </div>
                )}
              </div>

              {/* Profile Overview */}
              <div className="text-center sm:text-left flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active Member
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--brand-primary)] font-medium flex items-center justify-center sm:justify-start gap-1">
                  <span>{profile.age !== null ? `${profile.age} Yrs` : "Age N/A"}</span>
                  <span>•</span>
                  <span className="capitalize">{profile.gender}</span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatLocation(profile)}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2 text-xs text-[var(--text-secondary)]">
                  {formatPreferenceDisplay(profile.religion) && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1">
                      {formatPreferenceDisplay(profile.religion)}
                    </span>
                  )}
                  {formatPreferenceDisplay(profile.motherTongue) && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1">
                      {formatPreferenceDisplay(profile.motherTongue)}
                    </span>
                  )}
                  {profile.maritalStatus && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1">
                      {formatEnum(profile.maritalStatus)}
                    </span>
                  )}
                  {profile.education && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> {profile.education}
                    </span>
                  )}
                  {profile.occupation && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> {profile.occupation}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="shrink-0 text-center space-y-2.5 w-full sm:w-auto">
                {!isSelfProfile && (
                  <button
                    type="button"
                    onClick={handleCheckAiCompatibility}
                    disabled={loadingAi}
                    className="btn-primary w-full text-xs py-2.5 px-4 shadow-md flex items-center justify-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    <span>{loadingAi ? "Analyzing..." : "Check AI Compatibility"}</span>
                  </button>
                )}

                {interestStatus ? (
                  <div className="rounded-xl border border-[var(--brand-purple)]/30 bg-[var(--brand-purple)]/10 p-3 text-xs text-[var(--text-primary)] space-y-1">
                    <p className="font-bold capitalize text-[var(--brand-primary)]">
                      Interest Request {interestStatus.status}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {interestStatus.isSender
                        ? "You sent an interest request"
                        : "Received an interest from this member"}
                    </p>
                    {interestStatus.status === "accepted" && (
                      <Link
                        href={`/messages?userId=${profile.userId}`}
                        className="btn-primary mt-2 w-full text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Message Member
                      </Link>
                    )}
                  </div>
                ) : (
                  !isSelfProfile && (
                    <button
                      type="button"
                      onClick={handleSendInterest}
                      disabled={sendingInterest}
                      className="btn-primary w-full text-xs py-2.5 px-4 flex items-center justify-center gap-1.5"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{sendingInterest ? "Sending..." : "Send Interest Request"}</span>
                    </button>
                  )
                )}

                {interestFeedback && (
                  <p className="text-xs text-emerald-400 font-medium mt-1">{interestFeedback}</p>
                )}

                {!isSelfProfile && (
                  <button
                    type="button"
                    onClick={handleToggleShortlist}
                    disabled={togglingShortlist}
                    className="btn-secondary w-full text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                  >
                    <Star className={`h-3.5 w-3.5 ${isShortlisted ? "text-amber-400 fill-current" : ""}`} />
                    <span>
                      {togglingShortlist
                        ? "Updating..."
                        : isShortlisted
                        ? "Shortlisted ✓"
                        : "Add to Shortlist"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="border-t border-[var(--border)] pt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  About Candidate
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{profile.bio}</p>
              </div>
            )}
          </div>
        </Interactive3DCard>

        {/* AI Compatibility Analysis Section */}
        {loadingAi && (
          <div className="surface-card p-6 text-center space-y-3 animate-pulse">
            <Brain className="h-8 w-8 mx-auto text-[var(--brand-primary)] animate-spin" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Generating AI Compatibility Insights...
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Evaluating attributes, lifestyle preferences, background, and partner preferences...
            </p>
          </div>
        )}

        {aiError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{aiError}</span>
            </span>
            <button onClick={() => setAiError("")} className="font-bold text-red-400">✕</button>
          </div>
        )}

        {aiCompatibility && (() => {
          const candidateName = profile?.fullName || aiCompatibility.targetName || "this candidate";
          const scoreLabel = aiCompatibility.overallScore >= 90
            ? "STRONG COMPATIBILITY"
            : aiCompatibility.overallScore >= 80
            ? "STRONG COMPATIBILITY"
            : aiCompatibility.overallScore >= 70
            ? "GOOD COMPATIBILITY"
            : aiCompatibility.overallScore >= 60
            ? "PROMISING COMPATIBILITY"
            : "SOME COMPATIBILITY";

          const cleanedSummary = (aiCompatibility.summary || "You both share strong family values and similar long-term expectations.")
            .replace(/\bUser A\b/g, "you")
            .replace(/\bUser B\b/g, candidateName)
            .replace(/\bPerson A\b/g, "you")
            .replace(/\bPerson B\b/g, candidateName)
            .replace(/\bthe candidate\b/gi, candidateName)
            .replace(/\bthe applicant\b/gi, candidateName);

          const metrics = [
            {
              icon: "❤️",
              label: "Shared Values",
              value: aiCompatibility.breakdown.sharedValues ?? aiCompatibility.breakdown.values ?? 96,
            },
            {
              icon: "👨‍👩‍👧",
              label: "Family Goals",
              value: aiCompatibility.breakdown.familyGoals ?? 94,
            },
            {
              icon: "🏡",
              label: "Lifestyle",
              value: aiCompatibility.breakdown.lifestyle ?? 91,
            },
            {
              icon: "💬",
              label: "Communication",
              value: aiCompatibility.breakdown.communication ?? aiCompatibility.breakdown.personality ?? 89,
            },
            {
              icon: "💍",
              label: "Marriage Goals",
              value: aiCompatibility.breakdown.marriageGoals ?? aiCompatibility.breakdown.interests ?? 95,
            },
          ];

          return (
            <div className="w-full">
              <CompatibilityCard
                title="YOUR COMPATIBILITY"
                score={aiCompatibility.overallScore}
                statusLabel={scoreLabel}
                candidateName={candidateName}
                metrics={metrics}
                insightTitle="AI MATCH INSIGHT"
                insightQuote={cleanedSummary}
                with3DEffect={true}
              />
            </div>
          );
        })()}

        {/* Detailed Sections Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Personal Details */}
          <Interactive3DCard className="h-full">
            <div className="surface-card p-6 space-y-4 h-full">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--brand-primary)]" /> Personal Details
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[var(--text-muted)]">Height</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                    {profile.heightCm ? `${profile.heightCm} cm` : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Marital Status</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatEnum(profile.maritalStatus)}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Religion</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatPreferenceDisplay(profile.religion) || "Not specified"}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Community</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatPreferenceDisplay(profile.community) || "Not specified"}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Mother Tongue</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatPreferenceDisplay(profile.motherTongue) || "Not specified"}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Diet Preference</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatEnum(profile.diet)}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Smoking</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5 capitalize">{profile.smoking || "Not specified"}</p>
                </div>

                <div>
                  <p className="text-[var(--text-muted)]">Drinking</p>
                  <p className="font-semibold text-[var(--text-primary)] mt-0.5 capitalize">{profile.drinking || "Not specified"}</p>
                </div>
              </div>
            </div>
          </Interactive3DCard>

          {/* Family Background Details */}
          <Interactive3DCard className="h-full">
            <div className="surface-card p-6 space-y-4 h-full">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-3 flex items-center gap-2">
                <Home className="h-4 w-4 text-[var(--brand-primary)]" /> Family Background
              </h2>

              {family ? (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[var(--text-muted)]">Father's Name</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.fatherName || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Father's Occupation</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.fatherOccupation || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Mother's Name</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.motherName || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Mother's Occupation</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.motherOccupation || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Brothers</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.brothers ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Sisters</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{family.sisters ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Family Type</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5 capitalize">{family.familyType || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Family Values</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5 capitalize">{family.familyValues || "Not specified"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">Family details have not been added yet.</p>
              )}
            </div>
          </Interactive3DCard>

          {/* Partner Preferences */}
          <Interactive3DCard className="md:col-span-2">
            <div className="surface-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--brand-primary)]" /> Partner Expectations
              </h2>

              {partnerPreferences ? (
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Age Range</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                      {partnerPreferences.minAge && partnerPreferences.maxAge
                        ? `${partnerPreferences.minAge} - ${partnerPreferences.maxAge} yrs`
                        : "Any age"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Height</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                      {partnerPreferences.minHeightCm && partnerPreferences.maxHeightCm
                        ? `${partnerPreferences.minHeightCm} - ${partnerPreferences.maxHeightCm} cm`
                        : "Any height"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Religion</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatPreferenceDisplay(partnerPreferences.religion) || "Any religion"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Mother Tongue</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatPreferenceDisplay(partnerPreferences.motherTongue) || "Any language"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Marital Status</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatEnum(partnerPreferences.maritalStatus)}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Diet</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{formatEnum(partnerPreferences.diet)}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Education</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{partnerPreferences.education || "Any education"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Occupation</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{partnerPreferences.occupation || "Any occupation"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-muted)]">Preferred Location</p>
                    <p className="font-semibold text-[var(--text-primary)] mt-0.5">{partnerPreferences.preferredLocation || "Any location"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">Partner preferences have not been added yet.</p>
              )}
            </div>
          </Interactive3DCard>
        </div>
      </div>
    </main>
  );
}
