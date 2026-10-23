const pool = require("../config/database");

// ENUM Normalizers & Formatters for MySQL ENUM Columns
function normalizeMaritalStatus(val) {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toLowerCase().replace(/\s+/g, "_");
  if (["never_married", "divorced", "widowed", "separated"].includes(clean)) {
    return clean;
  }
  return null;
}

function formatMaritalStatus(val) {
  if (!val || typeof val !== "string") return "Never Married";
  const map = {
    never_married: "Never Married",
    divorced: "Divorced",
    widowed: "Widowed",
    separated: "Separated",
  };
  return map[val.toLowerCase()] || "Never Married";
}

function normalizeDiet(val) {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  if (["vegetarian", "non_vegetarian", "vegan", "eggetarian", "other"].includes(clean)) {
    return clean;
  }
  return null;
}

function formatDiet(val) {
  if (!val || typeof val !== "string") return "Vegetarian";
  const map = {
    vegetarian: "Vegetarian",
    non_vegetarian: "Non-Vegetarian",
    vegan: "Vegan",
    eggetarian: "Eggetarian",
    other: "Other",
  };
  return map[val.toLowerCase()] || "Vegetarian";
}

function normalizeFamilyType(val) {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toLowerCase();
  if (clean.includes("nuclear")) return "nuclear";
  if (clean.includes("joint")) return "joint";
  return "other";
}

function formatFamilyType(val) {
  if (!val || typeof val !== "string") return "Nuclear Family";
  const map = {
    nuclear: "Nuclear Family",
    joint: "Joint Family",
    other: "Other",
  };
  return map[val.toLowerCase()] || "Nuclear Family";
}

