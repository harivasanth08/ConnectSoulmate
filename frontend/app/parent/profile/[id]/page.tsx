"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  ArrowLeft,
  Heart,
  Star,
  MessageCircle,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Home,
  CheckCircle2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { formatPreferenceDisplay } from "@/lib/formatPreferences";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ProfileData = {
  userId: number;
  fullName: string;
  accountHolderName?: string;
  gender: string;
  dateOfBirth: string;
  age: number | null;
  accountStatus: string;
  role?: string;
  parentRelationship?: string;
  managedBy?: string;
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
  aboutFamily: string | null;
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

export default function ParentProfileViewPage({
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

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login?mode=parent");
      return;
    }

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
          router.replace("/login?mode=parent");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load candidate profile");
        }

        setProfile(data.profile || null);
        setFamily(data.family || null);
        setPartnerPreferences(data.partnerPreferences || null);
        setInterestStatus(data.interestStatus || null);
        setIsShortlisted(Boolean(data.isShortlisted));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load candidate profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [token, targetUserId, router]);

  async function handleSendInterest() {
    if (!token || sendingInterest) return;

    try {
      setSendingInterest(true);
      setInterestFeedback("");

      const response = await fetch(`${API_URL}/api/interests/${targetUserId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setInterestFeedback(data.message || "Failed to send family interest.");
        return;
      }

      setInterestStatus({
        id: data.interest?.id || 0,
        isSender: true,
        status: "pending",
      });
      setInterestFeedback("Family interest expressed successfully!");
    } catch {
      setInterestFeedback("Network error. Please try again.");
    } finally {
      setSendingInterest(false);
    }
  }

  async function handleToggleShortlist() {
    if (!token || togglingShortlist) return;

    try {
      setTogglingShortlist(true);
      const method = isShortlisted ? "DELETE" : "POST";

      const response = await fetch(`${API_URL}/api/shortlists/${targetUserId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsShortlisted(!isShortlisted);
      }
    } catch (e) {
      console.error("Shortlist error:", e);
    } finally {
      setTogglingShortlist(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
          <p className="text-xs text-[var(--text-secondary)]">Loading candidate & family details...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
        <HeaderNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-400">{error || "Profile not found"}</p>
          <Link href="/parent/search" className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Matches</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] pb-16">
      <HeaderNav />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/parent/search"
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Discovery</span>
          </Link>

          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Family Evaluation View</span>
          </span>
        </div>

        {/* Hero Card */}
        <div className="surface-card p-6 sm:p-8 border border-[var(--border)] relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo */}
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-2 border-[var(--border)] shrink-0 bg-[var(--surface-soft)]">
                {resolveProfileImageUrl(profile.profilePhoto) ? (
                  <img
                    src={resolveProfileImageUrl(profile.profilePhoto)!}
                    alt={profile.fullName}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-1">
                    <Users className="h-8 w-8" />
                    <span className="text-[10px]">Photo On Request</span>
                  </div>
                )}
              </div>

              {/* Title & Key Attributes */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                    {profile.managedBy || (profile.role === "parent" ? "Managed by Family" : "Direct Candidate")}
                  </span>
                  {family?.familyType && (
                    <span className="bg-[var(--brand-primary)]/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {family.familyType}
                    </span>
                  )}
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Profile</span>
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {profile.fullName}
                  {profile.age ? `, ${profile.age} yrs` : ""}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                  {(profile.city || profile.state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                      <span>{[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}</span>
                    </span>
                  )}
                  {profile.occupation && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>{profile.occupation}</span>
                    </span>
                  )}
                  {formatPreferenceDisplay(profile.religion) && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      <span>{[formatPreferenceDisplay(profile.religion), formatPreferenceDisplay(profile.community)].filter(Boolean).join(" • ")}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleToggleShortlist}
                disabled={togglingShortlist}
                className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5"
              >
                <Star
                  className={`h-4 w-4 ${
                    isShortlisted
                      ? "fill-amber-400 text-amber-400"
                      : "text-[var(--text-muted)]"
                  }`}
                />
                <span>{isShortlisted ? "Saved in Shortlist" : "Shortlist for Discussion"}</span>
              </button>

              {interestStatus?.status === "accepted" ? (
                <Link
                  href={`/parent/messages?userId=${targetUserId}`}
                  className="btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open Family Conversation</span>
                </Link>
              ) : (
                <button
                  onClick={handleSendInterest}
                  disabled={sendingInterest || interestStatus?.status === "pending"}
                  className={`text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    interestStatus?.status === "pending"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                      : "btn-primary"
                  }`}
                >
                  {interestStatus?.status === "pending" ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Family Interest Sent</span>
                    </>
                  ) : sendingInterest ? (
                    <span>Sending Interest...</span>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      <span>Express Family Interest</span>
                    </>
                  )}
                </button>
              )}

              <Link
                href="/kundali"
                className="btn-secondary text-xs px-4 py-2 flex items-center justify-center gap-1.5 text-amber-400 hover:text-amber-300"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kundali Match with Child</span>
              </Link>
            </div>
          </div>

          {interestFeedback && (
            <p className="text-xs text-emerald-400 font-medium mt-3 pt-3 border-t border-[var(--border)]">
              {interestFeedback}
            </p>
          )}
        </div>

        {/* SECTION 1: ABOUT THE CANDIDATE (ABOUT THE PERSON) */}
        <div className="surface-card p-6 border border-[var(--border)] space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Users className="h-4 w-4 text-[var(--brand-primary)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Section 1: About the Candidate
            </h2>
          </div>

          {profile.bio && (
            <div className="surface-panel p-4 space-y-1 rounded-xl">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Personal Statement & Bio
              </span>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{profile.bio}&rdquo;
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Education</span>
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                {profile.education || "Not specified"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Occupation</span>
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                {profile.occupation || "Not specified"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Annual Income</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {profile.annualIncome ? `₹${profile.annualIncome}` : "Disclosed to Family on Request"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Height</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {profile.heightCm ? `${profile.heightCm} cm` : "Not specified"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Marital Status</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {profile.maritalStatus?.replace(/_/g, " ") || "Never Married"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Diet / Lifestyle</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {profile.diet || "Vegetarian"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Mother Tongue</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatPreferenceDisplay(profile.motherTongue) || "Not specified"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Religion & Community</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {[formatPreferenceDisplay(profile.religion), formatPreferenceDisplay(profile.community)].filter(Boolean).join(" • ") || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: ABOUT THE FAMILY (FAMILY BACKGROUND) */}
        <div className="surface-card p-6 border border-[var(--border)] space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Home className="h-4 w-4 text-[var(--brand-primary)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Section 2: Family Background & Heritage
            </h2>
          </div>

          {family?.aboutFamily && (
            <div className="surface-panel p-4 space-y-1 rounded-xl bg-[var(--surface-soft)]">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                About the Family Culture & Values
              </span>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{family.aboutFamily}&rdquo;
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Family Type</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {family?.familyType || "Nuclear Family"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Family Values</span>
              <span className="font-semibold text-[var(--text-primary)] capitalize">
                {family?.familyValues || "Moderate"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Native / Family Location</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {family?.familyLocation || profile.city || "Not specified"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Father&apos;s Name & Profession</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {family?.fatherName
                  ? `${family.fatherName} (${family.fatherOccupation || "Employed/Retired"})`
                  : family?.fatherOccupation || "Employed / Business"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Mother&apos;s Name & Profession</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {family?.motherName
                  ? `${family.motherName} (${family.motherOccupation || "Homemaker"})`
                  : family?.motherOccupation || "Homemaker"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Brothers</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {family?.brothers !== null && family?.brothers !== undefined
                  ? `${family.brothers} Brother${family.brothers === 1 ? "" : "s"}`
                  : "0"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Sisters</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {family?.sisters !== null && family?.sisters !== undefined
                  ? `${family.sisters} Sister${family.sisters === 1 ? "" : "s"}`
                  : "0"}
              </span>
            </div>

            <div className="surface-panel p-3.5 rounded-xl space-y-1">
              <span className="text-[var(--text-muted)] block">Family Verification</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Direct Contact Verified
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: WHAT THEY ARE LOOKING FOR (PARTNER PREFERENCES) */}
        {partnerPreferences && (
          <div className="surface-card p-6 border border-[var(--border)] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3">
              Partner Preferences Expected by Candidate & Family
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="surface-panel p-3 rounded-xl space-y-0.5">
                <span className="text-[var(--text-muted)] block">Preferred Age Range</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {partnerPreferences.minAge && partnerPreferences.maxAge
                    ? `${partnerPreferences.minAge} – ${partnerPreferences.maxAge} yrs`
                    : "Flexible"}
                </span>
              </div>

              <div className="surface-panel p-3 rounded-xl space-y-0.5">
                <span className="text-[var(--text-muted)] block">Preferred Religion / Caste</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {[formatPreferenceDisplay(partnerPreferences.religion), formatPreferenceDisplay(partnerPreferences.community)].filter(Boolean).join(" • ") || "Any"}
                </span>
              </div>

              <div className="surface-panel p-3 rounded-xl space-y-0.5">
                <span className="text-[var(--text-muted)] block">Preferred Location</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {partnerPreferences.preferredLocation || "Any"}
                </span>
              </div>

              <div className="surface-panel p-3 rounded-xl space-y-0.5">
                <span className="text-[var(--text-muted)] block">Preferred Diet</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {partnerPreferences.diet || "Any"}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
