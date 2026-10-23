const {
  getPartnerPreferences,
  createPartnerPreferences,
  updatePartnerPreferences,
} = require("../services/partnerPreferences.service");

const ALLOWED_DIETS = [
  "vegetarian",
  "non_vegetarian",
  "vegan",
  "eggetarian",
  "other",
];

const ALLOWED_SMOKING = [
  "yes",
  "no",
  "occasionally",
];

const ALLOWED_DRINKING = [
  "yes",
  "no",
  "occasionally",
];

const ALLOWED_MARITAL_STATUS = [
  "never_married",
  "divorced",
  "widowed",
  "separated",
];

function validateText(value, fieldName, maxLength, errors) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`);
    return;
  }

  if (value.length > maxLength) {
    errors.push(
      `${fieldName} must not exceed ${maxLength} characters`
    );
  }
}

function validateInteger(
  value,
  fieldName,
  min,
  max,
  errors
) {
  if (value === undefined || value === null) {
    return;
  }

  if (
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    errors.push(
      `${fieldName} must be an integer between ${min} and ${max}`
    );
  }
}

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

function parseAgeInteger(val) {
  if (val === undefined || val === null || val === "") return null;
  const str = String(val).replace(/\D/g, "").replace(/^0+/, "");
  if (!str) return null;
  const num = Number(str);
  if (isNaN(num) || num <= 0) return null;
  return Math.floor(num);
}

function sanitizePreferencesPayload(raw) {
  const data = { ...raw };
  if ("minAge" in data) data.minAge = parseAgeInteger(data.minAge);
  if ("maxAge" in data) data.maxAge = parseAgeInteger(data.maxAge);
  if ("minHeightCm" in data && data.minHeightCm !== null && data.minHeightCm !== "") {
    data.minHeightCm = Number(data.minHeightCm) || null;
  }
  if ("maxHeightCm" in data && data.maxHeightCm !== null && data.maxHeightCm !== "") {
    data.maxHeightCm = Number(data.maxHeightCm) || null;
  }
  if ("religion" in data) data.religion = sanitizePreferenceString(data.religion);
  if ("motherTongue" in data) data.motherTongue = sanitizePreferenceString(data.motherTongue);
  if ("community" in data) data.community = sanitizePreferenceString(data.community);
  if ("education" in data) data.education = sanitizePreferenceString(data.education);
  if ("occupation" in data) data.occupation = sanitizePreferenceString(data.occupation);
  return data;
}

function validatePartnerPreferences(data) {
  const errors = [];

  validateInteger(
    data.minAge,
    "minAge",
    18,
    100,
    errors
  );

  validateInteger(
    data.maxAge,
    "maxAge",
    18,
    100,
    errors
  );

  validateInteger(
    data.minHeightCm,
    "minHeightCm",
    100,
    250,
    errors
  );

  validateInteger(
    data.maxHeightCm,
    "maxHeightCm",
    100,
    250,
    errors
  );

  validateText(
    data.religion,
    "religion",
    100,
    errors
  );

  validateText(
    data.community,
    "community",
    100,
    errors
  );

  validateText(
    data.motherTongue,
    "motherTongue",
    100,
    errors
  );

  validateText(
    data.education,
    "education",
    150,
    errors
  );

  validateText(
    data.occupation,
    "occupation",
    150,
    errors
  );

  validateText(
    data.preferredLocation,
    "preferredLocation",
    150,
    errors
  );

  if (
    data.diet !== undefined &&
    data.diet !== null &&
    !ALLOWED_DIETS.includes(data.diet)
  ) {
    errors.push("Invalid diet");
  }

  if (
    data.smoking !== undefined &&
    data.smoking !== null &&
    !ALLOWED_SMOKING.includes(data.smoking)
  ) {
    errors.push("Invalid smoking value");
  }

  if (
    data.drinking !== undefined &&
    data.drinking !== null &&
    !ALLOWED_DRINKING.includes(data.drinking)
  ) {
    errors.push("Invalid drinking value");
  }

  if (
    data.maritalStatus !== undefined &&
    data.maritalStatus !== null &&
    !ALLOWED_MARITAL_STATUS.includes(data.maritalStatus)
  ) {
    errors.push("Invalid marital status");
  }

  if (
    data.minAge !== undefined &&
    data.maxAge !== undefined &&
    data.minAge !== null &&
    data.maxAge !== null &&
    data.minAge > data.maxAge
  ) {
    errors.push("minAge cannot be greater than maxAge");
  }

  if (
    data.minHeightCm !== undefined &&
    data.maxHeightCm !== undefined &&
    data.minHeightCm !== null &&
    data.maxHeightCm !== null &&
    data.minHeightCm > data.maxHeightCm
  ) {
    errors.push(
      "minHeightCm cannot be greater than maxHeightCm"
    );
  }

  return errors;
}

async function getMyPartnerPreferences(req, res) {
  try {
    const preferences = await getPartnerPreferences(
      req.user.userId
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Partner preferences not found",
      });
    }

    return res.status(200).json({
      success: true,
      partnerPreferences: preferences,
    });
  } catch (error) {
    console.error(
      "Get partner preferences error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get partner preferences",
    });
  }
}

async function createMyPartnerPreferences(req, res) {
  try {
    const rawPreferencesData =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};

    const preferencesData = sanitizePreferencesPayload(rawPreferencesData);

    const errors =
      validatePartnerPreferences(preferencesData);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const existing = await getPartnerPreferences(
      req.user.userId
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Partner preferences already exist",
      });
    }

    const preferences =
      await createPartnerPreferences(
        req.user.userId,
        preferencesData
      );

    return res.status(201).json({
      success: true,
      message: "Partner preferences created successfully",
      partnerPreferences: preferences,
    });
  } catch (error) {
    console.error(
      "Create partner preferences error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create partner preferences",
    });
  }
}

async function updateMyPartnerPreferences(req, res) {
  try {
    const rawPreferencesData =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};

    const preferencesData = sanitizePreferencesPayload(rawPreferencesData);

    const errors =
      validatePartnerPreferences(preferencesData);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const existing = await getPartnerPreferences(
      req.user.userId
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Partner preferences not found",
      });
    }

    const preferences =
      await updatePartnerPreferences(
        req.user.userId,
        preferencesData
      );

    return res.status(200).json({
      success: true,
      message: "Partner preferences updated successfully",
      partnerPreferences: preferences,
    });
  } catch (error) {
    console.error(
      "Update partner preferences error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update partner preferences",
    });
  }
}

module.exports = {
  getMyPartnerPreferences,
  createMyPartnerPreferences,
  updateMyPartnerPreferences,
};