const pool = require("../config/database");

async function getProfile(userId) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(
      `
      SELECT
        p.id,
        p.user_id,
        p.bio,
        p.profile_photo,
        p.city,
        p.state,
        p.country,
        p.education,
        p.occupation,
        p.height_cm,
        p.time_of_birth,
        p.birth_place,
        p.marital_status,
        p.religion,
        p.community,
        p.mother_tongue,
        p.diet,
        p.smoking,
        p.drinking,
        p.annual_income,
        p.created_at,
        p.updated_at,
        u.full_name,
        u.email,
        u.mobile_number,
        u.gender,
        u.date_of_birth,
        u.account_status
      FROM profiles p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const profile = rows[0];

    return {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name,
      email: profile.email,
      mobileNumber: profile.mobile_number,
      gender: profile.gender,
      dateOfBirth: profile.date_of_birth,
      timeOfBirth: profile.time_of_birth,
      birthPlace: profile.birth_place,
      accountStatus: profile.account_status,

      bio: profile.bio,
      profilePhoto: profile.profile_photo,

      city: profile.city,
      state: profile.state,
      country: profile.country,
      education: profile.education,
      occupation: profile.occupation,
      heightCm: profile.height_cm,
      maritalStatus: profile.marital_status,

      religion: profile.religion,
      community: profile.community,
      motherTongue: profile.mother_tongue,
      diet: profile.diet,
      smoking: profile.smoking,
      drinking: profile.drinking,
      annualIncome: profile.annual_income,

      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } finally {
    connection.release();
  }
}

async function createProfile(userId, profileData) {
  const connection = await pool.getConnection();

  try {
    const {
      bio,
      city,
      state,
      country,
      education,
      occupation,
      heightCm,
      maritalStatus,
      religion,
      community,
      motherTongue,
      diet,
      smoking,
      drinking,
      annualIncome,
    } = profileData;

    await connection.execute(
      `
      INSERT INTO profiles (
        user_id,
        bio,
        city,
        state,
        country,
        education,
        occupation,
        height_cm,
        marital_status,
        religion,
        community,
        mother_tongue,
        diet,
        smoking,
        drinking,
        annual_income
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        bio || null,
        city || null,
        state || null,
        country || null,
        education || null,
        occupation || null,
        heightCm || null,
        maritalStatus || null,
        religion || null,
        community || null,
        motherTongue || null,
        diet || null,
        smoking || null,
        drinking || null,
        annualIncome ?? null,
      ]
    );
  } finally {
    connection.release();
  }

  return getProfile(userId);
}

async function updateProfile(userId, profileData) {
  const allowedFields = {
    bio: "bio",
    city: "city",
    state: "state",
    country: "country",
    education: "education",
    occupation: "occupation",
    heightCm: "height_cm",
    timeOfBirth: "time_of_birth",
    birthPlace: "birth_place",
    maritalStatus: "marital_status",
    religion: "religion",
    community: "community",
    motherTongue: "mother_tongue",
    diet: "diet",
    smoking: "smoking",
    drinking: "drinking",
    annualIncome: "annual_income",
  };

  const fields = [];
  const values = [];

  for (const [key, column] of Object.entries(allowedFields)) {
    if (Object.prototype.hasOwnProperty.call(profileData, key)) {
      fields.push(`${column} = ?`);

      values.push(
        profileData[key] === ""
          ? null
          : profileData[key]
      );
    }
  }

  if (fields.length === 0) {
    const error = new Error(
      "At least one profile field is required"
    );

    error.statusCode = 400;

    throw error;
  }

  values.push(userId);

  const connection = await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `
      UPDATE profiles
      SET ${fields.join(", ")}
      WHERE user_id = ?
      `,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }
  } finally {
    connection.release();
  }

  return getProfile(userId);
}

async function updateProfilePhoto(userId, profilePhoto) {
  const connection = await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `
      UPDATE profiles
      SET profile_photo = ?
      WHERE user_id = ?
      `,
      [profilePhoto, userId]
    );

    if (result.affectedRows === 0) {
      await connection.execute(
        `
        INSERT INTO profiles (user_id, profile_photo)
        VALUES (?, ?)
        `,
        [userId, profilePhoto]
      );
    }
  } finally {
    connection.release();
  }

  return getProfile(userId);
}

