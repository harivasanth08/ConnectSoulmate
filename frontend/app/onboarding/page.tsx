"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Interactive3DCard from "@/components/ui/Interactive3DCard";
import {
  User,
  MapPin,
  Heart,
  Users,
  GraduationCap,
  Sparkles,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  Upload,
  RefreshCw,
} from "lucide-react";
import { sanitizeAgeInput, formatAgeForForm, parseAgeForSubmit } from "@/lib/formatPreferences";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const INITIAL_INTERESTS = [
  "Art and Craft",
  "Board Games / Puzzles",
  "Cooking / Baking",
  "Fitness",
  "Gardening",
  "Learning Languages",
  "Movies and TV Shows",
  "Music",
  "Outdoor Activities",
  "Photography",
  "Reading",
  "Social Media",
  "Sports",
  "Traveling",
  "Volunteering",
  "Web Browsing",
  "Writing",
];

const STAR_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const LANGUAGES_LIST = [
  "Telugu",
  "English",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
];

const RELIGIONS_LIST = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Other",
];

const EDUCATION_OPTIONS = [
  "Diploma",
  "Doctorate",
  "Graduate",
  "Higher Secondary",
  "Postgraduate",
  "Primary",
  "Secondary",
  "Undergraduate",
];

const EMPLOYMENT_SECTORS = [
  "Business",
  "Government",
  "Private",
  "Self-employed",
  "Student",
  "Not currently employed",
  "Other",
];

