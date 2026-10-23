const { calculateKundaliMatch } = require("../services/kundali.service");
const pool = require("../config/database");

/**
 * Validates individual person birth details payload
 */
function validatePersonDetails(person, label) {
  if (!person || typeof person !== "object") {
    return `${label} details are required`;
  }

  if (!person.dateOfBirth || typeof person.dateOfBirth !== "string") {
    return `Valid date of birth is required for ${label}`;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(person.dateOfBirth.trim())) {
    return `Date of birth for ${label} must be in YYYY-MM-DD format`;
  }

  const birthYear = parseInt(person.dateOfBirth.trim().split("-")[0], 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(birthYear) || birthYear < 1920 || birthYear > currentYear) {
    return `Please enter a realistic birth year for ${label} (1920 - ${currentYear})`;
  }

  if (person.timeOfBirth && typeof person.timeOfBirth !== "string") {
    return `Time of birth for ${label} must be a valid string (HH:MM)`;
  }

  if (person.birthPlace && typeof person.birthPlace !== "string") {
    return `Birth place for ${label} must be a valid string`;
  }

  return null;
}

/**
 * Endpoint controller for POST /api/kundali/match
 */
async function matchKundaliController(req, res) {
  try {
    const { person1, person2 } = req.body;

    // 1. Validate payloads
    const err1 = validatePersonDetails(person1, "Person 1");
    if (err1) {
      return res.status(400).json({ success: false, message: err1 });
    }

    const err2 = validatePersonDetails(person2, "Person 2");
    if (err2) {
      return res.status(400).json({ success: false, message: err2 });
    }

    // 2. Perform Kundali match calculation
    const matchResult = await calculateKundaliMatch(person1, person2);

    return res.status(200).json({
      success: true,
      message: "Kundali compatibility calculated successfully",
      data: matchResult,
    });
  } catch (error) {
    console.error("Kundali match error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate Kundali compatibility",
    });
  }
}

/**
 * Endpoint controller for GET /api/kundali/candidates
 * Retrieves shortlisted/connected profiles for Person 2 quick selection
 */
async function getCandidatesForMatchingController(req, res) {
  try {
    const userId = req.user.userId;

    const [candidates] = await pool.query(
      `
      SELECT
        u.id AS userId,
        u.full_name AS fullName,
        u.gender,
        u.date_of_birth AS dateOfBirth,
        p.time_of_birth AS timeOfBirth,
        p.birth_place AS birthPlace,
        p.city,
        p.state,
        p.country,
        p.profile_photo AS profilePhoto,
        p.occupation
      FROM shortlists s
      INNER JOIN users u ON u.id = s.shortlisted_user_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE s.user_id = ? AND u.account_status = 'active' AND (u.role IS NULL OR u.role != 'admin')
      ORDER BY s.created_at DESC
      LIMIT 20
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      candidates: candidates.map((c) => ({
        userId: c.userId,
        fullName: c.fullName,
        gender: c.gender,
        dateOfBirth: c.dateOfBirth,
        timeOfBirth: c.timeOfBirth || "",
        birthPlace: c.birthPlace || [c.city, c.state, c.country].filter(Boolean).join(", ") || "",
        profilePhoto: c.profilePhoto,
        occupation: c.occupation,
      })),
    });
  } catch (error) {
    console.error("Error fetching matching candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate list",
    });
  }
}

module.exports = {
  matchKundaliController,
  getCandidatesForMatchingController,
};
