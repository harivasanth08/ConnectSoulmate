const onboardingService = require("../services/onboarding.service");

async function getState(req, res, next) {
  try {
    const userId = req.user.userId;
    const state = await onboardingService.getOnboardingState(userId);
    res.status(200).json({
      success: true,
      state,
    });
  } catch (error) {
    next(error);
  }
}

async function saveStep(req, res, next) {
  try {
    const userId = req.user.userId;
    const { stepNumber, data } = req.body;
    const updatedState = await onboardingService.saveOnboardingStep(userId, stepNumber, data || {});
    res.status(200).json({
      success: true,
      message: "Progress saved",
      state: updatedState,
    });
  } catch (error) {
    next(error);
  }
}

async function complete(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await onboardingService.completeOnboarding(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getState,
  saveStep,
  complete,
};
