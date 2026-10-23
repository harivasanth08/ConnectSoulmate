const {
  getFamilyDetails,
  createFamilyDetails,
  updateFamilyDetails,
} = require("../services/family.service");

const ALLOWED_FAMILY_TYPES = [
  "nuclear",
  "joint",
  "other",
];

const ALLOWED_FAMILY_VALUES = [
  "traditional",
  "moderate",
  "liberal",
];

function validateFamilyData(data) {
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
  } = data;

  const textFields = [
    ["fatherName", fatherName, 100],
    ["fatherOccupation", fatherOccupation, 150],
    ["motherName", motherName, 100],
    ["motherOccupation", motherOccupation, 150],
    ["familyLocation", familyLocation, 150],
  ];

  for (const [field, value, maxLength] of textFields) {
    if (value !== undefined && value !== null) {
      if (
        typeof value !== "string" ||
        value.length > maxLength
      ) {
        return `${field} must be a string with a maximum of ${maxLength} characters`;
      }
    }
  }

  if (brothers !== undefined && brothers !== null) {
    if (
      !Number.isInteger(brothers) ||
      brothers < 0 ||
      brothers > 50
    ) {
      return "Brothers must be a whole number between 0 and 50";
    }
  }

  if (sisters !== undefined && sisters !== null) {
    if (
      !Number.isInteger(sisters) ||
      sisters < 0 ||
      sisters > 50
    ) {
      return "Sisters must be a whole number between 0 and 50";
    }
  }

  if (
    familyType !== undefined &&
    familyType !== null
  ) {
    if (!ALLOWED_FAMILY_TYPES.includes(familyType)) {
      return "Invalid family type";
    }
  }

  if (
    familyValues !== undefined &&
    familyValues !== null
  ) {
    if (
      !ALLOWED_FAMILY_VALUES.includes(familyValues)
    ) {
      return "Invalid family values";
    }
  }

  return null;
}

async function getMyFamilyDetails(req, res) {
  try {
    const family = await getFamilyDetails(
      req.user.userId
    );

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family details not found",
      });
    }

    return res.status(200).json({
      success: true,
      family,
      familyDetails: family,
    });
  } catch (error) {
    console.error(
      "Get family details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch family details",
    });
  }
}

async function createMyFamilyDetails(req, res) {
  try {
    const familyData =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};

    const validationError =
      validateFamilyData(familyData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingFamily =
      await getFamilyDetails(req.user.userId);

    if (existingFamily) {
      const updatedFamily = await updateFamilyDetails(
        req.user.userId,
        familyData
      );

      return res.status(200).json({
        success: true,
        message: "Family details updated successfully",
        family: updatedFamily,
        familyDetails: updatedFamily,
      });
    }

    const family = await createFamilyDetails(
      req.user.userId,
      familyData
    );

    return res.status(201).json({
      success: true,
      message: "Family details created successfully",
      family,
      familyDetails: family,
    });
  } catch (error) {
    console.error(
      "Create family details error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to create family details",
    });
  }
}

async function updateMyFamilyDetails(req, res) {
  try {
    const familyData =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};

    const validationError =
      validateFamilyData(familyData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingFamily =
      await getFamilyDetails(req.user.userId);

    if (!existingFamily) {
      const createdFamily = await createFamilyDetails(
        req.user.userId,
        familyData
      );

      return res.status(200).json({
        success: true,
        message: "Family details saved successfully",
        family: createdFamily,
        familyDetails: createdFamily,
      });
    }

    const family = await updateFamilyDetails(
      req.user.userId,
      familyData
    );

    return res.status(200).json({
      success: true,
      message: "Family details updated successfully",
      family,
      familyDetails: family,
    });
  } catch (error) {
    console.error(
      "Update family details error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to update family details",
    });
  }
}

module.exports = {
  getMyFamilyDetails,
  createMyFamilyDetails,
  updateMyFamilyDetails,
};