async function getOnboardingState(userId) {
  const connection = await pool.getConnection();

  try {
    const [userRows] = await connection.execute(
      `
      SELECT
        id,
        full_name,
        email,
        mobile_number,
        gender,
        date_of_birth,
        account_status,
        profile_completed,
        profile_completion_step,
        role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (userRows.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = userRows[0];

    const [profileRows] = await connection.execute(
      `
      SELECT
        id,
        display_name,
        looking_for,
        star_sign,
        bio,
        city,
        state,
        country,
        mother_tongue,
        languages_spoken,
        religion,
        community,
        interests_json,
        hobbies_json,
        diet,
        height_cm,
        weight_kg,
        disability,
        disability_details,
        marital_status,
        education,
        employed_in,
        occupation,
        annual_income,
        profile_photo,
        photos_json
      FROM profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    const profile = profileRows.length > 0 ? profileRows[0] : {};

    const [familyRows] = await connection.execute(
      `
      SELECT
        family_type,
        family_values
      FROM family_details
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    const family = familyRows.length > 0 ? familyRows[0] : {};

    const [prefRows] = await connection.execute(
      `
      SELECT
        min_age,
        max_age,
        preferred_location,
        education,
        religion,
        community,
        marital_status,
        diet,
        occupation,
        mother_tongue,
        other_notes
      FROM partner_preferences
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    const prefs = prefRows.length > 0 ? prefRows[0] : {};

    // Calculate age from DOB
    let age = null;
    if (user.date_of_birth) {
      const dob = new Date(user.date_of_birth);
      const diff = Date.now() - dob.getTime();
      const ageDate = new Date(diff);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    let parsedLanguages = [];
    if (profile.languages_spoken) {
      try {
        parsedLanguages = JSON.parse(profile.languages_spoken);
      } catch (e) {
        parsedLanguages = profile.languages_spoken.split(",").map((s) => s.trim());
      }
    }

    let parsedInterests = [];
    if (profile.interests_json) {
      try {
        parsedInterests = JSON.parse(profile.interests_json);
      } catch (e) {
        parsedInterests = [];
      }
    }

    let parsedHobbies = [];
    if (profile.hobbies_json) {
      try {
        parsedHobbies = JSON.parse(profile.hobbies_json);
      } catch (e) {
        parsedHobbies = [];
      }
    }

    let parsedPhotos = [];
    if (profile.photos_json) {
      try {
        parsedPhotos = JSON.parse(profile.photos_json);
      } catch (e) {
        parsedPhotos = [];
      }
    }
    if (profile.profile_photo && !parsedPhotos.includes(profile.profile_photo)) {
      parsedPhotos.unshift(profile.profile_photo);
    }

    let prefEducation = [];
    if (prefs.education) {
      try {
        prefEducation = JSON.parse(prefs.education);
      } catch (e) {
        prefEducation = prefs.education ? prefs.education.split(",").map((s) => s.trim()) : [];
      }
    }

    let prefReligion = [];
    if (prefs.religion) {
      try {
        prefReligion = JSON.parse(prefs.religion);
      } catch (e) {
        prefReligion = prefs.religion ? prefs.religion.split(",").map((s) => s.trim()) : [];
      }
    }

    let prefMaritalStatus = [];
    if (prefs.marital_status) {
      try {
        prefMaritalStatus = JSON.parse(prefs.marital_status);
      } catch (e) {
        prefMaritalStatus = [formatMaritalStatus(prefs.marital_status)];
      }
    }

    let prefDiet = [];
    if (prefs.diet) {
      try {
        prefDiet = JSON.parse(prefs.diet);
      } catch (e) {
        prefDiet = [formatDiet(prefs.diet)];
      }
    }

    let prefOccupation = [];
    if (prefs.occupation) {
      try {
        prefOccupation = JSON.parse(prefs.occupation);
      } catch (e) {
        prefOccupation = prefs.occupation ? prefs.occupation.split(",").map((s) => s.trim()) : [];
      }
    }

    let prefLanguages = [];
    if (prefs.mother_tongue) {
      try {
        prefLanguages = JSON.parse(prefs.mother_tongue);
      } catch (e) {
        prefLanguages = prefs.mother_tongue ? prefs.mother_tongue.split(",").map((s) => s.trim()) : [];
      }
    }

    return {
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role || "user",
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
      age,
      profileCompleted: Boolean(user.profile_completed),
      currentStep: user.profile_completion_step || 1,

      section1AboutYou: {
        displayName: profile.display_name || user.full_name,
        gender: user.gender,
        lookingFor: profile.looking_for || (user.gender?.toLowerCase() === "male" ? "Woman" : "Man"),
        dateOfBirth: user.date_of_birth,
        age,
        starSign: profile.star_sign || "",
        aboutMe: profile.bio || "",
      },

      section2WhereYouBelong: {
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        motherTongue: profile.mother_tongue || "",
        languagesSpoken: parsedLanguages,
        religion: profile.religion || "",
        community: profile.community || "",
      },

      section3Lifestyle: {
        myInterests: parsedInterests,
        hobbies: parsedHobbies,
        lifestyle: formatDiet(profile.diet),
        heightCm: profile.height_cm || "",
        weightKg: profile.weight_kg || "",
        disability: profile.disability || "No",
        disabilityDetails: profile.disability_details || "",
      },

      section4Family: {
        familyType: formatFamilyType(family.family_type),
        familyDetails: family.family_values || "",
        maritalStatus: formatMaritalStatus(profile.marital_status),
      },

      section5EducationCareer: {
        highestEducation: profile.education || "",
        employedIn: profile.employed_in || "",
        employmentDetails: profile.occupation || "",
        annualIncome: profile.annual_income !== null && profile.annual_income !== undefined ? String(profile.annual_income) : "",
      },

      section6YourMatch: {
        minAge: prefs.min_age || 18,
        maxAge: prefs.max_age || 35,
        preferredLocation: prefs.preferred_location || "Any",
        preferredEducation: prefEducation,
        preferredReligion: prefReligion,
        preferredCaste: prefs.community || "Any",
        preferredMaritalStatus: prefMaritalStatus,
        preferredLifestyle: prefDiet,
        preferredEmploymentSector: prefOccupation,
        preferredLanguages: prefLanguages,
        otherPreferences: prefs.other_notes || "",
      },

      section7YourStory: {
        profilePhoto: profile.profile_photo || "",
        photos: parsedPhotos,
      },
    };
  } finally {
    connection.release();
  }
}

async function saveOnboardingStep(userId, stepNumber, data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Ensure profiles record exists
    const [existingProfile] = await connection.execute(
      "SELECT id FROM profiles WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (existingProfile.length === 0) {
      await connection.execute("INSERT INTO profiles (user_id) VALUES (?)", [userId]);
    }

    // Ensure family_details record exists
    const [existingFamily] = await connection.execute(
      "SELECT id FROM family_details WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (existingFamily.length === 0) {
      await connection.execute("INSERT INTO family_details (user_id) VALUES (?)", [userId]);
    }

    // Ensure partner_preferences record exists
    const [existingPrefs] = await connection.execute(
      "SELECT id FROM partner_preferences WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (existingPrefs.length === 0) {
      await connection.execute("INSERT INTO partner_preferences (user_id) VALUES (?)", [userId]);
    }

    const nextStep = Math.max(1, Math.min(8, Number(stepNumber) || 1));
    await connection.execute(
      "UPDATE users SET profile_completion_step = ? WHERE id = ?",
      [nextStep, userId]
    );

    // SECTION 1 — ABOUT YOU ONLY
    if (data.section1AboutYou) {
      const s1 = data.section1AboutYou;
      await connection.execute(
        `
        UPDATE profiles
        SET
          display_name = ?,
          looking_for = ?,
          star_sign = ?,
          bio = ?
        WHERE user_id = ?
        `,
        [
          s1.displayName || null,
          s1.lookingFor || null,
          s1.starSign || null,
          s1.aboutMe || null,
          userId,
        ]
      );
    }

    // SECTION 2 — WHERE YOU BELONG ONLY
    if (data.section2WhereYouBelong) {
      const s2 = data.section2WhereYouBelong;
      const langJson = Array.isArray(s2.languagesSpoken) ? JSON.stringify(s2.languagesSpoken) : null;
      await connection.execute(
        `
        UPDATE profiles
        SET
          city = ?,
          state = ?,
          country = ?,
          mother_tongue = ?,
          languages_spoken = ?,
          religion = ?,
          community = ?
        WHERE user_id = ?
        `,
        [
          s2.city || null,
          s2.state || null,
          s2.country || null,
          s2.motherTongue || null,
          langJson,
          s2.religion || null,
          s2.community || null,
          userId,
        ]
      );
    }

    // SECTION 3 — YOUR LIFESTYLE ONLY
    if (data.section3Lifestyle) {
      const s3 = data.section3Lifestyle;
      const intJson = Array.isArray(s3.myInterests) ? JSON.stringify(s3.myInterests) : null;
      const hobJson = Array.isArray(s3.hobbies) ? JSON.stringify(s3.hobbies) : null;
      const height = s3.heightCm ? parseInt(s3.heightCm, 10) : null;
      const weight = s3.weightKg ? parseInt(s3.weightKg, 10) : null;
      const normDiet = normalizeDiet(s3.lifestyle);

      await connection.execute(
        `
        UPDATE profiles
        SET
          interests_json = ?,
          hobbies_json = ?,
          diet = ?,
          height_cm = ?,
          weight_kg = ?,
          disability = ?,
          disability_details = ?
        WHERE user_id = ?
        `,
        [
          intJson,
          hobJson,
          normDiet,
          isNaN(height) ? null : height,
          isNaN(weight) ? null : weight,
          s3.disability || null,
          s3.disabilityDetails || null,
          userId,
        ]
      );
    }

    // SECTION 4 — YOUR FAMILY ONLY
    if (data.section4Family) {
      const s4 = data.section4Family;
      const normFamilyType = normalizeFamilyType(s4.familyType);
      const normMaritalStatus = normalizeMaritalStatus(s4.maritalStatus);

      await connection.execute(
        `
        UPDATE family_details
        SET
          family_type = ?,
          family_values = ?
        WHERE user_id = ?
        `,
        [normFamilyType, s4.familyDetails || null, userId]
      );

      await connection.execute(
        `
        UPDATE profiles
        SET marital_status = ?
        WHERE user_id = ?
        `,
        [normMaritalStatus, userId]
      );
    }

    // SECTION 5 — EDUCATION & CAREER ONLY
    if (data.section5EducationCareer) {
      const s5 = data.section5EducationCareer;
      let cleanIncome = null;
      if (s5.annualIncome) {
        const num = parseFloat(String(s5.annualIncome).replace(/[^\d.]/g, ""));
        if (!isNaN(num) && num > 0) cleanIncome = num;
      }

      await connection.execute(
        `
        UPDATE profiles
        SET
          education = ?,
          employed_in = ?,
          occupation = ?,
          annual_income = ?
        WHERE user_id = ?
        `,
        [
          s5.highestEducation || null,
          s5.employedIn || null,
          s5.employmentDetails || null,
          cleanIncome,
          userId,
        ]
      );
    }

    // SECTION 6 — YOUR MATCH ONLY
    if (data.section6YourMatch) {
      const s6 = data.section6YourMatch;
      const minAge = s6.minAge ? parseInt(s6.minAge, 10) : 18;
      const maxAge = s6.maxAge ? parseInt(s6.maxAge, 10) : 60;
      const eduJson = Array.isArray(s6.preferredEducation) ? JSON.stringify(s6.preferredEducation) : null;
      const relJson = Array.isArray(s6.preferredReligion) ? JSON.stringify(s6.preferredReligion) : null;
      const marJson = Array.isArray(s6.preferredMaritalStatus) ? JSON.stringify(s6.preferredMaritalStatus) : null;
      const dietJson = Array.isArray(s6.preferredLifestyle) ? JSON.stringify(s6.preferredLifestyle) : null;
      const occJson = Array.isArray(s6.preferredEmploymentSector) ? JSON.stringify(s6.preferredEmploymentSector) : null;
      const langJson = Array.isArray(s6.preferredLanguages) ? JSON.stringify(s6.preferredLanguages) : null;

      // Extract first valid ENUM preference for partner_preferences ENUM columns if present
      let prefMaritalEnum = null;
      if (Array.isArray(s6.preferredMaritalStatus) && s6.preferredMaritalStatus.length > 0) {
        for (const m of s6.preferredMaritalStatus) {
          const n = normalizeMaritalStatus(m);
          if (n) {
            prefMaritalEnum = n;
            break;
          }
        }
      }

      let prefDietEnum = null;
      if (Array.isArray(s6.preferredLifestyle) && s6.preferredLifestyle.length > 0) {
        for (const d of s6.preferredLifestyle) {
          const n = normalizeDiet(d);
          if (n) {
            prefDietEnum = n;
            break;
          }
        }
      }

      await connection.execute(
        `
        UPDATE partner_preferences
        SET
          min_age = ?,
          max_age = ?,
          preferred_location = ?,
          education = ?,
          religion = ?,
          community = ?,
          marital_status = ?,
          diet = ?,
          occupation = ?,
          mother_tongue = ?,
          other_notes = ?
        WHERE user_id = ?
        `,
        [
          minAge,
          maxAge,
          s6.preferredLocation || "Any",
          eduJson,
          relJson,
          s6.preferredCaste || "Any",
          prefMaritalEnum,
          prefDietEnum,
          occJson,
          langJson,
          s6.otherPreferences || null,
          userId,
        ]
      );
    }

    // SECTION 7 — YOUR STORY ONLY
    if (data.section7YourStory) {
      const s7 = data.section7YourStory;
      const photosJson = Array.isArray(s7.photos) ? JSON.stringify(s7.photos) : null;
      await connection.execute(
        `
        UPDATE profiles
        SET
          profile_photo = ?,
          photos_json = ?
        WHERE user_id = ?
        `,
        [s7.profilePhoto || null, photosJson, userId]
      );
    }

    await connection.commit();
    return await getOnboardingState(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function completeOnboarding(userId) {
  const connection = await pool.getConnection();

  try {
    const state = await getOnboardingState(userId);

    // Validate Mandatory Fields
    const errors = [];
    if (!state.section1AboutYou.displayName?.trim()) {
      errors.push("Display Name is required.");
    }
    if (!state.section1AboutYou.lookingFor?.trim()) {
      errors.push("Preferred gender ('Looking For') is required.");
    }
    if (!state.section2WhereYouBelong.city?.trim() && !state.section2WhereYouBelong.country?.trim()) {
      errors.push("Location (City / Country) is required.");
    }
    if (!state.section2WhereYouBelong.motherTongue?.trim()) {
      errors.push("Mother Tongue is required.");
    }
    if (!Array.isArray(state.section3Lifestyle.myInterests) || state.section3Lifestyle.myInterests.length === 0) {
      errors.push("At least one Interest must be selected.");
    }
    if (!state.section4Family.maritalStatus?.trim()) {
      errors.push("Marital Status is required.");
    }
    if (!state.section5EducationCareer.highestEducation?.trim()) {
      errors.push("Highest Education is required.");
    }
    if (!state.section7YourStory.profilePhoto?.trim()) {
      errors.push("At least one profile photo is required.");
    }

    if (errors.length > 0) {
      const err = new Error(errors.join(" "));
      err.statusCode = 400;
      throw err;
    }

    await connection.execute(
      "UPDATE users SET profile_completed = 1, profile_completion_step = 8, account_status = 'active' WHERE id = ?",
      [userId]
    );

    return {
      success: true,
      message: "Profile completed successfully! Welcome to ConnectSoulmate.",
      profileCompleted: true,
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  getOnboardingState,
  saveOnboardingStep,
  completeOnboarding,
};