async function deleteProfilePhoto(userId) {
  const connection = await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `
      UPDATE profiles
      SET profile_photo = NULL
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }
  } finally {
    connection.release();
  }

  return getProfile(userId);
}

async function searchProfiles(currentUserId, filters = {}) {
  const connection = await pool.getConnection();

  try {
    const {
      gender,
      lookingFor,
      minAge,
      maxAge,
      religion,
      motherTongue,
      location,
      city,
      state,
      country,
      maritalStatus,
      education,
      occupation,
      page = 1,
      limit = 12,
    } = filters;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (parsedPage - 1) * parsedLimit;

    const whereConditions = [
      "u.account_status = 'active'",
      "(u.role IS NULL OR u.role != 'admin')",
      "u.id != ?",
    ];
    const params = [currentUserId];

    const targetGender = gender || lookingFor;
    if (targetGender && targetGender.trim() !== "") {
      const normalizedGender =
        targetGender.toLowerCase() === "woman"
          ? "female"
          : targetGender.toLowerCase() === "man"
          ? "male"
          : targetGender.toLowerCase().trim();

      whereConditions.push("(CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END) = ?");
      params.push(normalizedGender);
    }

    if (minAge !== undefined && minAge !== null && minAge !== "") {
      const numMinAge = parseInt(minAge, 10);
      if (!isNaN(numMinAge)) {
        whereConditions.push("TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) >= ?");
        params.push(numMinAge);
      }
    }

    if (maxAge !== undefined && maxAge !== null && maxAge !== "") {
      const numMaxAge = parseInt(maxAge, 10);
      if (!isNaN(numMaxAge)) {
        whereConditions.push("TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) <= ?");
        params.push(numMaxAge);
      }
    }

    if (religion && religion.trim() !== "") {
      whereConditions.push("p.religion = ?");
      params.push(religion.trim());
    }

    if (motherTongue && motherTongue.trim() !== "") {
      whereConditions.push("p.mother_tongue = ?");
      params.push(motherTongue.trim());
    }

    if (maritalStatus && maritalStatus.trim() !== "") {
      whereConditions.push("p.marital_status = ?");
      params.push(maritalStatus.trim());
    }

    if (education && education.trim() !== "") {
      whereConditions.push("p.education LIKE ?");
      params.push(`%${education.trim()}%`);
    }

    if (occupation && occupation.trim() !== "") {
      whereConditions.push("p.occupation LIKE ?");
      params.push(`%${occupation.trim()}%`);
    }

    const locSearch = location || city || state || country;
    if (locSearch && locSearch.trim() !== "") {
      const cleanLoc = `%${locSearch.trim()}%`;
      whereConditions.push("(p.city LIKE ? OR p.state LIKE ? OR p.country LIKE ?)");
      params.push(cleanLoc, cleanLoc, cleanLoc);
    }

    const whereClause = whereConditions.join(" AND ");

    const [countRows] = await connection.execute(
      `
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
      LEFT JOIN family_details fd ON fd.user_id = u.id
      WHERE ${whereClause}
      `,
      params
    );

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / parsedLimit);

    const dataParams = [...params, parsedLimit, offset];

    const [rows] = await connection.query(
      `
      SELECT
        u.id AS userId,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS fullName,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END AS dateOfBirth,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managedBy,
        fd.family_type AS familyType,
        fd.family_values AS familyValues,
        p.bio,
        p.profile_photo AS profilePhoto,
        p.city,
        p.state,
        p.country,
        p.education,
        p.occupation,
        p.height_cm AS heightCm,
        p.marital_status AS maritalStatus,
        p.religion,
        p.community,
        p.mother_tongue AS motherTongue,
        p.diet
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
      LEFT JOIN family_details fd ON fd.user_id = u.id
      WHERE ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
      `,
      dataParams
    );

    return {
      profiles: rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
      },
    };
  } finally {
    connection.release();
  }
}

async function getPublicProfileById(currentUserId, targetUserId) {
  const connection = await pool.getConnection();

  try {
    const [userRows] = await connection.execute(
      `
      SELECT
        u.id AS userId,
        u.full_name AS accountHolderName,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS fullName,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END AS dateOfBirth,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.account_status AS accountStatus,
        u.role,
        u.parent_relationship AS parentRelationship,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managedBy,
        p.bio,
        p.profile_photo AS profilePhoto,
        p.city,
        p.state,
        p.country,
        p.education,
        p.occupation,
        p.height_cm AS heightCm,
        p.marital_status AS maritalStatus,
        p.religion,
        p.community,
        p.mother_tongue AS motherTongue,
        p.diet,
        p.smoking,
        p.drinking,
        p.annual_income AS annualIncome,
        p.created_at AS createdAt
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
      WHERE u.id = ? AND u.account_status = 'active' AND (u.role IS NULL OR u.role != 'admin')
      LIMIT 1
      `,
      [targetUserId]
    );

    if (userRows.length === 0) {
      return null;
    }

    const profile = userRows[0];

    const [familyRows] = await connection.execute(
      `
      SELECT father_name AS fatherName, father_occupation AS fatherOccupation, mother_name AS motherName, mother_occupation AS motherOccupation, brothers, sisters, family_type AS familyType, family_values AS familyValues, family_location AS familyLocation, about_family AS aboutFamily
      FROM family_details
      WHERE user_id = ?
      LIMIT 1
      `,
      [targetUserId]
    );

    const family = familyRows.length > 0 ? familyRows[0] : null;

    const [prefRows] = await connection.execute(
      `
      SELECT min_age AS minAge, max_age AS maxAge, min_height_cm AS minHeightCm, max_height_cm AS maxHeightCm, religion, community, mother_tongue AS motherTongue, diet, smoking, drinking, marital_status AS maritalStatus, education, occupation, preferred_location AS preferredLocation
      FROM partner_preferences
      WHERE user_id = ?
      LIMIT 1
      `,
      [targetUserId]
    );

    const partnerPreferences = prefRows.length > 0 ? prefRows[0] : null;

    const [interestRows] = await connection.execute(
      `
      SELECT id, sender_user_id, receiver_user_id, status
      FROM interests
      WHERE (sender_user_id = ? AND receiver_user_id = ?)
         OR (sender_user_id = ? AND receiver_user_id = ?)
      LIMIT 1
      `,
      [currentUserId, targetUserId, targetUserId, currentUserId]
    );

    let interestStatus = null;
    if (interestRows.length > 0) {
      const row = interestRows[0];
      interestStatus = {
        id: row.id,
        isSender: row.sender_user_id === currentUserId,
        status: row.status,
      };
    }

    return {
      profile,
      family,
      partnerPreferences,
      interestStatus,
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  searchProfiles,
  getPublicProfileById,
};