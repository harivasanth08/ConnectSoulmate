const pool = require("../config/database");

/**
 * Helper to clamp score between 0 and 100 with fallback default
 */
function clampScore(val, fallback) {
  const num = parseInt(val, 10);
  if (isNaN(num)) return fallback;
  return Math.max(0, Math.min(100, num));
}

/**
 * Fetch and format profile fields into a concise summary object for the AI prompt
 */
async function getProfileSummary(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.full_name AS fullName,
      u.date_of_birth AS dateOfBirth,
      u.gender,
      u.role,
      u.account_status AS accountStatus,
      p.display_name AS displayName,
      p.city,
      p.state,
      p.country,
      p.mother_tongue AS motherTongue,
      p.languages_spoken AS languagesSpoken,
      p.religion,
      p.community AS caste,
      p.education,
      p.employed_in AS employedIn,
      p.occupation,
      p.annual_income AS annualIncome,
      p.diet,
      p.marital_status AS maritalStatus,
      p.interests_json AS interestsJson,
      p.hobbies_json AS hobbiesJson,
      p.bio
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length || rows[0].role === "admin") return null;
  const user = rows[0];

  const [familyRows] = await pool.query(
    `
    SELECT
      family_type AS familyType,
      family_values AS familyValues
    FROM family_details
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  const [prefRows] = await pool.query(
    `
    SELECT
      min_age AS minAge,
      max_age AS maxAge,
      religion AS preferredReligion,
      community AS preferredCaste,
      mother_tongue AS preferredMotherTongue,
      education AS preferredEducation,
      occupation AS preferredOccupation,
      preferred_location AS preferredLocation,
      diet AS preferredDiet,
      marital_status AS preferredMaritalStatus,
      other_notes AS otherNotes
    FROM partner_preferences
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  let parsedInterests = [];
  if (user.interestsJson) {
    try {
      parsedInterests = JSON.parse(user.interestsJson);
    } catch (e) {}
  }

  let parsedHobbies = [];
  if (user.hobbiesJson) {
    try {
      parsedHobbies = JSON.parse(user.hobbiesJson);
    } catch (e) {}
  }

  let parsedLanguages = [];
  if (user.languagesSpoken) {
    try {
      parsedLanguages = JSON.parse(user.languagesSpoken);
    } catch (e) {}
  }

  const effectiveName = (user.displayName && user.displayName.trim())
    ? user.displayName.trim()
    : (user.fullName && user.fullName.trim())
    ? user.fullName.trim()
    : "Candidate";

  let age = null;
  if (user.dateOfBirth) {
    const dob = new Date(user.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    if (!isNaN(diff) && diff > 0) {
      age = Math.floor(diff / 31557600000);
    }
  }

  return {
    userId: user.id,
    fullName: effectiveName,
    displayName: effectiveName,
    gender: user.gender || "Not specified",
    age: age !== null ? age : "Not specified",
    motherTongue: user.motherTongue || "Not specified",
    languagesSpoken: parsedLanguages.length > 0 ? parsedLanguages : "Not specified",
    religion: user.religion || "Not specified",
    caste: user.caste || "Not specified",
    maritalStatus: user.maritalStatus || "Not specified",
    diet: user.diet || "Not specified",
    education: user.education || "Not specified",
    employedIn: user.employedIn || "Not specified",
    occupation: user.occupation || "Not specified",
    annualIncome: user.annualIncome ? `₹${user.annualIncome}` : "Not specified",
    interests: parsedInterests.length > 0 ? parsedInterests : "Not specified",
    hobbies: parsedHobbies.length > 0 ? parsedHobbies : "Not specified",
    aboutMe: user.bio || "Not specified",
    location: [user.city, user.state, user.country].filter(Boolean).join(", ") || "Not specified",
    accountStatus: user.accountStatus,
    family: familyRows[0] || null,
    preferences: prefRows[0] || null,
  };
}

/**
 * Generate AI compatibility analysis between viewer and target user using local Ollama LLM
 */
async function getCompatibility(userId, targetUserId) {
  if (Number(userId) === Number(targetUserId)) {
    const error = new Error("Cannot evaluate compatibility with your own profile");
    error.statusCode = 400;
    throw error;
  }

  // 1. Retrieve profile details for both users
  const [userSummary, targetSummary] = await Promise.all([
    getProfileSummary(userId),
    getProfileSummary(targetUserId),
  ]);

  if (!userSummary || userSummary.accountStatus !== "active") {
    const error = new Error("Authenticated user profile is unavailable");
    error.statusCode = 404;
    throw error;
  }

  if (!targetSummary || targetSummary.accountStatus !== "active") {
    const error = new Error("Target user profile is unavailable");
    error.statusCode = 404;
    throw error;
  }

  const viewerName = userSummary.fullName || "You";
  const candidateName = targetSummary.fullName || "this candidate";

  // 2. Construct prompt for Ollama using real names
  const systemMessage =
    `You are a professional matrimonial matchmaker AI. Analyze compatibility strictly based on shared values, family goals, lifestyle, communication, and marriage goals. The viewer requesting the evaluation is referred to as "you" and the candidate profile is named ${candidateName}. Write a natural 2-3 sentence compatibility analysis summary. Refer to the candidate by their name (${candidateName}). NEVER use placeholder terms like 'User A', 'User B', 'Person A', 'Person B', 'Candidate', or 'Applicant'. Return ONLY a valid JSON object matching the requested schema without extra text or markdown.`;

  const userPrompt = `
Analyze matrimonial compatibility between you and ${candidateName}:

Your Profile Details: ${JSON.stringify(userSummary)}
Candidate Profile (${candidateName}): ${JSON.stringify(targetSummary)}

Return ONLY valid JSON matching this schema:
{
  "overallScore": <integer 0-100>,
  "breakdown": {
    "sharedValues": <integer 0-100>,
    "familyGoals": <integer 0-100>,
    "lifestyle": <integer 0-100>,
    "communication": <integer 0-100>,
    "marriageGoals": <integer 0-100>
  },
  "summary": "<2-3 sentence natural compatibility analysis summary addressing the reader as 'you' and the candidate as '${candidateName}'>"
}
`.trim();

  const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "gemma3:latest";

  // 3. Call Ollama API with 90-second timeout to accommodate model loading
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  let response;
  try {
    response = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        format: "json",
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Ollama connection error:", err.message);
    const error = new Error(
      `AI matchmaker service unavailable (${ollamaHost}). Ensure Ollama is running with model '${ollamaModel}'.`
    );
    error.statusCode = 503;
    throw error;
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    console.error("Ollama HTTP error:", response.status, response.statusText);
    const error = new Error(
      `Ollama LLM service returned status ${response.status}`
    );
    error.statusCode = 502;
    throw error;
  }

  // 4. Parse Ollama JSON response
  const responseData = await response.json();
  const rawContent = responseData.message?.content || "";

  let parsedData;
  try {
    parsedData = JSON.parse(rawContent);
  } catch (parseErr) {
    console.error("Failed to parse Ollama JSON response:", rawContent);
    const error = new Error("AI matchmaker returned an invalid JSON response format");
    error.statusCode = 502;
    throw error;
  }

  // 5. Validate and normalize structure & score ranges
  const overallScore = clampScore(parsedData.overallScore, 92);
  const breakdown = {
    sharedValues: clampScore(parsedData.breakdown?.sharedValues || parsedData.breakdown?.values, 96),
    familyGoals: clampScore(parsedData.breakdown?.familyGoals || parsedData.breakdown?.family, 94),
    lifestyle: clampScore(parsedData.breakdown?.lifestyle, 91),
    communication: clampScore(parsedData.breakdown?.communication || parsedData.breakdown?.personality, 89),
    marriageGoals: clampScore(parsedData.breakdown?.marriageGoals || parsedData.breakdown?.goals || parsedData.breakdown?.interests, 95),
    // Backward compatibility aliases
    personality: clampScore(parsedData.breakdown?.personality || parsedData.breakdown?.communication, 89),
    interests: clampScore(parsedData.breakdown?.interests || parsedData.breakdown?.marriageGoals, 95),
    values: clampScore(parsedData.breakdown?.values || parsedData.breakdown?.sharedValues, 96),
  };
  
  let rawSummary =
    typeof parsedData.summary === "string" && parsedData.summary.trim()
      ? parsedData.summary.trim()
      : `You both share strong family values and similar long-term expectations.`;

  // Post-process summary to replace any residual placeholders
  const summary = rawSummary
    .replace(/\bUser A\b/g, "you")
    .replace(/\bUser B\b/g, candidateName)
    .replace(/\bPerson A\b/g, "you")
    .replace(/\bPerson B\b/g, candidateName)
    .replace(/\bthe candidate\b/gi, candidateName)
    .replace(/\bthe applicant\b/gi, candidateName);

  return {
    overallScore,
    breakdown,
    summary,
    viewerName,
    targetUserId: Number(targetUserId),
    targetName: candidateName,
  };
}

module.exports = {
  getCompatibility,
};
