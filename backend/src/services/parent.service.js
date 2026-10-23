const pool = require("../config/database");

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

function normalizeFamilyValues(val) {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toLowerCase();
  if (clean.includes("traditional")) return "traditional";
  if (clean.includes("liberal")) return "liberal";
  return "moderate";
}

async function getParentOnboardingState(userId) {
  const connection = await pool.getConnection();

  try {
    const [userRows] = await connection.execute(
      `SELECT id, full_name, email, mobile_number, gender, date_of_birth, role, parent_relationship, profile_completed, profile_completion_step
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      const error = new Error("Parent user not found");
      error.statusCode = 404;
      throw error;
    }

    const user = userRows[0];

    // 1. Child profile
    const [childRows] = await connection.execute(
      `SELECT id, child_name, child_relationship, child_gender, child_date_of_birth,
              TIMESTAMPDIFF(YEAR, child_date_of_birth, CURDATE()) AS child_age
       FROM parent_child_profiles WHERE parent_user_id = ? LIMIT 1`,
      [userId]
    );

    const child = childRows.length > 0 ? childRows[0] : null;

    // 2. Matrimonial Profile
    const [profileRows] = await connection.execute(
      `SELECT id, display_name, looking_for, bio, city, state, country, mother_tongue, languages_spoken,
              religion, community, interests_json, hobbies_json, diet, height_cm, weight_kg,
              marital_status, education, employed_in, occupation, annual_income, profile_photo, photos_json
       FROM profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const profile = profileRows.length > 0 ? profileRows[0] : {};

    // 3. Family Details
    const [familyRows] = await connection.execute(
      `SELECT family_type, family_values, family_location, father_name, father_occupation,
              mother_name, mother_occupation, brothers, sisters, about_family
       FROM family_details WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const family = familyRows.length > 0 ? familyRows[0] : {};

    // 4. Partner Preferences
    const [prefRows] = await connection.execute(
      `SELECT min_age, max_age, preferred_location, education, religion, community,
              marital_status, diet, occupation, mother_tongue, other_notes
       FROM partner_preferences WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const prefs = prefRows.length > 0 ? prefRows[0] : {};

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
      parentName: user.full_name,
      parentEmail: user.email,
      parentMobile: user.mobile_number,
      parentRelationship: user.parent_relationship || "Family",
      role: user.role,
      profileCompleted: Boolean(user.profile_completed),
      currentStep: user.profile_completion_step || 1,

      // Step 1: Who are you looking for?
      whoAreYouLookingFor: {
        relationship: child?.child_relationship || "son",
        childName: child?.child_name || profile.display_name || "",
        childGender: child?.child_gender || (child?.child_relationship === "daughter" ? "female" : "male"),
        childDateOfBirth: child?.child_date_of_birth ? child.child_date_of_birth.toISOString().slice(0, 10) : "",
        childAge: child?.child_age !== null && child?.child_age !== undefined ? Number(child.child_age) : null,
      },

      // Step 2: Child Profile Setup
      childProfile: {
        name: child?.child_name || profile.display_name || "",
        gender: child?.child_gender || "male",
        dateOfBirth: child?.child_date_of_birth ? child.child_date_of_birth.toISOString().slice(0, 10) : "",
        age: child?.child_age !== null && child?.child_age !== undefined ? Number(child.child_age) : null,
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "India",
        education: profile.education || "",
        employedIn: profile.employed_in || "",
        occupation: profile.occupation || "",
        annualIncome: profile.annual_income !== null && profile.annual_income !== undefined ? String(profile.annual_income) : "",
        heightCm: profile.height_cm || "",
        weightKg: profile.weight_kg || "",
        maritalStatus: formatMaritalStatus(profile.marital_status),
        religion: profile.religion || "Hindu",
        community: profile.community || "",
        motherTongue: profile.mother_tongue || "",
        languagesSpoken: parsedLanguages,
        diet: formatDiet(profile.diet),
        bio: profile.bio || "",
        profilePhoto: profile.profile_photo || "",
        photos: parsedPhotos,
        interests: parsedInterests,
      },

      // Step 3: Partner Preferences
      partnerPreferences: {
        minAge: prefs.min_age || 21,
        maxAge: prefs.max_age || 30,
        preferredLocation: prefs.preferred_location || "Any",
        preferredEducation: prefEducation,
        preferredReligion: prefReligion,
        preferredCaste: prefs.community || "Any",
        preferredMaritalStatus: prefs.marital_status ? [formatMaritalStatus(prefs.marital_status)] : ["Never Married"],
        preferredLifestyle: prefs.diet ? [formatDiet(prefs.diet)] : ["Vegetarian"],
        preferredEmploymentSector: prefs.occupation ? [prefs.occupation] : [],
        preferredLanguages: prefLanguages,
        otherPreferences: prefs.other_notes || "",
      },

      // Step 4: Family Details
      familyDetails: {
        familyType: formatFamilyType(family.family_type),
        familyLocation: family.family_location || "",
        familyValues: family.family_values || "moderate",
        fatherName: family.father_name || "",
        fatherOccupation: family.father_occupation || "",
        motherName: family.mother_name || "",
        motherOccupation: family.mother_occupation || "",
        brothers: family.brothers ?? "",
        sisters: family.sisters ?? "",
        aboutFamily: family.about_family || "",
      },
    };
  } finally {
    connection.release();
  }
}

async function saveParentOnboardingStep(userId, stepNumber, data) {
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

    const nextStep = Math.max(1, Math.min(6, Number(stepNumber) || 1));
    await connection.execute(
      "UPDATE users SET profile_completion_step = ? WHERE id = ?",
      [nextStep, userId]
    );

    // STEP 1 — WHO ARE YOU LOOKING FOR?
    if (data.whoAreYouLookingFor) {
      const step1 = data.whoAreYouLookingFor;
      const rel = step1.relationship === "daughter" ? "daughter" : "son";
      const childGender = step1.childGender || (rel === "daughter" ? "female" : "male");
      const childName = (step1.childName || "").trim();
      const childDob = step1.childDateOfBirth || "1998-01-01";

      await connection.execute(
        `
        INSERT INTO parent_child_profiles (
          parent_user_id, child_name, child_relationship, child_gender, child_date_of_birth
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          child_name = VALUES(child_name),
          child_relationship = VALUES(child_relationship),
          child_gender = VALUES(child_gender),
          child_date_of_birth = VALUES(child_date_of_birth)
        `,
        [userId, childName || "Candidate", rel, childGender, childDob]
      );

      // Sync display name and looking_for on profiles
      const lookingFor = childGender === "male" ? "Woman" : "Man";
      await connection.execute(
        "UPDATE profiles SET display_name = ?, looking_for = ? WHERE user_id = ?",
        [childName || "Candidate", lookingFor, userId]
      );
    }

    // STEP 2 — CHILD PROFILE SETUP
    if (data.childProfile) {
      const p = data.childProfile;
      const langJson = Array.isArray(p.languagesSpoken) ? JSON.stringify(p.languagesSpoken) : null;
      const intJson = Array.isArray(p.interests) ? JSON.stringify(p.interests) : null;
      const photosJson = Array.isArray(p.photos) ? JSON.stringify(p.photos) : null;
      const height = p.heightCm ? parseInt(p.heightCm, 10) : null;
      const weight = p.weightKg ? parseInt(p.weightKg, 10) : null;
      const normDiet = normalizeDiet(p.diet);
      const normMarital = normalizeMaritalStatus(p.maritalStatus);

      // Update parent_child_profiles if name/dob/gender updated
      if (p.name || p.dateOfBirth || p.gender) {
        const [existingPcp] = await connection.execute(
          "SELECT child_relationship FROM parent_child_profiles WHERE parent_user_id = ? LIMIT 1",
          [userId]
        );
        const rel = existingPcp[0]?.child_relationship || (p.gender === "female" ? "daughter" : "son");
        await connection.execute(
          `
          INSERT INTO parent_child_profiles (
            parent_user_id, child_name, child_relationship, child_gender, child_date_of_birth
          )
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            child_name = COALESCE(VALUES(child_name), child_name),
            child_gender = COALESCE(VALUES(child_gender), child_gender),
            child_date_of_birth = COALESCE(VALUES(child_date_of_birth), child_date_of_birth)
          `,
          [
            userId,
            p.name || "Candidate",
            rel,
            p.gender || "male",
            p.dateOfBirth || "1998-01-01",
          ]
        );
      }

      await connection.execute(
        `
        UPDATE profiles
        SET
          display_name = ?,
          city = ?,
          state = ?,
          country = ?,
          mother_tongue = ?,
          languages_spoken = ?,
          religion = ?,
          community = ?,
          education = ?,
          employed_in = ?,
          occupation = ?,
          annual_income = ?,
          height_cm = ?,
          weight_kg = ?,
          marital_status = ?,
          diet = ?,
          bio = ?,
          profile_photo = ?,
          photos_json = ?,
          interests_json = ?
        WHERE user_id = ?
        `,
        [
          p.name || null,
          p.city || null,
          p.state || null,
          p.country || "India",
          p.motherTongue || null,
          langJson,
          p.religion || null,
          p.community || null,
          p.education || null,
          p.employedIn || null,
          p.occupation || null,
          p.annualIncome ? parseFloat(p.annualIncome) : null,
          height,
          weight,
          normMarital,
          normDiet,
          p.bio || null,
          p.profilePhoto || null,
          photosJson,
          intJson,
          userId,
        ]
      );
    }

    // STEP 3 — PARTNER PREFERENCES
    if (data.partnerPreferences) {
      const prefs = data.partnerPreferences;
      const minAge = parseInt(prefs.minAge, 10) || 18;
      const maxAge = parseInt(prefs.maxAge, 10) || 45;
      const eduJson = Array.isArray(prefs.preferredEducation) ? JSON.stringify(prefs.preferredEducation) : null;
      const relJson = Array.isArray(prefs.preferredReligion) ? JSON.stringify(prefs.preferredReligion) : null;
      const langJson = Array.isArray(prefs.preferredLanguages) ? JSON.stringify(prefs.preferredLanguages) : null;
      const occJson = Array.isArray(prefs.preferredEmploymentSector) ? JSON.stringify(prefs.preferredEmploymentSector) : null;

      let prefMaritalEnum = null;
      if (Array.isArray(prefs.preferredMaritalStatus) && prefs.preferredMaritalStatus.length > 0) {
        for (const m of prefs.preferredMaritalStatus) {
          const n = normalizeMaritalStatus(m);
          if (n) {
            prefMaritalEnum = n;
            break;
          }
        }
      }

      let prefDietEnum = null;
      if (Array.isArray(prefs.preferredLifestyle) && prefs.preferredLifestyle.length > 0) {
        for (const d of prefs.preferredLifestyle) {
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
          prefs.preferredLocation || "Any",
          eduJson,
          relJson,
          prefs.preferredCaste || "Any",
          prefMaritalEnum,
          prefDietEnum,
          occJson,
          langJson,
          prefs.otherPreferences || null,
          userId,
        ]
      );
    }

    // STEP 4 — FAMILY DETAILS
    if (data.familyDetails) {
      const f = data.familyDetails;
      const fType = normalizeFamilyType(f.familyType);
      const fValues = normalizeFamilyValues(f.familyValues);

      await connection.execute(
        `
        UPDATE family_details
        SET
          family_type = ?,
          family_location = ?,
          family_values = ?,
          father_name = ?,
          father_occupation = ?,
          mother_name = ?,
          mother_occupation = ?,
          brothers = ?,
          sisters = ?,
          about_family = ?
        WHERE user_id = ?
        `,
        [
          fType,
          f.familyLocation || null,
          fValues,
          f.fatherName || null,
          f.fatherOccupation || null,
          f.motherName || null,
          f.motherOccupation || null,
          f.brothers !== "" && f.brothers !== undefined ? parseInt(f.brothers, 10) : null,
          f.sisters !== "" && f.sisters !== undefined ? parseInt(f.sisters, 10) : null,
          f.aboutFamily || null,
          userId,
        ]
      );
    }

    await connection.commit();
    return await getParentOnboardingState(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function completeParentOnboarding(userId) {
  const connection = await pool.getConnection();

  try {
    const state = await getParentOnboardingState(userId);

    // Validate Mandatory Fields
    const errors = [];
    if (!state.whoAreYouLookingFor.childName?.trim()) {
      errors.push("Child's Name is required.");
    }
    if (!state.childProfile.city?.trim() && !state.childProfile.country?.trim()) {
      errors.push("Child's location (City / Country) is required.");
    }
    if (!state.childProfile.motherTongue?.trim()) {
      errors.push("Mother Tongue is required.");
    }
    if (!state.familyDetails.familyType) {
      errors.push("Family Type is required.");
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(" "));
      error.statusCode = 400;
      throw error;
    }

    await connection.execute(
      "UPDATE users SET profile_completed = 1, profile_completion_step = 5 WHERE id = ?",
      [userId]
    );

    return {
      success: true,
      message: "Parent profile onboarding completed successfully.",
    };
  } finally {
    connection.release();
  }
}

async function getParentDashboardData(userId) {
  const connection = await pool.getConnection();

  try {
    const [userRows] = await connection.execute(
      `SELECT u.id, u.full_name, u.email, u.role, u.parent_relationship, u.profile_completed,
              pcp.child_name, pcp.child_relationship, pcp.child_gender, pcp.child_date_of_birth,
              TIMESTAMPDIFF(YEAR, pcp.child_date_of_birth, CURDATE()) AS child_age,
              p.city, p.state, p.country, p.religion, p.occupation, p.profile_photo
       FROM users u
       LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      const error = new Error("Parent user not found");
      error.statusCode = 404;
      throw error;
    }

    const parent = userRows[0];

    if (parent.role !== "parent") {
      const error = new Error("Access restricted to Parent accounts.");
      error.statusCode = 403;
      throw error;
    }

    // Quick Counters
    const [shortlistRows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM shortlists WHERE user_id = ?",
      [userId]
    );
    const shortlistCount = shortlistRows[0]?.count || 0;

    const [interestRows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM interests WHERE receiver_user_id = ? AND status = 'pending'",
      [userId]
    );
    const pendingInterestsCount = interestRows[0]?.count || 0;

    const [connectionRows] = await connection.execute(
      `SELECT COUNT(*) AS count FROM interests
       WHERE (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
      [userId, userId]
    );
    const connectionsCount = connectionRows[0]?.count || 0;

    // Unread messages
    let unreadMessagesCount = 0;
    try {
      const [msgRows] = await connection.execute(
        `SELECT COUNT(*) as count
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE (c.user_one_id = ? OR c.user_two_id = ?)
           AND m.sender_user_id != ?
           AND m.is_read = 0`,
        [userId, userId, userId]
      );
      unreadMessagesCount = msgRows[0]?.count || 0;
    } catch (e) {}

    // Recommended Matches based on Child's opposite gender
    const targetGender = parent.child_gender === "female" ? "male" : "female";
    const [recMatches] = await connection.query(
      `
      SELECT
        u.id AS userId,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS fullName,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managedBy,
        fd.family_type AS familyType,
        p.bio,
        p.profile_photo AS profilePhoto,
        p.city,
        p.state,
        p.country,
        p.education,
        p.occupation,
        p.religion
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
      LEFT JOIN family_details fd ON fd.user_id = u.id
      WHERE u.account_status = 'active'
        AND (u.role IS NULL OR u.role != 'admin')
        AND u.id != ?
        AND (CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END) = ?
      ORDER BY u.id DESC
      LIMIT 6
      `,
      [userId, targetGender]
    );

    // Calculate Completion Percentage
    let score = 0;
    if (parent.child_name) score += 20;
    if (parent.city) score += 20;
    if (parent.occupation) score += 20;
    if (parent.profile_photo) score += 20;
    if (parent.profile_completed) score += 20;

    return {
      parent: {
        userId: parent.id,
        parentName: parent.full_name || "Family",
        fullName: parent.full_name || "Family",
        relationship: parent.parent_relationship || "Parent",
        childName: parent.child_name || "Son/Daughter",
        childRelationship: parent.child_relationship || (parent.child_gender === "female" ? "Daughter" : "Son"),
        childGender: parent.child_gender || "male",
        childAge: parent.child_age !== null && parent.child_age !== undefined ? Number(parent.child_age) : null,
        location: [parent.city, parent.state].filter(Boolean).join(", ") || parent.country || "India",
        profileCompleted: Boolean(parent.profile_completed),
      },
      stats: {
        shortlistCount: Number(shortlistCount || 0),
        pendingInterestsCount: Number(pendingInterestsCount || 0),
        connectionsCount: Number(connectionsCount || 0),
        unreadMessagesCount: Number(unreadMessagesCount || 0),
        profileCompletionPercentage: score,
      },
      recommendedMatches: recMatches || [],
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  getParentOnboardingState,
  saveParentOnboardingStep,
  completeParentOnboarding,
  getParentDashboardData,
};
