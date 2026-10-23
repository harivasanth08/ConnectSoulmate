"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import { User, Home, Target, Upload, Trash2, Check } from "lucide-react";
import {
  formatPreferenceDisplay,
  formatAgeForForm,
  sanitizeAgeInput,
  parseAgeForSubmit,
} from "@/lib/formatPreferences";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Profile = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  accountStatus: string;

  bio: string | null;
  profilePhoto: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  education: string | null;
  occupation: string | null;
  heightCm: number | null;
  maritalStatus:
    | "never_married"
    | "divorced"
    | "widowed"
    | "separated"
    | null;

  religion: string | null;
  community: string | null;
  motherTongue: string | null;

  diet:
    | "vegetarian"
    | "non_vegetarian"
    | "vegan"
    | "eggetarian"
    | "other"
    | null;

  smoking: "yes" | "no" | "occasionally" | null;
  drinking: "yes" | "no" | "occasionally" | null;

  annualIncome: string | number | null;

  createdAt: string;
  updatedAt: string;
};

type FamilyDetails = {
  id: number;
  userId: number;

  fatherName: string | null;
  fatherOccupation: string | null;

  motherName: string | null;
  motherOccupation: string | null;

  brothers: number | null;
  sisters: number | null;

  familyType: "nuclear" | "joint" | "other" | null;
  familyValues:
    | "traditional"
    | "moderate"
    | "liberal"
    | null;

  familyLocation: string | null;

  createdAt: string;
  updatedAt: string;
};

type PartnerPreferences = {
  id: number;
  userId: number;

  minAge: number | null;
  maxAge: number | null;

  minHeightCm: number | null;
  maxHeightCm: number | null;

  religion: string | null;
  community: string | null;
  motherTongue: string | null;

  diet:
    | "vegetarian"
    | "non_vegetarian"
    | "vegan"
    | "eggetarian"
    | "other"
    | null;

  smoking: "yes" | "no" | "occasionally" | null;
  drinking: "yes" | "no" | "occasionally" | null;

  maritalStatus:
    | "never_married"
    | "divorced"
    | "widowed"
    | "separated"
    | null;

  education: string | null;
  occupation: string | null;
  preferredLocation: string | null;

  createdAt: string;
  updatedAt: string;
};

type ProfileForm = {
  bio: string;
  city: string;
  state: string;
  country: string;
  education: string;
  occupation: string;
  heightCm: string;
  maritalStatus: string;

  religion: string;
  community: string;
  motherTongue: string;
  diet: string;
  smoking: string;
  drinking: string;
  annualIncome: string;
};

type FamilyForm = {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  brothers: string;
  sisters: string;
  familyType: string;
  familyValues: string;
  familyLocation: string;
};

type PartnerPreferencesForm = {
  minAge: string;
  maxAge: string;

  minHeightCm: string;
  maxHeightCm: string;

  religion: string;
  community: string;
  motherTongue: string;

  diet: string;
  smoking: string;
  drinking: string;

  maritalStatus: string;

  education: string;
  occupation: string;
  preferredLocation: string;
};

const emptyProfileForm: ProfileForm = {
  bio: "",
  city: "",
  state: "",
  country: "",
  education: "",
  occupation: "",
  heightCm: "",
  maritalStatus: "",

  religion: "",
  community: "",
  motherTongue: "",
  diet: "",
  smoking: "",
  drinking: "",
  annualIncome: "",
};

const emptyFamilyForm: FamilyForm = {
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  brothers: "",
  sisters: "",
  familyType: "",
  familyValues: "",
  familyLocation: "",
};

