const fs = require("fs");
const path = require("path");









function getImageTypeFromBuffer(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}












const {
  getProfile,
  createProfile,
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  searchProfiles,
  getPublicProfileById,
} = require("../services/profile.service");

const ALLOWED_MARITAL_STATUSES = [
  "never_married",
  "divorced",
  "widowed",
  "separated",
];

function validateProfileData(data) {



const ALLOWED_DIETS = [
  "vegetarian",
  "non_vegetarian",
  "vegan",
  "eggetarian",
  "other",
];

const ALLOWED_HABITS = [
  "yes",
  "no",
  "occasionally",
];




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
} = data;






  if (bio !== undefined && bio !== null) {
    if (typeof bio !== "string" || bio.length > 2000) {
      return "Bio must be a string with a maximum of 2000 characters";
    }
  }

  const textFields = [
    ["city", city, 100],
    ["state", state, 100],
    ["country", country, 100],
    ["education", education, 150],
    ["occupation", occupation, 150],
  ];

  for (const [field, value, maxLength] of textFields) {
    if (value !== undefined && value !== null) {
      if (typeof value !== "string" || value.length > maxLength) {
        return `${field} must be a string with a maximum of ${maxLength} characters`;
      }
    }
  }

  if (heightCm !== undefined && heightCm !== null) {
    if (
      !Number.isInteger(heightCm) ||
      heightCm < 100 ||
      heightCm > 250
    ) {
      return "Height must be a whole number between 100 and 250 cm";
    }
  }

  if (maritalStatus !== undefined && maritalStatus !== null) {
    if (!ALLOWED_MARITAL_STATUSES.includes(maritalStatus)) {
      return "Invalid marital status";
    }
  }

  const textFieldsExtended = [
  ["religion", religion, 100],
  ["community", community, 100],
  ["motherTongue", motherTongue, 100],
];

for (const [field, value, maxLength] of textFieldsExtended) {
  if (value !== undefined && value !== null) {
    if (
      typeof value !== "string" ||
      value.length > maxLength
    ) {
      return `${field} must be a string with a maximum of ${maxLength} characters`;
    }
  }
}

if (diet !== undefined && diet !== null) {
  if (!ALLOWED_DIETS.includes(diet)) {
    return "Invalid diet";
  }
}

if (smoking !== undefined && smoking !== null) {
  if (!ALLOWED_HABITS.includes(smoking)) {
    return "Invalid smoking preference";
  }
}

if (drinking !== undefined && drinking !== null) {
  if (!ALLOWED_HABITS.includes(drinking)) {
    return "Invalid drinking preference";
  }
}

if (annualIncome !== undefined && annualIncome !== null) {
  if (
    typeof annualIncome !== "number" ||
    !Number.isFinite(annualIncome) ||
    annualIncome < 0 ||
    annualIncome > 9999999999.99
  ) {
    return "Annual income must be a valid non-negative number";
  }
}






  return null;
}

async function getMyProfile(req, res) {
  try {
    const profile = await getProfile(req.user.userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
}

async function createMyProfile(req, res) {
  try {
    const profileData =
  req.body &&
  typeof req.body === "object" &&
  !Array.isArray(req.body)
    ? req.body
    : {};

    const validationError = validateProfileData(profileData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingProfile = await getProfile(req.user.userId);

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const profile = await createProfile(
      req.user.userId,
      profileData
    );

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to create profile",
    });
  }
}

async function updateMyProfile(req, res) {
  try {
    const profileData =
  req.body &&
  typeof req.body === "object" &&
  !Array.isArray(req.body)
    ? req.body
    : {};

    const validationError = validateProfileData(profileData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingProfile = await getProfile(req.user.userId);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const profile = await updateProfile(
      req.user.userId,
      profileData
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to update profile",
    });
  }
}






function getProfilePhotoFilePath(profilePhoto) {
  if (!profilePhoto) {
    return null;
  }

  const uploadsDirectory = path.resolve(
    __dirname,
    "../../uploads/profile-photos"
  );

  const fileName = path.basename(profilePhoto);

  return path.join(uploadsDirectory, fileName);
}

function deletePhotoFile(profilePhoto) {
  const filePath = getProfilePhotoFilePath(profilePhoto);

  if (!filePath) {
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to delete profile photo file:", error);
  }
}











async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }







    const fileBuffer = await fs.promises.readFile(
  req.file.path
);

const detectedType = getImageTypeFromBuffer(fileBuffer);

const allowedImageTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const extension = path
  .extname(req.file.originalname)
  .toLowerCase();

const expectedType = allowedImageTypes[extension];

if (!detectedType || detectedType !== expectedType) {
  deletePhotoFile(
    `/uploads/profile-photos/${req.file.filename}`
  );

  return res.status(400).json({
    success: false,
    message: "Invalid image file",
  });
}







    const existingProfile = await getProfile(req.user.userId);

    const newProfilePhoto =
      `/uploads/profile-photos/${req.file.filename}`;

    const updatedProfile = await updateProfilePhoto(
      req.user.userId,
      newProfilePhoto
    );

    if (!updatedProfile) {
      deletePhotoFile(newProfilePhoto);

      return res.status(500).json({
        success: false,
        message: "Unable to upload profile photo",
      });
    }

    // Delete the previous physical file only after
    // the database has been successfully updated.
    if (
      existingProfile &&
      existingProfile.profilePhoto &&
      existingProfile.profilePhoto !== newProfilePhoto
    ) {
      deletePhotoFile(existingProfile.profilePhoto);
    }

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Upload profile photo error:", error);

    if (req.file) {
      deletePhotoFile(
        `/uploads/profile-photos/${req.file.filename}`
      );
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload profile photo",
    });
  }
}








async function deleteMyProfilePhoto(req, res) {
  try {
    const existingProfile = await getProfile(req.user.userId);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (!existingProfile.profilePhoto) {
      return res.status(404).json({
        success: false,
        message: "No profile photo to delete",
      });
    }

    const oldProfilePhoto = existingProfile.profilePhoto;

    const updatedProfile = await deleteProfilePhoto(
      req.user.userId
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    deletePhotoFile(oldProfilePhoto);

    return res.status(200).json({
      success: true,
      message: "Profile photo deleted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Delete profile photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete profile photo",
    });
  }
}












async function searchProfilesController(req, res) {
  try {
    const currentUserId = req.user.userId;
    const result = await searchProfiles(currentUserId, req.query);

    return res.status(200).json({
      success: true,
      profiles: result.profiles,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Search profiles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search profiles",
    });
  }
}

async function getPublicProfileController(req, res) {
  try {
    const currentUserId = req.user.userId;
    const targetUserId = Number(req.params.id);

    if (!Number.isInteger(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await getPublicProfileById(currentUserId, targetUserId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.profile,
      family: result.family,
      partnerPreferences: result.partnerPreferences,
      interestStatus: result.interestStatus,
    });
  } catch (error) {
    console.error("Get public profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile details",
    });
  }
}

module.exports = {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteMyProfilePhoto,
  searchProfilesController,
  getPublicProfileController,
};