const Astronomy = require("astronomy-engine");

// 12 Rashis (Zodiac Signs) in Vedic Astrology
const RASHIS = [
  { id: 0, name: "Aries (Mesha)", lord: "Mars", varna: 1, vashya: "Chatushpada" },
  { id: 1, name: "Taurus (Vrishabha)", lord: "Venus", varna: 2, vashya: "Chatushpada" },
  { id: 2, name: "Gemini (Mithuna)", lord: "Mercury", varna: 3, vashya: "Manav" },
  { id: 3, name: "Cancer (Karka)", lord: "Moon", varna: 0, vashya: "Jalchar" },
  { id: 4, name: "Leo (Simha)", lord: "Sun", varna: 1, vashya: "Vanachara" },
  { id: 5, name: "Virgo (Kanya)", lord: "Mercury", varna: 2, vashya: "Manav" },
  { id: 6, name: "Libra (Tula)", lord: "Venus", varna: 3, vashya: "Manav" },
  { id: 7, name: "Scorpio (Vrishchika)", lord: "Mars", varna: 0, vashya: "Keeta" },
  { id: 8, name: "Sagittarius (Dhanu)", lord: "Jupiter", varna: 1, vashya: "Manav" },
  { id: 9, name: "Capricorn (Makara)", lord: "Saturn", varna: 2, vashya: "Jalchar" },
  { id: 10, name: "Aquarius (Kumbha)", lord: "Saturn", varna: 3, vashya: "Manav" },
  { id: 11, name: "Pisces (Meena)", lord: "Jupiter", varna: 0, vashya: "Jalchar" },
];

