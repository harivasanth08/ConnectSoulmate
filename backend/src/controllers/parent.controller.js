const {
  getParentOnboardingState,
  saveParentOnboardingStep,
  completeParentOnboarding,
  getParentDashboardData,
} = require("../services/parent.service");

async function getOnboardingStateController(req, res) {
  try {
    const userId = req.user.userId;
    const state = await getParentOnboardingState(userId);
    return res.status(200).json({
      success: true,
      state,
    });
  } catch (error) {
    console.error("Get parent onboarding state error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load parent onboarding state.",
    });
  }
}

async function saveOnboardingStepController(req, res) {
  try {
    const userId = req.user.userId;
    const { stepNumber, step, ...data } = req.body || {};
    const targetStep = stepNumber || step || 1;

    const updatedState = await saveParentOnboardingStep(userId, targetStep, data);
    return res.status(200).json({
      success: true,
      message: "Parent onboarding step saved successfully.",
      state: updatedState,
    });
  } catch (error) {
    console.error("Save parent onboarding step error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to save parent onboarding step.",
    });
  }
}

async function completeOnboardingController(req, res) {
  try {
    const userId = req.user.userId;
    const result = await completeParentOnboarding(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Complete parent onboarding error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to complete parent onboarding.",
    });
  }
}

async function getDashboardController(req, res) {
  try {
    const userId = req.user.userId;
    const dashboardData = await getParentDashboardData(userId);
    return res.status(200).json({
      success: true,
      dashboard: dashboardData,
      ...dashboardData,
    });
  } catch (error) {
    console.error("Get parent dashboard error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load parent dashboard data.",
    });
  }
}

module.exports = {
  getOnboardingStateController,
  saveOnboardingStepController,
  completeOnboardingController,
  getDashboardController,
};
