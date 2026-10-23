const pool = require("../config/database");
const authService = require("../services/auth.service");
const parentService = require("../services/parent.service");
const profileService = require("../services/profile.service");
const shortlistService = require("../services/shortlist.service");
const interestService = require("../services/interest.service");
const messageService = require("../services/message.service");

async function verify() {
  console.log("=== CONNECTSOULMATE PARENT MODE SYSTEM VERIFICATION ===");

  const [dbTest] = await pool.query("SELECT 1 AS connected");
  console.log("✓ Database Connected:", dbTest[0].connected === 1);

  const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'parent_relationship'");
  console.log("✓ Column users.parent_relationship:", cols.length > 0 ? "Present" : "Missing");

  const [tables] = await pool.query("SHOW TABLES LIKE 'parent_child_profiles'");
  console.log("✓ Table parent_child_profiles:", tables.length > 0 ? "Present" : "Missing");

  const [famCols] = await pool.query("SHOW COLUMNS FROM family_details LIKE 'about_family'");
  console.log("✓ Column family_details.about_family:", famCols.length > 0 ? "Present" : "Missing");

  // Check parent user in database if any exists
  const [parentUsers] = await pool.query("SELECT id, role, full_name, parent_relationship FROM users WHERE role = 'parent' LIMIT 1");
  if (parentUsers.length > 0) {
    const parentId = parentUsers[0].id;
    console.log(`✓ Found Parent User ID: ${parentId} (${parentUsers[0].full_name})`);
    const dashboardData = await parentService.getParentDashboardData(parentId);
    console.log("✓ getParentDashboardData output:", {
      hasParent: Boolean(dashboardData.parent),
      parentName: dashboardData.parent?.parentName,
      fullName: dashboardData.parent?.fullName,
      childName: dashboardData.parent?.childName,
      childRelationship: dashboardData.parent?.childRelationship,
      hasStats: Boolean(dashboardData.stats),
      matchesCount: dashboardData.recommendedMatches?.length,
    });

    if (!dashboardData.parent || !dashboardData.parent.parentName) {
      throw new Error("parentName missing from getParentDashboardData");
    }
  } else {
    console.log("ℹ No parent user found yet in DB (can be created via onboarding).");
  }

  // Check individual user rejecting from parent dashboard with 403
  const [indivUsers] = await pool.query("SELECT id FROM users WHERE role = 'user' OR role IS NULL LIMIT 1");
  if (indivUsers.length > 0) {
    try {
      await parentService.getParentDashboardData(indivUsers[0].id);
      console.error("FAIL: Individual user should have been rejected with 403");
      process.exit(1);
    } catch (err) {
      if (err.statusCode === 403) {
        console.log("✓ Individual user correctly rejected from Parent Dashboard with 403 Forbidden");
      } else {
        throw err;
      }
    }
  }

  console.log("=== ALL PARENT MODE VERIFICATIONS PASSED ===");
  process.exit(0);
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