const INCOME_RANGES = [
  "Below ₹2 Lakh",
  "₹2–5 Lakh",
  "₹5–10 Lakh",
  "₹10–20 Lakh",
  "₹20–30 Lakh",
  "₹30 Lakh+",
  "Prefer not to say",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [s1, setS1] = useState({
    displayName: "",
    gender: "",
    lookingFor: "Woman",
    dateOfBirth: "",
    age: null as number | null,
    starSign: "",
    aboutMe: "",
  });

  const [s2, setS2] = useState({
    city: "",
    state: "",
    country: "India",
    motherTongue: "Telugu",
    languagesSpoken: [] as string[],
    customLanguage: "",
    religion: "Hindu",
    community: "",
  });

  const [s3, setS3] = useState({
    myInterests: [] as string[],
    otherInterest: "",
    showOtherInterestInput: false,
    hobbies: [] as string[],
    newHobbyInput: "",
    lifestyle: "Vegetarian",
    heightCm: "",
    weightKg: "",
    disability: "No",
    disabilityDetails: "",
  });

  const [s4, setS4] = useState({
    familyType: "Nuclear Family",
    familyDetails: "",
    maritalStatus: "Never Married",
  });

  const [s5, setS5] = useState({
    highestEducation: "Graduate",
    employedIn: "Private",
    employmentDetails: "",
    annualIncome: "₹5–10 Lakh",
  });

  const [s6, setS6] = useState({
    minAge: 21,
    maxAge: 30,
    preferredLocation: "Any",
    preferredEducation: ["Graduate", "Postgraduate"],
    preferredReligion: ["Hindu"],
    preferredCaste: "Any",
    preferredMaritalStatus: ["Never Married"],
    preferredLifestyle: ["Vegetarian", "Any"],
    preferredEmploymentSector: ["Private", "Government", "Business"],
    preferredLanguages: ["Telugu", "English"],
    otherPreferences: "",
  });

  const [s7, setS7] = useState({
    profilePhoto: "",
    photos: [] as string[],
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("connectsoulmate_token");
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);

    async function loadOnboarding() {
      try {
        const res = await fetch(`${API_URL}/api/onboarding/state`, {
          headers: { Authorization: `Bearer ${t}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("connectsoulmate_token");
            router.replace("/login");
            return;
          }
          setError("Failed to load saved onboarding state.");
          return;
        }

        const data = await res.json();
        if (data.success && data.state) {
          const st = data.state;
          if (st.role === "parent") {
            router.replace("/parent/onboarding");
            return;
          }
          if (st.profileCompleted) {
            router.replace("/dashboard");
            return;
          }

          if (st.currentStep) {
            setCurrentStep(st.currentStep);
          }

          if (st.section1AboutYou) {
            setS1((prev) => ({ ...prev, ...st.section1AboutYou }));
          }
          if (st.section2WhereYouBelong) {
            setS2((prev) => ({
              ...prev,
              ...st.section2WhereYouBelong,
              languagesSpoken: st.section2WhereYouBelong.languagesSpoken || [],
            }));
          }
          if (st.section3Lifestyle) {
            setS3((prev) => ({
              ...prev,
              ...st.section3Lifestyle,
              myInterests: st.section3Lifestyle.myInterests || [],
              hobbies: st.section3Lifestyle.hobbies || [],
            }));
          }
          if (st.section4Family) {
            setS4((prev) => ({ ...prev, ...st.section4Family }));
          }
          if (st.section5EducationCareer) {
            setS5((prev) => ({ ...prev, ...st.section5EducationCareer }));
          }
          if (st.section6YourMatch) {
            setS6((prev) => ({ ...prev, ...st.section6YourMatch }));
          }
          if (st.section7YourStory) {
            setS7((prev) => ({
              ...prev,
              ...st.section7YourStory,
              photos: st.section7YourStory.photos || [],
            }));
          }
        }
      } catch (err) {
        console.error("Onboarding load error:", err);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadOnboarding();
  }, [router]);

  async function saveStepData(targetStep: number) {
    if (!token) return false;
    setSaving(true);
    setError("");

    let stepPayloadData: any = {};
    if (currentStep === 1) stepPayloadData = { section1AboutYou: s1 };
    else if (currentStep === 2) stepPayloadData = { section2WhereYouBelong: s2 };
    else if (currentStep === 3) stepPayloadData = { section3Lifestyle: s3 };
    else if (currentStep === 4) stepPayloadData = { section4Family: s4 };
    else if (currentStep === 5) stepPayloadData = { section5EducationCareer: s5 };
    else if (currentStep === 6) {
      const min = parseAgeForSubmit(s6.minAge) || 18;
      const max = parseAgeForSubmit(s6.maxAge) || 60;
      if (min > max) {
        setError("Preferred Minimum Age cannot be greater than Maximum Age.");
        setSaving(false);
        return false;
      }
      stepPayloadData = {
        section6YourMatch: {
          ...s6,
          minAge: min,
          maxAge: max,
        },
      };
    } else if (currentStep === 7) stepPayloadData = { section7YourStory: s7 };

    try {
      const payload = {
        stepNumber: targetStep,
        data: stepPayloadData,
      };

      const res = await fetch(`${API_URL}/api/onboarding/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save step details.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Save step error:", err);
      setError("Unable to save progress.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function validateCurrentStep(): boolean {
    setError("");
    if (currentStep === 1) {
      if (!s1.displayName.trim()) {
        setError("Please enter your Display Name.");
        return false;
      }
      if (!s1.lookingFor.trim()) {
        setError("Please select who you are looking for.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!s2.city.trim() || !s2.country.trim()) {
        setError("Please provide your City and Country.");
        return false;
      }
      if (!s2.motherTongue.trim()) {
        setError("Please select your Mother Tongue.");
        return false;
      }
    } else if (currentStep === 3) {
      if (s3.myInterests.length === 0) {
        setError("Please select at least one Interest.");
        return false;
      }
    } else if (currentStep === 4) {
      if (!s4.maritalStatus.trim()) {
        setError("Please select your Marital Status.");
        return false;
      }
    } else if (currentStep === 5) {
      if (!s5.highestEducation.trim()) {
        setError("Please select your Highest Education.");
        return false;
      }
    } else if (currentStep === 7) {
      if (!s7.profilePhoto.trim()) {
        setError("Please upload at least one valid Profile Photo.");
        return false;
      }
    }
    return true;
  }

  async function handleNext() {
    if (!validateCurrentStep()) return;
    const nextStep = currentStep + 1;
    const ok = await saveStepData(nextStep);
    if (ok) {
      setCurrentStep(nextStep);
    }
  }

  async function handlePrev() {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      await saveStepData(prevStep);
      setCurrentStep(prevStep);
    }
  }

  async function handleCompleteProfile() {
    if (!token) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to complete profile.");
        return;
      }

      // Update user in localStorage
      const cachedUser = localStorage.getItem("connectsoulmate_user");
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          parsed.profileCompleted = true;
          localStorage.setItem("connectsoulmate_user", JSON.stringify(parsed));
        } catch (e) {}
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error("Complete profile error:", err);
      setError("Unable to complete profile onboarding.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be 10 MB or smaller.");
      return;
    }

    setUploadingPhoto(true);
    setError("");

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const res = await fetch(`${API_URL}/api/profile/me/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to upload photo.");
        return;
      }

      const newPhotoUrl = data.profilePhoto || data.profile?.profilePhoto;
      if (newPhotoUrl) {
        setS7((prev) => {
          const updatedPhotos = [...prev.photos];
          if (!updatedPhotos.includes(newPhotoUrl)) {
            updatedPhotos.unshift(newPhotoUrl);
          }
          return {
            ...prev,
            profilePhoto: newPhotoUrl,
            photos: updatedPhotos,
          };
        });
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Unable to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[var(--brand-primary)]" />
          <p className="text-xs text-[var(--text-secondary)]">Loading your guided onboarding...</p>
        </div>
      </div>
    );
  }

  const stepsList = [
    { title: "About You", icon: User },
    { title: "Where You Belong", icon: MapPin },
    { title: "Your Lifestyle", icon: Heart },
    { title: "Your Family", icon: Users },
    { title: "Education & Career", icon: GraduationCap },
    { title: "Your Match", icon: Sparkles },
    { title: "Your Story", icon: Camera },
    { title: "Profile Ready", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="mx-auto max-w-4xl w-full space-y-6">
        {/* Top Header & Theme Toggle */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <Link href="/" className="inline-block shrink-0">
            <img
              src="/images/brand/connectsoulmate_logo.png"
              alt="ConnectSoulmate"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              Step {currentStep} of 8
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)]">
            <span>{stepsList[currentStep - 1].title}</span>
            <span>{Math.round((currentStep / 8) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>

          {/* Icon steps navigation */}
          <div className="grid grid-cols-8 gap-1 pt-2">
            {stepsList.map((st, idx) => {
              const IconComp = st.icon;
              const isActive = currentStep === idx + 1;
              const isPassed = currentStep > idx + 1;
              return (
                <div
                  key={st.title}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                    isActive
                      ? "bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)]"
                      : isPassed
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-[var(--surface-soft)] text-[var(--text-muted)] opacity-60"
                  }`}
                >
                  <IconComp className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px] hidden md:inline truncate font-medium">
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <Interactive3DCard>
          <div className="surface-card p-6 sm:p-8 space-y-6">
            {/* SECTION 1 — ABOUT YOU */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 1: About You
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Establish your core matrimonial identity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Display Name <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={s1.displayName}
                      onChange={(e) => setS1({ ...s1, displayName: e.target.value })}
                      placeholder="Name shown on profile"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* Registered Gender (Read Only) */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      I Am (Registered Gender) <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={s1.gender ? s1.gender.toUpperCase() : "REGISTERED GENDER"}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 px-3.5 py-2.5 text-xs text-[var(--text-muted)] cursor-not-allowed font-semibold"
                    />
                  </div>

                  {/* Looking For */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Looking For <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={s1.lookingFor}
                      onChange={(e) => setS1({ ...s1, lookingFor: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      <option value="Woman">Woman</option>
                      <option value="Man">Man</option>
                    </select>
                  </div>

                  {/* Derived Age */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Age (Derived from Date of Birth)
                    </label>
                    <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-bold">
                      {s1.age ? `Age: ${s1.age} yrs` : "Date of Birth verified"}
                    </div>
                  </div>

                  {/* Star Sign */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Star Sign (Zodiac) <span className="text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <select
                      value={s1.starSign}
                      onChange={(e) => setS1({ ...s1, starSign: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="">Select Star Sign</option>
                      {STAR_SIGNS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* About Me */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      About Me <span className="text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={s1.aboutMe}
                      onChange={(e) => setS1({ ...s1, aboutMe: e.target.value })}
                      placeholder="Describe your personality, background, and life goals..."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2 — WHERE YOU BELONG */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 2: Where You Belong
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Geographic, linguistic, and cultural background.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      City <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={s2.city}
                      onChange={(e) => setS2({ ...s2, city: e.target.value })}
                      placeholder="e.g. Hyderabad, Bengaluru"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={s2.state}
                      onChange={(e) => setS2({ ...s2, state: e.target.value })}
                      placeholder="e.g. Telangana, Karnataka"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Country <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={s2.country}
                      onChange={(e) => setS2({ ...s2, country: e.target.value })}
                      placeholder="e.g. India"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* Mother Tongue */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Mother Tongue <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={s2.motherTongue}
                      onChange={(e) => setS2({ ...s2, motherTongue: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      {LANGUAGES_LIST.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Religion
                    </label>
                    <select
                      value={s2.religion}
                      onChange={(e) => setS2({ ...s2, religion: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      {RELIGIONS_LIST.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Caste / Community */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Caste / Community <span className="text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={s2.community}
                      onChange={(e) => setS2({ ...s2, community: e.target.value })}
                      placeholder="e.g. Reddy, Brahmin, Kamma, Arya Vysya, etc."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* Languages Spoken (Multi Select) */}
                  <div className="sm:col-span-3 space-y-2">
                    <label className="block text-xs font-semibold text-[var(--text-primary)]">
                      Languages Spoken <span className="text-[var(--text-muted)]">(Multi-select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES_LIST.map((lang) => {
                        const isSelected = s2.languagesSpoken.includes(lang);
                        return (
                          <button
                            type="button"
                            key={lang}
                            onClick={() => {
                              const next = isSelected
                                ? s2.languagesSpoken.filter((l) => l !== lang)
                                : [...s2.languagesSpoken, lang];
                              setS2({ ...s2, languagesSpoken: next });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                              isSelected
                                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                                : "bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--brand-primary)]"
                            }`}
                          >
                            {isSelected ? "✓ " : ""}
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3 — YOUR LIFESTYLE */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 3: Your Lifestyle
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Everyday lifestyle choices, interests, hobbies, and physical attributes.
                  </p>
                </div>

                {/* My Interests (Mandatory Multi-select Checkboxes) */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">
                    My Interests <span className="text-pink-400">* (Select at least one)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {INITIAL_INTERESTS.map((interest) => {
                      const isChecked = s3.myInterests.includes(interest);
                      return (
                        <label
                          key={interest}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-[var(--brand-primary)]/15 border-[var(--brand-primary)] text-[var(--text-primary)] font-semibold"
                              : "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? s3.myInterests.filter((i) => i !== interest)
                                : [...s3.myInterests, interest];
                              setS3({ ...s3, myInterests: next });
                            }}
                            className="rounded accent-[var(--brand-primary)] h-4 w-4"
                          />
                          <span>{interest}</span>
                        </label>
                      );
                    })}

                    {/* Custom Other Interest */}
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        s3.showOtherInterestInput
                          ? "bg-[var(--brand-primary)]/15 border-[var(--brand-primary)] text-[var(--text-primary)] font-semibold"
                          : "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={s3.showOtherInterestInput}
                        onChange={(e) =>
                          setS3({ ...s3, showOtherInterestInput: e.target.checked })
                        }
                        className="rounded accent-[var(--brand-primary)] h-4 w-4"
                      />
                      <span>Other</span>
                    </label>
                  </div>

                  {s3.showOtherInterestInput && (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={s3.otherInterest}
                        onChange={(e) => setS3({ ...s3, otherInterest: e.target.value })}
                        placeholder="Enter custom interest..."
                        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            s3.otherInterest.trim() &&
                            !s3.myInterests.includes(s3.otherInterest.trim())
                          ) {
                            setS3({
                              ...s3,
                              myInterests: [...s3.myInterests, s3.otherInterest.trim()],
                              otherInterest: "",
                            });
                          }
                        }}
                        className="btn-primary text-xs px-4 py-2"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Hobbies (Chips) */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <label className="block text-xs font-semibold text-[var(--text-primary)]">
                    Hobbies <span className="text-[var(--text-muted)]">(Optional Chips)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {s3.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)]"
                      >
                        {hobby}
                        <button
                          type="button"
                          onClick={() =>
                            setS3({
                              ...s3,
                              hobbies: s3.hobbies.filter((h) => h !== hobby),
                            })
                          }
                          className="hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-sm pt-1">
                    <input
                      type="text"
                      value={s3.newHobbyInput}
                      onChange={(e) => setS3({ ...s3, newHobbyInput: e.target.value })}
                      placeholder="+ Add hobby"
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          s3.newHobbyInput.trim() &&
                          !s3.hobbies.includes(s3.newHobbyInput.trim())
                        ) {
                          setS3({
                            ...s3,
                            hobbies: [...s3.hobbies, s3.newHobbyInput.trim()],
                            newHobbyInput: "",
                          });
                        }
                      }}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lifestyle & Physical Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--border)]">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Lifestyle (Food Preference)
                    </label>
                    <select
                      value={s3.lifestyle}
                      onChange={(e) => setS3({ ...s3, lifestyle: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={s3.heightCm}
                      onChange={(e) => setS3({ ...s3, heightCm: e.target.value })}
                      placeholder="e.g. 172"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={s3.weightKg}
                      onChange={(e) => setS3({ ...s3, weightKg: e.target.value })}
                      placeholder="e.g. 68"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Disability
                    </label>
                    <select
                      value={s3.disability}
                      onChange={(e) => setS3({ ...s3, disability: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {s3.disability === "Yes" && (
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                        Disability Details <span className="text-[var(--text-muted)]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={s3.disabilityDetails}
                        onChange={(e) => setS3({ ...s3, disabilityDetails: e.target.value })}
                        placeholder="Provide details if comfortable..."
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4 — YOUR FAMILY */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 4: Your Family
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Family structure and matrimonial background.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Family Type */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Family Type
                    </label>
                    <select
                      value={s4.familyType}
                      onChange={(e) => setS4({ ...s4, familyType: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      <option value="Nuclear Family">Nuclear Family</option>
                      <option value="Joint Family">Joint Family</option>
                      <option value="Extended Family">Extended Family</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Marital Status <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={s4.maritalStatus}
                      onChange={(e) => setS4({ ...s4, maritalStatus: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Family Details */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Family Details <span className="text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={s4.familyDetails}
                      onChange={(e) => setS4({ ...s4, familyDetails: e.target.value })}
                      placeholder="Tell us about your parents, siblings, family values, or hometown..."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5 — EDUCATION & CAREER */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 5: Education &amp; Career
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Academic qualifications and professional achievements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Highest Education */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Highest Education <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={s5.highestEducation}
                      onChange={(e) => setS5({ ...s5, highestEducation: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      {EDUCATION_OPTIONS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employed In */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Employed In
                    </label>
                    <select
                      value={s5.employedIn}
                      onChange={(e) => setS5({ ...s5, employedIn: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      {EMPLOYMENT_SECTORS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Details */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Occupation / Job Details
                    </label>
                    <input
                      type="text"
                      value={s5.employmentDetails}
                      onChange={(e) => setS5({ ...s5, employmentDetails: e.target.value })}
                      placeholder="e.g. Software Engineer, Business Owner"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Annual Income Range
                    </label>
                    <select
                      value={s5.annualIncome}
                      onChange={(e) => setS5({ ...s5, annualIncome: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] font-semibold"
                    >
                      {INCOME_RANGES.map((inc) => (
                        <option key={inc} value={inc}>
                          {inc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6 — YOUR MATCH */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 6: Your Match
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Partner preferences for matching and AI compatibility insights.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min / Max Age Range */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Preferred Age Range: {s6.minAge ? `${s6.minAge} to ${s6.maxAge || 60} yrs` : "Flexible"}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        min={18}
                        max={80}
                        placeholder="18"
                        value={formatAgeForForm(s6.minAge)}
                        onChange={(e) => {
                          const sanitized = sanitizeAgeInput(e.target.value);
                          setS6({ ...s6, minAge: sanitized === "" ? ("" as unknown as number) : Number(sanitized) });
                        }}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                      />
                      <span className="text-xs text-[var(--text-muted)]">to</span>
                      <input
                        type="number"
                        min={18}
                        max={80}
                        placeholder="60"
                        value={formatAgeForForm(s6.maxAge)}
                        onChange={(e) => {
                          const sanitized = sanitizeAgeInput(e.target.value);
                          setS6({ ...s6, maxAge: sanitized === "" ? ("" as unknown as number) : Number(sanitized) });
                        }}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Preferred Location */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      value={s6.preferredLocation}
                      onChange={(e) =>
                        setS6({ ...s6, preferredLocation: e.target.value })
                      }
                      placeholder="e.g. Any, Hyderabad, USA"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>

                  {/* Other Preferences */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                      Other Partner Expectations <span className="text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={s6.otherPreferences}
                      onChange={(e) =>
                        setS6({ ...s6, otherPreferences: e.target.value })
                      }
                      placeholder="Shared values, career flexibility, living arrangements..."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7 — YOUR STORY */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    Section 7: Your Story &amp; Photo
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Upload at least one profile photo to present yourself.
                  </p>
                </div>

                {/* Photo Upload Area */}
                <div className="space-y-4">
                  {s7.profilePhoto ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)]">
                      <img
                        src={
                          s7.profilePhoto.startsWith("http")
                            ? s7.profilePhoto
                            : `${API_URL}${s7.profilePhoto}`
                        }
                        alt="Profile Photo"
                        className="h-32 w-32 object-cover rounded-2xl border-2 border-[var(--brand-primary)] shadow-md"
                      />
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Photo Uploaded &amp; Verified</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Your profile photo is ready for your matrimonial profile.
                        </p>
                        <label className="btn-secondary text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center space-y-4 hover:border-[var(--brand-primary)]/50 transition">
                      <div className="h-16 w-16 mx-auto rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                        <Camera className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                          Upload Your Profile Photo <span className="text-pink-400">*</span>
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          PNG, JPG, or WebP up to 10 MB.
                        </p>
                      </div>

                      <label className="btn-primary text-xs px-6 py-3 cursor-pointer inline-flex items-center gap-2">
                        {uploadingPhoto ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Uploading Photo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Select Photo File</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 8 — PROFILE READY */}
            {currentStep === 8 && (
              <div className="text-center py-6 space-y-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/25">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    Your ConnectSoulmate Profile is Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Now that we know more about you, ConnectSoulmate can help you discover people who share your core values, family background, and lifestyle alignment.
                  </p>
                </div>

                <div className="surface-panel p-5 rounded-2xl max-w-md mx-auto text-left space-y-2 border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                    Profile Summary Completed
                  </span>
                  <p className="text-xs text-[var(--text-primary)] font-semibold">
                    {s1.displayName} ({s1.gender}) — {s2.city}, {s2.country}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {s5.highestEducation} | {s4.maritalStatus} | {s2.motherTongue}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleCompleteProfile}
                    disabled={saving}
                    className="btn-primary text-sm px-8 py-3.5 shadow-xl shadow-pink-500/30"
                  >
                    {saving ? "Finalizing Profile..." : "Enter ConnectSoulmate"}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Steps 1 to 7) */}
            {currentStep < 8 && (
              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || saving}
                  className="btn-secondary text-xs px-4 py-2.5 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => saveStepData(currentStep)}
                    disabled={saving}
                    className="btn-ghost text-xs px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Save Progress
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
                    className="btn-primary text-xs px-6 py-2.5 flex items-center gap-1"
                  >
                    <span>{saving ? "Saving..." : "Continue"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
