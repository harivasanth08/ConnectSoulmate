const pool = require("../config/database");

async function getFamilyDetails(userId) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(
      `
      SELECT
        id,
        user_id,
        father_name,
        father_occupation,
        mother_name,
        mother_occupation,
        brothers,
        sisters,
        family_type,
        family_values,
        family_location,
        created_at,
        updated_at
      FROM family_details
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const family = rows[0];

    return {
      id: family.id,
      userId: family.user_id,
      fatherName: family.father_name,
      fatherOccupation: family.father_occupation,
      motherName: family.mother_name,
      motherOccupation: family.mother_occupation,
      brothers: family.brothers,
      sisters: family.sisters,
      familyType: family.family_type,
      familyValues: family.family_values,
      familyLocation: family.family_location,
      createdAt: family.created_at,
      updatedAt: family.updated_at,
    };
  } finally {
    connection.release();
  }
}

async function createFamilyDetails(userId, familyData) {
  const connection = await pool.getConnection();

  try {
    const {
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      brothers,
      sisters,
      familyType,
      familyValues,
      familyLocation,
    } = familyData;

    await connection.execute(
      `
      INSERT INTO family_details (
        user_id,
        father_name,
        father_occupation,
        mother_name,
        mother_occupation,
        brothers,
        sisters,
        family_type,
        family_values,
        family_location
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        fatherName || null,
        fatherOccupation || null,
        motherName || null,
        motherOccupation || null,
        brothers ?? null,
        sisters ?? null,
        familyType || null,
        familyValues || null,
        familyLocation || null,
      ]
    );
  } finally {
    connection.release();
  }

  return getFamilyDetails(userId);
}

async function updateFamilyDetails(userId, familyData) {
  const allowedFields = {
    fatherName: "father_name",
    fatherOccupation: "father_occupation",
    motherName: "mother_name",
    motherOccupation: "mother_occupation",
    brothers: "brothers",
    sisters: "sisters",
    familyType: "family_type",
    familyValues: "family_values",
    familyLocation: "family_location",
  };

  const fields = [];
  const values = [];

  for (const [key, column] of Object.entries(allowedFields)) {
    if (
      Object.prototype.hasOwnProperty.call(
        familyData,
        key
      )
    ) {
      fields.push(`${column} = ?`);

      values.push(
        familyData[key] === ""
          ? null
          : familyData[key]
      );
    }
  }

  if (fields.length === 0) {
    const error = new Error(
      "At least one family detail is required"
    );

    error.statusCode = 400;

    throw error;
  }

  values.push(userId);

  const connection = await pool.getConnection();

  try {
    const [result] = await connection.execute(
      `
      UPDATE family_details
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

  return getFamilyDetails(userId);
}

module.exports = {
  getFamilyDetails,
  createFamilyDetails,
  updateFamilyDetails,
};