const emptyPartnerPreferencesForm: PartnerPreferencesForm = {
  minAge: "",
  maxAge: "",

  minHeightCm: "",
  maxHeightCm: "",

  religion: "",
  community: "",
  motherTongue: "",

  diet: "",
  smoking: "",
  drinking: "",

  maritalStatus: "",

  education: "",
  occupation: "",
  preferredLocation: "",
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(null);
  const [partnerPreferences, setPartnerPreferences] = useState<PartnerPreferences | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [familyForm, setFamilyForm] = useState<FamilyForm>(emptyFamilyForm);
  const [partnerPreferencesForm, setPartnerPreferencesForm] = useState<PartnerPreferencesForm>(emptyPartnerPreferencesForm);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFamily, setSavingFamily] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [familyMessage, setFamilyMessage] = useState("");
  const [familyError, setFamilyError] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [preferencesError, setPreferencesError] = useState("");
  const [error, setError] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("connectsoulmate_user") || "null")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    loadProfile();
    loadFamilyDetails();
    loadPartnerPreferences();
  }, [token, router]);

  useEffect(() => {
    if (!profile) return;

    setProfileForm({
      bio: profile.bio || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      education: profile.education || "",
      occupation: profile.occupation || "",
      heightCm: profile.heightCm !== null ? String(profile.heightCm) : "",
      maritalStatus: profile.maritalStatus || "",
      religion: profile.religion || "",
      community: profile.community || "",
      motherTongue: profile.motherTongue || "",
      diet: profile.diet || "",
      smoking: profile.smoking || "",
      drinking: profile.drinking || "",
      annualIncome: profile.annualIncome !== null ? String(profile.annualIncome) : "",
    });
  }, [profile]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 404) {
        setProfile(null);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load profile");

      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function loadFamilyDetails() {
    try {
      setFamilyError("");
      const response = await fetch(`${API_URL}/api/profile/family/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 404) {
        setFamilyDetails(null);
        setFamilyForm(emptyFamilyForm);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load family details");

      const loadedFamily: FamilyDetails = data.familyDetails || data.family;
      if (loadedFamily) {
        setFamilyDetails(loadedFamily);
        setFamilyForm({
          fatherName: loadedFamily.fatherName || "",
          fatherOccupation: loadedFamily.fatherOccupation || "",
          motherName: loadedFamily.motherName || "",
          motherOccupation: loadedFamily.motherOccupation || "",
          brothers: loadedFamily.brothers !== null && loadedFamily.brothers !== undefined ? String(loadedFamily.brothers) : "",
          sisters: loadedFamily.sisters !== null && loadedFamily.sisters !== undefined ? String(loadedFamily.sisters) : "",
          familyType: loadedFamily.familyType || "",
          familyValues: loadedFamily.familyValues || "",
          familyLocation: loadedFamily.familyLocation || "",
        });
      } else {
        setFamilyDetails(null);
        setFamilyForm(emptyFamilyForm);
      }
    } catch (err) {
      setFamilyError(err instanceof Error ? err.message : "Failed to load family details");
    }
  }

  async function loadPartnerPreferences() {
    try {
      const response = await fetch(`${API_URL}/api/profile/preferences/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 404) {
        setPartnerPreferences(null);
        setPartnerPreferencesForm(emptyPartnerPreferencesForm);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load partner preferences");

      const loadedPreferences: PartnerPreferences = data.partnerPreferences;
      setPartnerPreferences(loadedPreferences);
      setPartnerPreferencesForm({
        minAge: formatAgeForForm(loadedPreferences.minAge),
        maxAge: formatAgeForForm(loadedPreferences.maxAge),
        minHeightCm: loadedPreferences.minHeightCm !== null ? String(loadedPreferences.minHeightCm) : "",
        maxHeightCm: loadedPreferences.maxHeightCm !== null ? String(loadedPreferences.maxHeightCm) : "",
        religion: formatPreferenceDisplay(loadedPreferences.religion),
        community: loadedPreferences.community || "",
        motherTongue: formatPreferenceDisplay(loadedPreferences.motherTongue),
        diet: loadedPreferences.diet || "",
        smoking: loadedPreferences.smoking || "",
        drinking: loadedPreferences.drinking || "",
        maritalStatus: loadedPreferences.maritalStatus || "",
        education: loadedPreferences.education || "",
        occupation: loadedPreferences.occupation || "",
        preferredLocation: loadedPreferences.preferredLocation || "",
      });
    } catch (err) {
      setPreferencesError(err instanceof Error ? err.message : "Failed to load partner preferences");
    }
  }

  function handleLogout() {
    localStorage.removeItem("connectsoulmate_token");
    localStorage.removeItem("connectsoulmate_user");
    router.replace("/login");
  }

  function handleProfileChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function handleFamilyChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFamilyForm((current) => ({ ...current, [name]: value }));
    setFamilyError("");
    setFamilyMessage("");
  }

  function handlePreferencesChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    if (name === "minAge" || name === "maxAge") {
      const sanitized = sanitizeAgeInput(value);
      setPartnerPreferencesForm((current) => ({ ...current, [name]: sanitized }));
      setPreferencesError("");
      setPreferencesMessage("");
      return;
    }
    setPartnerPreferencesForm((current) => ({ ...current, [name]: value }));
    setPreferencesError("");
    setPreferencesMessage("");
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setError("");

    try {
      const payload: Record<string, unknown> = {};
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value !== "") {
          payload[key] = key === "heightCm" || key === "annualIncome" ? Number(value) : value;
        }
      });

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: profile ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save profile");

      setProfile(data.profile);
      setProfileMessage(profile ? "Profile updated successfully." : "Profile created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleFamilySubmit(event: FormEvent) {
    event.preventDefault();
    setSavingFamily(true);
    setFamilyMessage("");
    setFamilyError("");

    try {
      const payload: Record<string, unknown> = {};
      if (familyForm.fatherName.trim()) payload.fatherName = familyForm.fatherName.trim();
      if (familyForm.fatherOccupation.trim()) payload.fatherOccupation = familyForm.fatherOccupation.trim();
      if (familyForm.motherName.trim()) payload.motherName = familyForm.motherName.trim();
      if (familyForm.motherOccupation.trim()) payload.motherOccupation = familyForm.motherOccupation.trim();
      if (familyForm.brothers !== "") payload.brothers = Number(familyForm.brothers);
      if (familyForm.sisters !== "") payload.sisters = Number(familyForm.sisters);
      if (familyForm.familyType) payload.familyType = familyForm.familyType;
      if (familyForm.familyValues) payload.familyValues = familyForm.familyValues;
      if (familyForm.familyLocation.trim()) payload.familyLocation = familyForm.familyLocation.trim();

      const method = familyDetails ? "PUT" : "POST";
      const response = await fetch(`${API_URL}/api/profile/family/me`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save family details");

      const savedFamily: FamilyDetails = data.familyDetails || data.family;
      if (savedFamily) {
        setFamilyDetails(savedFamily);
        setFamilyForm({
          fatherName: savedFamily.fatherName || "",
          fatherOccupation: savedFamily.fatherOccupation || "",
          motherName: savedFamily.motherName || "",
          motherOccupation: savedFamily.motherOccupation || "",
          brothers: savedFamily.brothers !== null && savedFamily.brothers !== undefined ? String(savedFamily.brothers) : "",
          sisters: savedFamily.sisters !== null && savedFamily.sisters !== undefined ? String(savedFamily.sisters) : "",
          familyType: savedFamily.familyType || "",
          familyValues: savedFamily.familyValues || "",
          familyLocation: savedFamily.familyLocation || "",
        });
      }
      setFamilyMessage(data.message || (familyDetails ? "Family details updated successfully." : "Family details saved successfully."));
    } catch (err) {
      setFamilyError(err instanceof Error ? err.message : "Failed to save family details");
    } finally {
      setSavingFamily(false);
    }
  }

  async function handlePreferencesSubmit(event: FormEvent) {
    event.preventDefault();
    setSavingPreferences(true);
    setPreferencesMessage("");
    setPreferencesError("");

    try {
      const minAge = parseAgeForSubmit(partnerPreferencesForm.minAge);
      const maxAge = parseAgeForSubmit(partnerPreferencesForm.maxAge);
      const minHeight = partnerPreferencesForm.minHeightCm !== "" ? Number(partnerPreferencesForm.minHeightCm) : null;
      const maxHeight = partnerPreferencesForm.maxHeightCm !== "" ? Number(partnerPreferencesForm.maxHeightCm) : null;

      if (minAge !== null && (minAge < 18 || minAge > 100)) {
        throw new Error("Minimum age preference must be between 18 and 100.");
      }
      if (maxAge !== null && (maxAge < 18 || maxAge > 100)) {
        throw new Error("Maximum age preference must be between 18 and 100.");
      }
      if (minAge !== null && maxAge !== null && minAge > maxAge) {
        throw new Error("Minimum age cannot be greater than maximum age.");
      }
      if (minHeight !== null && maxHeight !== null && minHeight > maxHeight) {
        throw new Error("Minimum height cannot be greater than maximum height.");
      }

      const cleanReligion = formatPreferenceDisplay(partnerPreferencesForm.religion);
      const cleanMotherTongue = formatPreferenceDisplay(partnerPreferencesForm.motherTongue);

      const payload: Record<string, unknown> = {};
      payload.minAge = minAge;
      payload.maxAge = maxAge;
      if (minHeight !== null) payload.minHeightCm = minHeight;
      if (maxHeight !== null) payload.maxHeightCm = maxHeight;

      payload.religion = cleanReligion ? cleanReligion : null;
      payload.community = partnerPreferencesForm.community.trim() || null;
      payload.motherTongue = cleanMotherTongue ? cleanMotherTongue : null;
      if (partnerPreferencesForm.diet) payload.diet = partnerPreferencesForm.diet;
      if (partnerPreferencesForm.smoking) payload.smoking = partnerPreferencesForm.smoking;
      if (partnerPreferencesForm.drinking) payload.drinking = partnerPreferencesForm.drinking;
      if (partnerPreferencesForm.maritalStatus) payload.maritalStatus = partnerPreferencesForm.maritalStatus;
      if (partnerPreferencesForm.education.trim()) payload.education = partnerPreferencesForm.education.trim();
      if (partnerPreferencesForm.occupation.trim()) payload.occupation = partnerPreferencesForm.occupation.trim();
      if (partnerPreferencesForm.preferredLocation.trim()) payload.preferredLocation = partnerPreferencesForm.preferredLocation.trim();

      const method = partnerPreferences ? "PUT" : "POST";
      const response = await fetch(`${API_URL}/api/profile/preferences/me`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        const validationMessage = Array.isArray(data.errors) && data.errors.length > 0 ? data.errors.join(", ") : data.message;
        throw new Error(validationMessage || "Failed to save partner preferences");
      }

      const savedPreferences: PartnerPreferences = data.partnerPreferences;
      setPartnerPreferences(savedPreferences);
      if (savedPreferences) {
        setPartnerPreferencesForm((current) => ({
          ...current,
          minAge: formatAgeForForm(savedPreferences.minAge),
          maxAge: formatAgeForForm(savedPreferences.maxAge),
          religion: formatPreferenceDisplay(savedPreferences.religion),
          motherTongue: formatPreferenceDisplay(savedPreferences.motherTongue),
        }));
      }
      setPreferencesMessage(partnerPreferences ? "Partner preferences updated successfully." : "Partner preferences saved successfully.");
    } catch (err) {
      setPreferencesError(err instanceof Error ? err.message : "Failed to save partner preferences");
    } finally {
      setSavingPreferences(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setUploadingPhoto(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const response = await fetch(`${API_URL}/api/profile/me/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload photo");

      setProfile(data.profile);
      URL.revokeObjectURL(previewUrl);
      setPhotoPreview(null);
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setPhotoPreview(null);
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (event.target) event.target.value = "";
    }
  }

  async function handleDeletePhoto() {
    if (!profile?.profilePhoto) return;

    setUploadingPhoto(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/profile/me/photo`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove photo");

      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading profile form...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="border-b border-[var(--border)] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            My Matrimonial Profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Manage your personal bio, background, family information, and partner expectations.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* PROFILE PHOTO SECTION */}
        <Interactive3DCard>
          <section className="surface-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-5 flex items-center gap-2">
              <Upload className="h-4 w-4 text-[var(--brand-primary)]" /> Profile Photography
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--brand-primary)]/40 bg-[var(--surface-soft)] flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : profile?.profilePhoto ? (
                  <img
                    key={profile.profilePhoto}
                    src={`${API_URL}${profile.profilePhoto}`}
                    alt="Profile Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[var(--brand-primary)] flex items-center justify-center">
                    {profile?.fullName?.charAt(0).toUpperCase() ||
                      storedUser?.fullName?.charAt(0).toUpperCase() || (
                        <User className="h-10 w-10 text-[var(--brand-primary)]" />
                      )}
                  </span>
                )}
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <label className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingPhoto ? "Uploading..." : "Upload New Photo"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>

                  {profile?.profilePhoto && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                      className="btn-secondary text-xs px-4 py-2 text-rose-400 border-rose-500/30 flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-muted)]">
                  Supported formats: JPG, PNG, WEBP. Max file size: 10MB. Photo is displayed with clear, un-distorted aspect ratio.
                </p>
              </div>
            </div>
          </section>
        </Interactive3DCard>

        {/* BASIC INFORMATION FORM */}
        <form onSubmit={handleProfileSubmit}>
          <Interactive3DCard>
            <section className="surface-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--brand-primary)]" /> Basic Personal Details
                </h2>
                {profileMessage && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> {profileMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">
                    About Me / Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Share a brief overview of your personality, goals, and values..."
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">City</label>
                  <input
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">State</label>
                  <input
                    name="state"
                    value={profileForm.state}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Country</label>
                  <input
                    name="country"
                    value={profileForm.country}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Education</label>
                  <input
                    name="education"
                    value={profileForm.education}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Occupation</label>
                  <input
                    name="occupation"
                    value={profileForm.occupation}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Height (cm)</label>
                  <input
                    type="number"
                    name="heightCm"
                    value={profileForm.heightCm}
                    onChange={handleProfileChange}
                    min={100}
                    max={250}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={profileForm.maritalStatus}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Select Status</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Religion</label>
                  <input
                    name="religion"
                    value={profileForm.religion}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Mother Tongue</label>
                  <input
                    name="motherTongue"
                    value={profileForm.motherTongue}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Diet</label>
                  <select
                    name="diet"
                    value={profileForm.diet}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Select Diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Annual Income (₹)</label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={profileForm.annualIncome}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary text-xs px-6 py-2.5"
                >
                  {savingProfile ? "Saving Details..." : "Save Basic Details"}
                </button>
              </div>
            </section>
          </Interactive3DCard>
        </form>

        {/* FAMILY BACKGROUND FORM */}
        <form onSubmit={handleFamilySubmit}>
          <Interactive3DCard>
            <section className="surface-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <Home className="h-4 w-4 text-[var(--brand-primary)]" /> Family Background Information
                </h2>
                {familyMessage && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> {familyMessage}
                  </span>
                )}
              </div>

              {familyError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {familyError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Father's Name</label>
                  <input
                    name="fatherName"
                    value={familyForm.fatherName}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Father's Occupation</label>
                  <input
                    name="fatherOccupation"
                    value={familyForm.fatherOccupation}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Mother's Name</label>
                  <input
                    name="motherName"
                    value={familyForm.motherName}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Mother's Occupation</label>
                  <input
                    name="motherOccupation"
                    value={familyForm.motherOccupation}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Brothers</label>
                  <input
                    type="number"
                    name="brothers"
                    value={familyForm.brothers}
                    onChange={handleFamilyChange}
                    min={0}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Sisters</label>
                  <input
                    type="number"
                    name="sisters"
                    value={familyForm.sisters}
                    onChange={handleFamilyChange}
                    min={0}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Family Type</label>
                  <select
                    name="familyType"
                    value={familyForm.familyType}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Select Family Type</option>
                    <option value="nuclear">Nuclear</option>
                    <option value="joint">Joint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Family Values</label>
                  <select
                    name="familyValues"
                    value={familyForm.familyValues}
                    onChange={handleFamilyChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Select Family Values</option>
                    <option value="traditional">Traditional</option>
                    <option value="moderate">Moderate</option>
                    <option value="liberal">Liberal</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="submit"
                  disabled={savingFamily}
                  className="btn-primary text-xs px-6 py-2.5"
                >
                  {savingFamily ? "Saving Family..." : "Save Family Details"}
                </button>
              </div>
            </section>
          </Interactive3DCard>
        </form>

        {/* PARTNER PREFERENCES FORM */}
        <form onSubmit={handlePreferencesSubmit}>
          <Interactive3DCard>
            <section className="surface-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <Target className="h-4 w-4 text-[var(--brand-primary)]" /> Partner Expectations & Preferences
                </h2>
                {preferencesMessage && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> {preferencesMessage}
                  </span>
                )}
              </div>

              {preferencesError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {preferencesError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Min Age Preference</label>
                  <input
                    type="number"
                    name="minAge"
                    value={partnerPreferencesForm.minAge}
                    onChange={handlePreferencesChange}
                    min={18}
                    max={100}
                    placeholder="e.g. 18"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Max Age Preference</label>
                  <input
                    type="number"
                    name="maxAge"
                    value={partnerPreferencesForm.maxAge}
                    onChange={handlePreferencesChange}
                    min={18}
                    max={100}
                    placeholder="e.g. 28"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Preferred Religion</label>
                  <input
                    name="religion"
                    value={partnerPreferencesForm.religion}
                    onChange={handlePreferencesChange}
                    placeholder="e.g. Hindu, Any"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Preferred Mother Tongue</label>
                  <input
                    name="motherTongue"
                    value={partnerPreferencesForm.motherTongue}
                    onChange={handlePreferencesChange}
                    placeholder="e.g. Telugu, English"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Preferred Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={partnerPreferencesForm.maritalStatus}
                    onChange={handlePreferencesChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="">Any Status</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[var(--text-primary)]">Preferred Location</label>
                  <input
                    name="preferredLocation"
                    value={partnerPreferencesForm.preferredLocation}
                    onChange={handlePreferencesChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="submit"
                  disabled={savingPreferences}
                  className="btn-primary text-xs px-6 py-2.5"
                >
                  {savingPreferences ? "Saving Preferences..." : "Save Partner Expectations"}
                </button>
              </div>
            </section>
          </Interactive3DCard>
        </form>
      </div>
    </main>
  );
}