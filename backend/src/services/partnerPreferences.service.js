const pool = require("../config/database");

function sanitizePreferenceString(val) {
  if (val === undefined || val === null) return null;
  let str = String(val).trim();
  if (!str) return null;

  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        str = parsed
          .map((item) => String(item || "").replace(/^[{[("']+|[}\])"']+$/g, "").trim())
          .filter(Boolean)
          .join(", ");
      }
    } catch (e) {
      str = str.replace(/^\[+\s*["']?/, "").replace(/["']?\s*\]+$/, "").trim();
    }
  }

  str = str
    .replace(/^\{+\s*["']?/, "")
    .replace(/["']?\s*\}+$/, "")
    .replace(/^["']/, "")
    .replace(/["']$/, "")
    .trim();

  const lower = str.toLowerCase();
  if (
    !str ||
    lower === "religion" ||
    lower === "{religion}" ||
    lower === "mother tongue" ||
    lower === "mothertongue" ||
    lower === "{mother tongue}" ||
    lower === "preferred religion" ||
    lower === "preferred mother tongue" ||
    lower === "[]" ||
    lower === "{}" ||
    lower === '[""]' ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "none"
  ) {
    return null;
  }
  return str;
}

async function getPartnerPreferences(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        min_age,
        max_age,
        min_height_cm,
        max_height_cm,
        religion,
        community,
        mother_tongue,
        diet,
        smoking,
        drinking,
        marital_status,
        education,
        occupation,
        preferred_location,
        created_at,
        updated_at
      FROM partner_preferences
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  return {
    id: row.id,
    userId: row.user_id,

    minAge: row.min_age,
    maxAge: row.max_age,

    minHeightCm: row.min_height_cm,
    maxHeightCm: row.max_height_cm,

    religion: sanitizePreferenceString(row.religion),
    community: sanitizePreferenceString(row.community),
    motherTongue: sanitizePreferenceString(row.mother_tongue),

    diet: row.diet,
    smoking: row.smoking,
    drinking: row.drinking,

    maritalStatus: row.marital_status,

    education: sanitizePreferenceString(row.education),
    occupation: sanitizePreferenceString(row.occupation),
    preferredLocation: row.preferred_location,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createPartnerPreferences(userId, preferencesData) {
  const {
    minAge,
    maxAge,
    minHeightCm,
    maxHeightCm,
    religion,
    community,
    motherTongue,
    diet,
    smoking,
    drinking,
    maritalStatus,
    education,
    occupation,
    preferredLocation,
  } = preferencesData;

  const [result] = await pool.execute(
    `
      INSERT INTO partner_preferences (
        user_id,
        min_age,
        max_age,
        min_height_cm,
        max_height_cm,
        religion,
        community,
        mother_tongue,
        diet,
        smoking,
        drinking,
        marital_status,
        education,
        occupation,
        preferred_location
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      minAge ?? null,
      maxAge ?? null,
      minHeightCm ?? null,
      maxHeightCm ?? null,
      religion ?? null,
      community ?? null,
      motherTongue ?? null,
      diet ?? null,
      smoking ?? null,
      drinking ?? null,
      maritalStatus ?? null,
      education ?? null,
      occupation ?? null,
      preferredLocation ?? null,
    ]
  );

  return getPartnerPreferences(userId);
}

async function updatePartnerPreferences(userId, preferencesData) {
  const allowedFields = {
    minAge: "min_age",
    maxAge: "max_age",
    minHeightCm: "min_height_cm",
    maxHeightCm: "max_height_cm",
    religion: "religion",
    community: "community",
    motherTongue: "mother_tongue",
    diet: "diet",
    smoking: "smoking",
    drinking: "drinking",
    maritalStatus: "marital_status",
    education: "education",
    occupation: "occupation",
    preferredLocation: "preferred_location",
  };

  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(preferencesData)) {
    if (allowedFields[key]) {
      updates.push(`${allowedFields[key]} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    return getPartnerPreferences(userId);
  }

  values.push(userId);

  await pool.execute(
    `
      UPDATE partner_preferences
      SET ${updates.join(", ")}
      WHERE user_id = ?
    `,
    values
  );

  return getPartnerPreferences(userId);
}

module.exports = {
  getPartnerPreferences,
  createPartnerPreferences,
  updatePartnerPreferences,
};