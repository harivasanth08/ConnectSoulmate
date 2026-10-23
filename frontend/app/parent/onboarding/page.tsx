"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  Users,
  User,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Sliders,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  AlertCircle,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";
import { sanitizeAgeInput, formatAgeForForm, parseAgeForSubmit } from "@/lib/formatPreferences";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  "B.Tech / B.E.",
  "M.Tech / M.E.",
  "BCA / MCA",
  "B.Sc / M.Sc",
  "B.Com / M.Com",
  "BBA / MBA",
  "MBBS / MD",
  "CA / CS",
  "Doctorate / Ph.D.",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Other",
];

const EMPLOYMENT_SECTORS = [
  "Software / IT",
  "Private Company",
  "Government / Public Sector",
  "Business / Self-Employed",
  "Civil Services",
  "Medical / Healthcare",
  "Banking / Financial",
  "Education / Academia",
  "Other",
];

function ParentOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam ? Math.max(1, Math.min(5, Number(stepParam))) : 1
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Step 1: Who are you looking for?
  const [relationship, setRelationship] = useState<"son" | "daughter">("son");
  const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState("");

  // Step 2: Child Profile Setup
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [motherTongue, setMotherTongue] = useState("Telugu");
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(["Telugu", "English"]);
  const [religion, setReligion] = useState("Hindu");
  const [community, setCommunity] = useState("");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [education, setEducation] = useState("B.Tech / B.E.");
  const [employedIn, setEmployedIn] = useState("Software / IT");
  const [occupation, setOccupation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [diet, setDiet] = useState("Vegetarian");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Step 3: Partner Preferences
  const [prefMinAge, setPrefMinAge] = useState<number | "">(21);
  const [prefMaxAge, setPrefMaxAge] = useState<number | "">(30);
  const [prefLocation, setPrefLocation] = useState("Any");
  const [prefEducation, setPrefEducation] = useState<string[]>([]);
  const [prefReligion, setPrefReligion] = useState<string[]>(["Hindu"]);
  const [prefCommunity, setPrefCommunity] = useState("Any");
  const [prefMaritalStatus, setPrefMaritalStatus] = useState<string[]>(["Never Married"]);
  const [prefDiet, setPrefDiet] = useState<string[]>(["Vegetarian"]);
  const [prefOccupation, setPrefOccupation] = useState<string[]>([]);
  const [prefLanguages, setPrefLanguages] = useState<string[]>(["Telugu"]);
  const [prefNotes, setPrefNotes] = useState("");

  // Step 4: Family Details
  const [familyType, setFamilyType] = useState("Nuclear Family");
  const [familyLocation, setFamilyLocation] = useState("");
  const [familyValues, setFamilyValues] = useState("moderate");
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [brothers, setBrothers] = useState<number | string>("");
  const [sisters, setSisters] = useState<number | string>("");
  const [aboutFamily, setAboutFamily] = useState("");

  // Load existing onboarding state
  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) {
      router.replace("/parent/login");
      return;
    }

    async function loadState() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/parent/onboarding/state`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("connectsoulmate_token");
          router.replace("/parent/login");
          return;
        }

        const data = await res.json();
        if (data.success && data.state) {
          const s = data.state;

          if (s.profileCompleted && !stepParam) {
            router.replace("/parent/dashboard");
            return;
          }

          if (!stepParam && s.currentStep) {
            setCurrentStep(Math.max(1, Math.min(5, s.currentStep)));
          }

          // Step 1
          if (s.whoAreYouLookingFor) {
            setRelationship(s.whoAreYouLookingFor.relationship || "son");
            setChildName(s.whoAreYouLookingFor.childName || "");
            setChildDob(s.whoAreYouLookingFor.childDateOfBirth || "");
          }

          // Step 2
          if (s.childProfile) {
            if (s.childProfile.name) setChildName(s.childProfile.name);
            if (s.childProfile.dateOfBirth) setChildDob(s.childProfile.dateOfBirth);
            if (s.childProfile.city) setCity(s.childProfile.city);
            if (s.childProfile.state) setState(s.childProfile.state);
            if (s.childProfile.country) setCountry(s.childProfile.country);
            if (s.childProfile.motherTongue) setMotherTongue(s.childProfile.motherTongue);
            if (s.childProfile.languagesSpoken?.length) setLanguagesSpoken(s.childProfile.languagesSpoken);
            if (s.childProfile.religion) setReligion(s.childProfile.religion);
            if (s.childProfile.community) setCommunity(s.childProfile.community);
            if (s.childProfile.heightCm) setHeightCm(String(s.childProfile.heightCm));
            if (s.childProfile.weightKg) setWeightKg(String(s.childProfile.weightKg));
            if (s.childProfile.maritalStatus) setMaritalStatus(s.childProfile.maritalStatus);
            if (s.childProfile.education) setEducation(s.childProfile.education);
            if (s.childProfile.employedIn) setEmployedIn(s.childProfile.employedIn);
            if (s.childProfile.occupation) setOccupation(s.childProfile.occupation);
            if (s.childProfile.annualIncome) setAnnualIncome(s.childProfile.annualIncome);
            if (s.childProfile.diet) setDiet(s.childProfile.diet);
            if (s.childProfile.bio) setBio(s.childProfile.bio);
            if (s.childProfile.profilePhoto) setProfilePhoto(s.childProfile.profilePhoto);
            if (s.childProfile.photos?.length) setPhotos(s.childProfile.photos);
          }

          // Step 3
          if (s.partnerPreferences) {
            if (s.partnerPreferences.minAge) setPrefMinAge(s.partnerPreferences.minAge);
            if (s.partnerPreferences.maxAge) setPrefMaxAge(s.partnerPreferences.maxAge);
            if (s.partnerPreferences.preferredEducation) {
              setPrefEducation(Array.isArray(s.partnerPreferences.preferredEducation) ? s.partnerPreferences.preferredEducation : [s.partnerPreferences.preferredEducation]);
            }
            if (s.partnerPreferences.preferredReligion) {
              setPrefReligion(Array.isArray(s.partnerPreferences.preferredReligion) ? s.partnerPreferences.preferredReligion : [s.partnerPreferences.preferredReligion]);
            }
            if (s.partnerPreferences.preferredCaste) setPrefCommunity(s.partnerPreferences.preferredCaste);
            if (s.partnerPreferences.preferredMaritalStatus) {
              setPrefMaritalStatus(Array.isArray(s.partnerPreferences.preferredMaritalStatus) ? s.partnerPreferences.preferredMaritalStatus : [s.partnerPreferences.preferredMaritalStatus]);
            }
            if (s.partnerPreferences.preferredLifestyle) {
              setPrefDiet(Array.isArray(s.partnerPreferences.preferredLifestyle) ? s.partnerPreferences.preferredLifestyle : [s.partnerPreferences.preferredLifestyle]);
            }
            if (s.partnerPreferences.preferredLanguages) {
              setPrefLanguages(Array.isArray(s.partnerPreferences.preferredLanguages) ? s.partnerPreferences.preferredLanguages : [s.partnerPreferences.preferredLanguages]);
            }
            if (s.partnerPreferences.otherPreferences) setPrefNotes(s.partnerPreferences.otherPreferences);
          }

          // Step 4
          if (s.familyDetails) {
            if (s.familyDetails.familyType) setFamilyType(s.familyDetails.familyType);
            if (s.familyDetails.familyLocation) setFamilyLocation(s.familyDetails.familyLocation);
            if (s.familyDetails.familyValues) setFamilyValues(s.familyDetails.familyValues);
            if (s.familyDetails.fatherName) setFatherName(s.familyDetails.fatherName);
            if (s.familyDetails.fatherOccupation) setFatherOccupation(s.familyDetails.fatherOccupation);
            if (s.familyDetails.motherName) setMotherName(s.familyDetails.motherName);
            if (s.familyDetails.motherOccupation) setMotherOccupation(s.familyDetails.motherOccupation);
            if (s.familyDetails.brothers !== "" && s.familyDetails.brothers !== undefined) setBrothers(s.familyDetails.brothers);
            if (s.familyDetails.sisters !== "" && s.familyDetails.sisters !== undefined) setSisters(s.familyDetails.sisters);
            if (s.familyDetails.aboutFamily) setAboutFamily(s.familyDetails.aboutFamily);
          }
        }
      } catch (err) {
        console.error("Failed to load parent onboarding state:", err);
      } finally {
        setLoading(false);
      }
    }

    loadState();
  }, [router, stepParam]);

  // Handle Photo Upload
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;

    setUploadingPhoto(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const res = await fetch(`${API_URL}/api/profile/me/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.profilePhoto) {
        setProfilePhoto(data.profilePhoto);
        setPhotos((prev) => [data.profilePhoto, ...prev.filter((p) => p !== data.profilePhoto)]);
        setSuccessNotice("Photo uploaded successfully!");
        setTimeout(() => setSuccessNotice(""), 3000);
      } else {
        setError(data.message || "Failed to upload photo.");
      }
    } catch (err) {
      setError("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Save Step
  async function saveStep(targetStep: number, nextStep?: number) {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;

    setSaving(true);
    setError("");

    try {
      let payload: any = { stepNumber: targetStep };

      if (targetStep === 1) {
        if (!childName.trim()) {
          setError("Please enter your child's full name.");
          setSaving(false);
          return false;
        }
        payload.whoAreYouLookingFor = {
          relationship,
          childName: childName.trim(),
          childGender: relationship === "daughter" ? "female" : "male",
          childDateOfBirth: childDob || "1998-01-01",
        };
      } else if (targetStep === 2) {
        if (!city.trim()) {
          setError("Please enter your child's city of residence.");
          setSaving(false);
          return false;
        }
        payload.childProfile = {
          name: childName.trim(),
          gender: relationship === "daughter" ? "female" : "male",
          dateOfBirth: childDob || "1998-01-01",
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          motherTongue,
          languagesSpoken,
          religion,
          community: community.trim(),
          heightCm,
          weightKg,
          maritalStatus,
          education,
          employedIn,
          occupation: occupation.trim(),
          annualIncome,
          diet,
          bio: bio.trim(),
          profilePhoto,
          photos,
        };
      } else if (targetStep === 3) {
        const min = parseAgeForSubmit(prefMinAge) || 18;
        const max = parseAgeForSubmit(prefMaxAge) || 60;
        if (min > max) {
          setError("Preferred Minimum Age cannot be greater than Maximum Age.");
          setSaving(false);
          return;
        }
        payload.partnerPreferences = {
          minAge: min,
          maxAge: max,
          preferredLocation: prefLocation,
          preferredEducation: prefEducation,
          preferredReligion: prefReligion,
          preferredCaste: prefCommunity,
          preferredMaritalStatus: prefMaritalStatus,
          preferredLifestyle: prefDiet,
          preferredEmploymentSector: prefOccupation,
          preferredLanguages: prefLanguages,
          otherPreferences: prefNotes.trim(),
        };
      } else if (targetStep === 4) {
        payload.familyDetails = {
          familyType,
          familyLocation: familyLocation.trim(),
          familyValues,
          fatherName: fatherName.trim(),
          fatherOccupation: fatherOccupation.trim(),
          motherName: motherName.trim(),
          motherOccupation: motherOccupation.trim(),
          brothers,
          sisters,
          aboutFamily: aboutFamily.trim(),
        };
      }

      const res = await fetch(`${API_URL}/api/parent/onboarding/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save details. Please try again.");
        return false;
      }

      if (nextStep) {
        setCurrentStep(nextStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return true;
    } catch (err) {
      setError("Network connection error. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  // Finalize Onboarding
  async function handleFinalize() {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/parent/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to complete onboarding. Please verify required fields.");
        return;
      }

      // Update local storage user profileCompleted
      const storedUser = localStorage.getItem("connectsoulmate_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          u.profileCompleted = true;
          localStorage.setItem("connectsoulmate_user", JSON.stringify(u));
        } catch (e) {}
      }

      router.replace("/parent/dashboard");
    } catch (err) {
      setError("Unable to complete profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-xs text-[var(--text-secondary)]">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-amber-500 border-r-transparent" />
          <p>Loading family onboarding workspace...</p>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: "Looking For", icon: Users },
    { num: 2, label: "Child Profile", icon: User },
    { num: 3, label: "Preferences", icon: Sliders },
    { num: 4, label: "Family Details", icon: Home },
    { num: 5, label: "Preview", icon: Eye },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block">
            <img
              src="/images/brand/connectsoulmate_logo.png"
              alt="ConnectSoulmate"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Parent Mode Onboarding
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="surface-card p-4 shadow-md">
          <div className="flex items-center justify-between">
            {stepsList.map((st) => {
              const Icon = st.icon;
              const isDone = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num < currentStep) setCurrentStep(st.num);
                  }}
                  className={`flex flex-col items-center gap-1.5 transition ${
                    isCurrent
                      ? "text-amber-400 font-bold"
                      : isDone
                      ? "text-emerald-400 font-semibold cursor-pointer"
                      : "text-[var(--text-muted)] cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition ${
                      isCurrent
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-md scale-105"
                        : isDone
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:inline text-[11px]">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Feedback */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* STEP 1: WHO ARE YOU LOOKING FOR? */}
        {currentStep === 1 && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Who are you looking for?
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Tell us who you're helping find a life partner.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRelationship("son")}
                  className={`p-6 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-3 ${
                    relationship === "son"
                      ? "border-amber-400 bg-amber-500/10 text-amber-300 shadow-lg scale-[1.01]"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">My Son</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Looking for a suitable bride</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRelationship("daughter")}
                  className={`p-6 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-3 ${
                    relationship === "daughter"
                      ? "border-amber-400 bg-amber-500/10 text-amber-300 shadow-lg scale-[1.01]"
                      : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                    <Heart className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">My Daughter</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Looking for a suitable groom</p>
                  </div>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    {relationship === "daughter" ? "Daughter's Full Name" : "Son's Full Name"} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter full legal or matrimonial name"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={childDob}
                    onChange={(e) => setChildDob(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={saving || !childName.trim()}
                  onClick={() => saveStep(1, 2)}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 disabled:opacity-50"
                >
                  <span>{saving ? "Saving..." : "Continue to Child Profile"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Interactive3DCard>
        )}

        {/* STEP 2: CHILD PROFILE SETUP */}
        {currentStep === 2 && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Child Matrimonial Profile
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Provide background, education, and career details for {childName || "your child"}.
                </p>
              </div>

              {/* Photo Upload Section */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-amber-400 bg-[var(--surface)] shrink-0 flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto.startsWith("http") ? profilePhoto : `${API_URL}${profilePhoto}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-[var(--text-muted)]" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    Upload Matrimonial Photo
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Add a clear front-facing photograph of your {relationship}. High quality photos receive 5x more interest.
                  </p>
                  <div>
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 cursor-pointer transition">
                      <Camera className="h-3.5 w-3.5" />
                      <span>{uploadingPhoto ? "Uploading..." : "Select Photograph"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    City of Residence <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Telangana"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Religion & Community */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Religion
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    {RELIGIONS_LIST.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Community / Caste
                  </label>
                  <input
                    type="text"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder="e.g. Brahmin, Reddy, Arya Vysya, etc."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Mother Tongue & Languages */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Mother Tongue <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={motherTongue}
                    onChange={(e) => setMotherTongue(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    {LANGUAGES_LIST.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Marital Status
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                {/* Education & Career */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Highest Education
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    {EDUCATION_OPTIONS.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Employed In
                  </label>
                  <select
                    value={employedIn}
                    onChange={(e) => setEmployedIn(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    {EMPLOYMENT_SECTORS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Occupation / Job Title
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Senior Software Architect"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Height (in cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* About Bio */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  About {childName || "the Candidate"}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief overview of your child's personality, values, and lifestyle..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                />
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary py-2.5 px-5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={saving || !city.trim()}
                  onClick={() => saveStep(2, 3)}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 disabled:opacity-50"
                >
                  <span>{saving ? "Saving..." : "Continue to Partner Preferences"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Interactive3DCard>
        )}

        {/* STEP 3: PARTNER PREFERENCES */}
        {currentStep === 3 && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Partner Preferences
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Specify preferences for your child's prospective life partner.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Range */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Preferred Minimum Age
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    placeholder="18"
                    value={formatAgeForForm(prefMinAge)}
                    onChange={(e) => {
                      const sanitized = sanitizeAgeInput(e.target.value);
                      setPrefMinAge(sanitized === "" ? "" : Number(sanitized));
                    }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Preferred Maximum Age
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    placeholder="60"
                    value={formatAgeForForm(prefMaxAge)}
                    onChange={(e) => {
                      const sanitized = sanitizeAgeInput(e.target.value);
                      setPrefMaxAge(sanitized === "" ? "" : Number(sanitized));
                    }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Preferred Location / City
                  </label>
                  <input
                    type="text"
                    value={prefLocation}
                    onChange={(e) => setPrefLocation(e.target.value)}
                    placeholder="e.g. Hyderabad, Bangalore, or Any"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Preferred Community */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Preferred Community / Caste
                  </label>
                  <input
                    type="text"
                    value={prefCommunity}
                    onChange={(e) => setPrefCommunity(e.target.value)}
                    placeholder="e.g. Any, or specific community"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Other Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Additional Partner Expectations / Notes
                </label>
                <textarea
                  rows={3}
                  value={prefNotes}
                  onChange={(e) => setPrefNotes(e.target.value)}
                  placeholder="Mention any family values, dietary habits, or career expectations..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                />
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary py-2.5 px-5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveStep(3, 4)}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600"
                >
                  <span>{saving ? "Saving..." : "Continue to Family Details"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Interactive3DCard>
        )}

        {/* STEP 4: FAMILY DETAILS */}
        {currentStep === 4 && (
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Family Details
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Share your family background to build trust and find culturally aligned matches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Family Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Family Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={familyType}
                    onChange={(e) => setFamilyType(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    <option value="Nuclear Family">Nuclear Family</option>
                    <option value="Joint Family">Joint Family</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Family Values */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Family Values
                  </label>
                  <select
                    value={familyValues}
                    onChange={(e) => setFamilyValues(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  >
                    <option value="moderate">Moderate</option>
                    <option value="traditional">Traditional</option>
                    <option value="liberal">Liberal</option>
                  </select>
                </div>

                {/* Family Location */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Family Native / Current Location
                  </label>
                  <input
                    type="text"
                    value={familyLocation}
                    onChange={(e) => setFamilyLocation(e.target.value)}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Father Occupation */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Father's Occupation
                  </label>
                  <input
                    type="text"
                    value={fatherOccupation}
                    onChange={(e) => setFatherOccupation(e.target.value)}
                    placeholder="e.g. Retired Govt Officer, Businessman"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Mother Occupation */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Mother's Occupation
                  </label>
                  <input
                    type="text"
                    value={motherOccupation}
                    onChange={(e) => setMotherOccupation(e.target.value)}
                    placeholder="e.g. Homemaker, Teacher"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                  />
                </div>

                {/* Siblings */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                      Brothers
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={brothers}
                      onChange={(e) => setBrothers(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                      Sisters
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sisters}
                      onChange={(e) => setSisters(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Family Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                  Family Description / Background
                </label>
                <textarea
                  rows={3}
                  value={aboutFamily}
                  onChange={(e) => setAboutFamily(e.target.value)}
                  placeholder="Share a short note about your family culture, traditions, and roots..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-2.5 px-4 text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
                />
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-secondary py-2.5 px-5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveStep(4, 5)}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600"
                >
                  <span>{saving ? "Saving..." : "Review Profile Preview"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Interactive3DCard>
        )}

        {/* STEP 5: PROFILE PREVIEW & FINALIZATION */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <Interactive3DCard>
              <div className="surface-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Profile Preview
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                      {childName || "Candidate Profile"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-secondary text-xs px-3.5 py-1.5"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Candidate Overview Card */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-28 w-28 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)] shrink-0 flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto.startsWith("http") ? profilePhoto : `${API_URL}${profilePhoto}`}
                        alt={childName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-[var(--text-muted)]" />
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {childName}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {relationship === "daughter" ? "Bride Profile" : "Groom Profile"} • {city}, {state}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-[var(--text-muted)]">
                      <span className="bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                        {education}
                      </span>
                      <span className="bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                        {occupation || employedIn}
                      </span>
                      <span className="bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                        {religion} {community ? `(${community})` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 1: About the Person */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    1. About the Person
                  </h4>
                  {bio && (
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)] italic">
                      "{bio}"
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Mother Tongue</span>
                      <span className="font-semibold text-[var(--text-primary)]">{motherTongue}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Height</span>
                      <span className="font-semibold text-[var(--text-primary)]">{heightCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Marital Status</span>
                      <span className="font-semibold text-[var(--text-primary)]">{maritalStatus}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Diet</span>
                      <span className="font-semibold text-[var(--text-primary)]">{diet}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Annual Income</span>
                      <span className="font-semibold text-[var(--text-primary)]">{annualIncome ? `₹${annualIncome}` : "Undisclosed"}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Family Details */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      2. Family Background
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Edit Family
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Family Type</span>
                      <span className="font-semibold text-[var(--text-primary)]">{familyType}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Family Values</span>
                      <span className="font-semibold text-[var(--text-primary)] capitalize">{familyValues}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Native Place</span>
                      <span className="font-semibold text-[var(--text-primary)]">{familyLocation || city}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Father's Occupation</span>
                      <span className="font-semibold text-[var(--text-primary)]">{fatherOccupation || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Mother's Occupation</span>
                      <span className="font-semibold text-[var(--text-primary)]">{motherOccupation || "Not specified"}</span>
                    </div>
                  </div>
                  {aboutFamily && (
                    <p className="text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                      {aboutFamily}
                    </p>
                  )}
                </div>

                {/* Section 3: Partner Preferences */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      3. Partner Expectations
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Edit Preferences
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Age Range</span>
                      <span className="font-semibold text-[var(--text-primary)]">{prefMinAge} – {prefMaxAge} years</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Preferred Location</span>
                      <span className="font-semibold text-[var(--text-primary)]">{prefLocation}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px]">Preferred Community</span>
                      <span className="font-semibold text-[var(--text-primary)]">{prefCommunity}</span>
                    </div>
                  </div>
                </div>

                {/* Completion Actions */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="btn-secondary w-full sm:w-auto py-2.5 px-5 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back to Family Details</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleFinalize}
                    className="btn-primary w-full sm:w-auto py-3 px-8 text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shadow-xl"
                  >
                    {saving ? "Completing Profile..." : "Complete Profile & Enter Dashboard"}
                  </button>
                </div>
              </div>
            </Interactive3DCard>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ParentOnboardingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-xs text-[var(--text-muted)]">Loading onboarding...</p>}>
      <ParentOnboardingContent />
    </Suspense>
  );
}