// 27 Nakshatras (Lunar Mansions) in Vedic Astrology
const NAKSHATRAS = [
  { id: 0, name: "Ashwini", gana: "Deva", yoni: "Horse", nadi: "Adi" },
  { id: 1, name: "Bharani", gana: "Manushya", yoni: "Elephant", nadi: "Madhya" },
  { id: 2, name: "Krittika", gana: "Rakshasa", yoni: "Sheep", nadi: "Antya" },
  { id: 3, name: "Rohini", gana: "Manushya", yoni: "Serpent", nadi: "Antya" },
  { id: 4, name: "Mrigashira", gana: "Deva", yoni: "Serpent", nadi: "Madhya" },
  { id: 5, name: "Ardra", gana: "Manushya", yoni: "Dog", nadi: "Adi" },
  { id: 6, name: "Punarvasu", gana: "Deva", yoni: "Cat", nadi: "Adi" },
  { id: 7, name: "Pushya", gana: "Deva", yoni: "Sheep", nadi: "Madhya" },
  { id: 8, name: "Ashlesha", gana: "Rakshasa", yoni: "Cat", nadi: "Antya" },
  { id: 9, name: "Magha", gana: "Rakshasa", yoni: "Rat", nadi: "Antya" },
  { id: 10, name: "Purva Phalguni", gana: "Manushya", yoni: "Rat", nadi: "Madhya" },
  { id: 11, name: "Uttara Phalguni", gana: "Manushya", yoni: "Cow", nadi: "Adi" },
  { id: 12, name: "Hasta", gana: "Deva", yoni: "Buffalo", nadi: "Adi" },
  { id: 13, name: "Chitra", gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya" },
  { id: 14, name: "Swati", gana: "Deva", yoni: "Buffalo", nadi: "Antya" },
  { id: 15, name: "Vishakha", gana: "Rakshasa", yoni: "Tiger", nadi: "Antya" },
  { id: 16, name: "Anuradha", gana: "Deva", yoni: "Deer", nadi: "Madhya" },
  { id: 17, name: "Jyeshtha", gana: "Rakshasa", yoni: "Deer", nadi: "Adi" },
  { id: 18, name: "Mula", gana: "Rakshasa", yoni: "Dog", nadi: "Adi" },
  { id: 19, name: "Purva Ashadha", gana: "Manushya", yoni: "Monkey", nadi: "Madhya" },
  { id: 20, name: "Uttara Ashadha", gana: "Manushya", yoni: "Mongoose", nadi: "Antya" },
  { id: 21, name: "Shravana", gana: "Deva", yoni: "Monkey", nadi: "Antya" },
  { id: 22, name: "Dhanishta", gana: "Rakshasa", yoni: "Lion", nadi: "Madhya" },
  { id: 23, name: "Shatabhisha", gana: "Rakshasa", yoni: "Horse", nadi: "Adi" },
  { id: 24, name: "Purva Bhadrapada", gana: "Manushya", yoni: "Lion", nadi: "Adi" },
  { id: 25, name: "Uttara Bhadrapada", gana: "Manushya", yoni: "Cow", nadi: "Madhya" },
  { id: 26, name: "Revati", gana: "Deva", yoni: "Elephant", nadi: "Antya" },
];

/**
 * Calculates accurate Lahiri Ayanamsa angle for a given UTC Date
 */
function getLahiriAyanamsa(dateUtc) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const days = (dateUtc.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  const centuries = days / 36525;
  return 23.856106 + 1.396042 * centuries + 0.000308 * centuries ** 2;
}

/**
 * Parses date string (YYYY-MM-DD) and time string (HH:MM or HH:MM AM/PM) into a UTC Date object
 */
function parseBirthDateTime(dateStr, timeStr) {
  if (!dateStr) throw new Error("Date of birth is required");

  const cleanDate = dateStr.trim();
  let hours = 12;
  let minutes = 0;

  if (timeStr && typeof timeStr === "string") {
    const timeClean = timeStr.trim().toUpperCase();
    const isPm = timeClean.includes("PM");
    const isAm = timeClean.includes("AM");
    const numbers = timeClean.replace(/[^0-9:]/g, "").split(":");

    if (numbers.length >= 1 && numbers[0] !== "") {
      let h = parseInt(numbers[0], 10);
      let m = numbers.length >= 2 ? parseInt(numbers[1], 10) : 0;

      if (!isNaN(h) && h >= 0 && h <= 23) {
        if (isPm && h < 12) h += 12;
        if (isAm && h === 12) h = 0;
        hours = h;
      }
      if (!isNaN(m) && m >= 0 && m <= 59) {
        minutes = m;
      }
    }
  }

  const pad = (num) => String(num).padStart(2, "0");
  const isoString = `${cleanDate}T${pad(hours)}:${pad(minutes)}:00Z`;
  const dateObj = new Date(isoString);

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid birth date or time format: ${dateStr} ${timeStr}`);
  }

  return dateObj;
}

/**
 * Derives Sidereal Moon & Mars details using astronomy ephemeris
 */
function getPlanetaryPositions(dateUtc) {
  const ayanamsa = getLahiriAyanamsa(dateUtc);

  // 1. Moon
  const moonGeo = Astronomy.GeoVector("Moon", dateUtc, false);
  const moonEcl = Astronomy.Ecliptic(moonGeo);
  const siderealMoonLong = (moonEcl.elon - ayanamsa + 360) % 360;

  const rashiIndex = Math.floor(siderealMoonLong / 30);
  const nakshatraIndex = Math.floor(siderealMoonLong / (360 / 27));
  const pada = Math.floor((siderealMoonLong % (360 / 27)) / (360 / 108)) + 1;

  // 2. Mars (for Mangal Dosha)
  const marsGeo = Astronomy.GeoVector("Mars", dateUtc, false);
  const marsEcl = Astronomy.Ecliptic(marsGeo);
  const siderealMarsLong = (marsEcl.elon - ayanamsa + 360) % 360;
  const marsRashiIndex = Math.floor(siderealMarsLong / 30);

  return {
    moon: {
      siderealLong: siderealMoonLong,
      rashi: RASHIS[rashiIndex],
      nakshatra: NAKSHATRAS[nakshatraIndex],
      pada,
    },
    mars: {
      rashi: RASHIS[marsRashiIndex],
    },
  };
}

/**
 * Calculates Ashta Koota 36-Guna compatibility between Person 1 (Groom/Partner A) and Person 2 (Bride/Partner B)
 */
function calculateAshtaKoota(p1Pos, p2Pos) {
  const r1 = p1Pos.moon.rashi.id;
  const r2 = p2Pos.moon.rashi.id;
  const n1 = p1Pos.moon.nakshatra.id;
  const n2 = p2Pos.moon.nakshatra.id;

  const lord1 = p1Pos.moon.rashi.lord;
  const lord2 = p2Pos.moon.rashi.lord;

  // --- 1. VARNA KOOTA (Max 1) ---
  const v1 = p1Pos.moon.rashi.varna;
  const v2 = p2Pos.moon.rashi.varna;
  const varnaScore = v1 <= v2 ? 1 : 0;
  const varnaInterp =
    varnaScore === 1
      ? "Strong alignment in spiritual values, work ethics, and fundamental life goals."
      : "Slight difference in spiritual temperament; requires mutual understanding of work and social priorities.";

  // --- 2. VASHYA KOOTA (Max 2) ---
  const VASHYA_MATRIX = {
    Chatushpada: { Chatushpada: 2, Manav: 1, Jalchar: 1, Vanachara: 0.5, Keeta: 1 },
    Manav: { Chatushpada: 1, Manav: 2, Jalchar: 0.5, Vanachara: 0, Keeta: 1 },
    Jalchar: { Chatushpada: 1, Manav: 0.5, Jalchar: 2, Vanachara: 1, Keeta: 1 },
    Vanachara: { Chatushpada: 0.5, Manav: 0, Jalchar: 1, Vanachara: 2, Keeta: 0 },
    Keeta: { Chatushpada: 1, Manav: 1, Jalchar: 1, Vanachara: 0, Keeta: 2 },
  };
  const vas1 = p1Pos.moon.rashi.vashya;
  const vas2 = p2Pos.moon.rashi.vashya;
  const vashyaScore = VASHYA_MATRIX[vas1]?.[vas2] ?? 1;
  const vashyaInterp =
    vashyaScore >= 1.5
      ? "Excellent mutual attraction, respect, and natural balance of authority."
      : "Moderate attraction; conscious communication needed regarding decision-making.";

  // --- 3. TARA KOOTA (Max 3) ---
  const tara1 = (n1 - n2 + 27) % 9;
  const tara2 = (n2 - n1 + 27) % 9;
  const auspiciousTaras = [2, 4, 6, 8, 0]; // Sampat, Kshema, Sadhana, Mitra, Parama Mitra
  const isGood1 = auspiciousTaras.includes(tara1);
  const isGood2 = auspiciousTaras.includes(tara2);

  let taraScore = 0;
  if (isGood1 && isGood2) taraScore = 3;
  else if (isGood1 || isGood2) taraScore = 1.5;
  const taraInterp =
    taraScore === 3
      ? "High destiny harmony; promotes health, prosperity, and mutual well-being."
      : taraScore === 1.5
      ? "Balanced destiny; one partner brings strong luck and growth to the other."
      : "Challenging stellar compatibility; patience needed during stressful phases.";

  // --- 4. YONI KOOTA (Max 4) ---
  const YONI_ENEMIES = {
    Horse: "Buffalo",
    Elephant: "Lion",
    Sheep: "Monkey",
    Serpent: "Mongoose",
    Dog: "Deer",
    Cat: "Rat",
    Cow: "Tiger",
    Buffalo: "Horse",
    Tiger: "Cow",
    Deer: "Dog",
    Monkey: "Sheep",
    Mongoose: "Serpent",
    Lion: "Elephant",
    Rat: "Cat",
  };
  const y1 = p1Pos.moon.nakshatra.yoni;
  const y2 = p2Pos.moon.nakshatra.yoni;

  let yoniScore = 2;
  if (y1 === y2) yoniScore = 4;
  else if (YONI_ENEMIES[y1] === y2) yoniScore = 0;
  else yoniScore = 3;

  const yoniInterp =
    yoniScore === 4
      ? "Perfect biological and intimate harmony; deeply affectionate relationship."
      : yoniScore === 3
      ? "Friendly physical and emotional chemistry."
      : yoniScore === 2
      ? "Neutral physical compatibility; requires emotional warmth and bonding."
      : "Conflicting innate instincts; requires patience and compromise in daily habits.";

  // --- 5. GRAHA MAITRI KOOTA (Max 5) ---
  const LORD_RELATIONS = {
    Sun: { Sun: 5, Moon: 5, Mars: 5, Mercury: 4, Jupiter: 5, Venus: 0, Saturn: 0 },
    Moon: { Sun: 5, Moon: 5, Mars: 4, Mercury: 5, Jupiter: 4, Venus: 0.5, Saturn: 0.5 },
    Mars: { Sun: 5, Moon: 5, Mars: 5, Mercury: 0.5, Jupiter: 5, Venus: 3, Saturn: 0.5 },
    Mercury: { Sun: 4, Moon: 1, Mars: 0.5, Mercury: 5, Jupiter: 1, Venus: 5, Saturn: 4 },
    Jupiter: { Sun: 5, Moon: 5, Mars: 5, Mercury: 1, Jupiter: 5, Venus: 0.5, Saturn: 3 },
    Venus: { Sun: 0, Moon: 0.5, Mars: 3, Mercury: 5, Jupiter: 0.5, Venus: 5, Saturn: 5 },
    Saturn: { Sun: 0, Moon: 0.5, Mars: 0.5, Mercury: 4, Jupiter: 3, Venus: 5, Saturn: 5 },
  };
  const maitriScore = LORD_RELATIONS[lord1]?.[lord2] ?? 3;
  const maitriInterp =
    maitriScore >= 4
      ? "Strong mental friendship and intellectual compatibility; shared worldview."
      : maitriScore >= 2.5
      ? "Good intellectual understanding with occasional difference of perspectives."
      : "Differing mindsets and opinions; active listening and mutual respect are essential.";

  // --- 6. GANA KOOTA (Max 6) ---
  const g1 = p1Pos.moon.nakshatra.gana;
  const g2 = p2Pos.moon.nakshatra.gana;

  let ganaScore = 0;
  if (g1 === g2) ganaScore = 6;
  else if ((g1 === "Deva" && g2 === "Manushya") || (g1 === "Manushya" && g2 === "Deva"))
    ganaScore = 5;
  else if (g1 === "Deva" && g2 === "Rakshasa") ganaScore = 1;
  else ganaScore = 0;

  const ganaInterp =
    ganaScore >= 5
      ? "Harmonious temperament and social behavior; effortless coordination."
      : ganaScore === 1
      ? "Distinct temperaments; one partner is gentle while the other is highly assertive."
      : "Contrasting life temperaments; needs mutual flexibility and tolerance.";

  // --- 7. BHAKOOT KOOTA (Max 7) ---
  const diff = ((r2 - r1 + 12) % 12) + 1;
  let bhakootScore = 7;
  let bhakootDosha = false;

  if ([2, 12, 5, 9, 6, 8].includes(diff)) {
    // Exemption: same planetary lord or friendly lords
    if (lord1 === lord2) {
      bhakootScore = 7;
      bhakootDosha = false;
    } else {
      bhakootScore = 0;
      bhakootDosha = true;
    }
  }

  const bhakootInterp = !bhakootDosha
    ? "Auspicious planetary positioning for financial growth, family happiness, and longevity."
    : "Bhakoot Dosha present; planetary distance suggests financial or family friction unless cancelled by remedies.";

  // --- 8. NADI KOOTA (Max 8) ---
  const nad1 = p1Pos.moon.nakshatra.nadi;
  const nad2 = p2Pos.moon.nakshatra.nadi;

  let nadiScore = 8;
  let nadiDosha = false;

  if (nad1 === nad2) {
    nadiScore = 0;
    nadiDosha = true;
  }

  const nadiInterp = !nadiDosha
    ? `Excellent genetic & physiological harmony (${nad1} & ${nad2}); fosters healthy progeny.`
    : `Nadi Dosha present (both partners belong to ${nad1} Nadi); health consultation and traditional astrological remedies advised.`;

  const totalScore =
    varnaScore +
    vashyaScore +
    taraScore +
    yoniScore +
    maitriScore +
    ganaScore +
    bhakootScore +
    nadiScore;

  // --- MANGAL DOSHA EVALUATION ---
  // Chandra Mangal: Mars position relative to Moon sign
  const marsDiff1 = (p1Pos.mars.rashi.id - r1 + 12) % 12;
  const marsDiff2 = (p2Pos.mars.rashi.id - r2 + 12) % 12;
  const mangalHouses = [0, 1, 3, 6, 7, 11]; // 1st, 2nd, 4th, 7th, 8th, 12th relative house

  const p1Mangal = mangalHouses.includes(marsDiff1);
  const p2Mangal = mangalHouses.includes(marsDiff2);

  let mangalSummary = "No Mangal Dosha conflict detected.";
  if (p1Mangal && p2Mangal) {
    mangalSummary = "Both partners have Chandra Mangal Dosha, which effectively neutralizes (cancels out) the dosha effects.";
  } else if (p1Mangal) {
    mangalSummary = `Person 1 has Chandra Mangal placement in ${p1Pos.mars.rashi.name}. High energy partner.`;
  } else if (p2Mangal) {
    mangalSummary = `Person 2 has Chandra Mangal placement in ${p2Pos.mars.rashi.name}. High energy partner.`;
  }

  // --- VERDICT & INTERPRETATION ---
  let verdict = "Low Compatibility";
  let verdictBadge = "Caution";

  if (totalScore >= 28) {
    verdict = "Excellent Compatibility";
    verdictBadge = "Highly Auspicious";
  } else if (totalScore >= 21) {
    verdict = "Good Compatibility";
    verdictBadge = "Auspicious";
  } else if (totalScore >= 18) {
    verdict = "Average Compatibility";
    verdictBadge = "Acceptable";
  }

  // Strengths & Considerations
  const strengths = [];
  const concerns = [];

  if (nadiScore === 8) strengths.push("Strong health, vitality, and progeny potential (No Nadi Dosha)");
  if (bhakootScore === 7) strengths.push("Prosperous emotional and financial alignment (No Bhakoot Dosha)");
  if (ganaScore >= 5) strengths.push("High temperament harmony and mutual respect");
  if (maitriScore >= 4) strengths.push("Strong mental friendship and shared mindset");
  if (yoniScore >= 3) strengths.push("Friendly instinctual and intimate chemistry");

  if (nadiDosha) concerns.push("Same Nadi detected (Nadi Dosha); consult an astrologer for remedial guidance");
  if (bhakootDosha) concerns.push("Bhakoot positioning indicates potential domestic or financial adjustment needed");
  if (ganaScore === 0) concerns.push("Temperament contrast (Gana difference); requires empathetic communication");
  if (maitriScore < 2) concerns.push("Rashi lords are non-friendly; active listening prevents misunderstandings");

  if (strengths.length === 0) strengths.push("Balanced mutual efforts can build a stable foundation");

  return {
    totalScore,
    maxScore: 36,
    percentage: Math.round((totalScore / 36) * 100),
    verdict,
    verdictBadge,
    kootaBreakdown: [
      { koota: "Varna", maxScore: 1, obtainedScore: varnaScore, interpretation: varnaInterp },
      { koota: "Vashya", maxScore: 2, obtainedScore: vashyaScore, interpretation: vashyaInterp },
      { koota: "Tara", maxScore: 3, obtainedScore: taraScore, interpretation: taraInterp },
      { koota: "Yoni", maxScore: 4, obtainedScore: yoniScore, interpretation: yoniInterp },
      { koota: "Graha Maitri", maxScore: 5, obtainedScore: maitriScore, interpretation: maitriInterp },
      { koota: "Gana", maxScore: 6, obtainedScore: ganaScore, interpretation: ganaInterp },
      { koota: "Bhakoot", maxScore: 7, obtainedScore: bhakootScore, interpretation: bhakootInterp, hasDosha: bhakootDosha },
      { koota: "Nadi", maxScore: 8, obtainedScore: nadiScore, interpretation: nadiInterp, hasDosha: nadiDosha },
    ],
    doshaDetails: {
      mangalDosha: {
        person1HasDosha: p1Mangal,
        person2HasDosha: p2Mangal,
        isCancelled: p1Mangal && p2Mangal,
        summary: mangalSummary,
      },
      bhakootDosha,
      nadiDosha,
    },
    strengths,
    concerns,
    disclaimer:
      "Vedic Kundali Matching (Ashta Koota Milan) is a traditional cultural framework designed to provide insights into matrimonial harmony. It should be used as a helpful reference alongside personal values, trust, mutual respect, and open communication.",
  };
}

/**
 * Main service method to compute Kundali compatibility between two persons
 */
async function calculateKundaliMatch(person1Data, person2Data) {
  const p1Date = parseBirthDateTime(person1Data.dateOfBirth, person1Data.timeOfBirth);
  const p2Date = parseBirthDateTime(person2Data.dateOfBirth, person2Data.timeOfBirth);

  const p1Positions = getPlanetaryPositions(p1Date);
  const p2Positions = getPlanetaryPositions(p2Date);

  const matchResults = calculateAshtaKoota(p1Positions, p2Positions);

  return {
    person1: {
      name: person1Data.name || "Person 1",
      dateOfBirth: person1Data.dateOfBirth,
      timeOfBirth: person1Data.timeOfBirth || "12:00 PM (Default)",
      birthPlace: person1Data.birthPlace || "Not Specified",
      rashi: p1Positions.moon.rashi.name,
      rashiLord: p1Positions.moon.rashi.lord,
      nakshatra: p1Positions.moon.nakshatra.name,
      pada: p1Positions.moon.pada,
      gana: p1Positions.moon.nakshatra.gana,
      yoni: p1Positions.moon.nakshatra.yoni,
      nadi: p1Positions.moon.nakshatra.nadi,
    },
    person2: {
      name: person2Data.name || "Person 2",
      dateOfBirth: person2Data.dateOfBirth,
      timeOfBirth: person2Data.timeOfBirth || "12:00 PM (Default)",
      birthPlace: person2Data.birthPlace || "Not Specified",
      rashi: p2Positions.moon.rashi.name,
      rashiLord: p2Positions.moon.rashi.lord,
      nakshatra: p2Positions.moon.nakshatra.name,
      pada: p2Positions.moon.pada,
      gana: p2Positions.moon.nakshatra.gana,
      yoni: p2Positions.moon.nakshatra.yoni,
      nadi: p2Positions.moon.nakshatra.nadi,
    },
    ...matchResults,
  };
}

module.exports = {
  calculateKundaliMatch,
  parseBirthDateTime,
};
