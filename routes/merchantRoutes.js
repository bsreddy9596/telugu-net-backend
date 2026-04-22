const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  sendOtp,
  verifyOtp,
  register,
  getProfile,
  updateProfile,
  updateBusinessSettings,
  getVerificationStatus,
  updateNotifications,
  getDashboard,
  getTransactions,
  getWallet,
  requestWithdrawal,
  getQrCode,
  getAds,
  createAd,
  getAdById,
  updateAd,
  deleteAd,
  getLoginActivity,
  getTerms
} = require("../controllers/merchantController");

const {
  sendOtpValidation,
  verifyOtpValidation,
  signupValidation,
  updateProfileValidation,
  updateBusinessSettingsValidation,
  withdrawalValidation,
  createAdValidation,
} = require("../validations/merchantValidation");

router.post("/send-otp", sendOtpValidation, validate, sendOtp);
router.post("/verify-otp", verifyOtpValidation, validate, verifyOtp);
router.post("/register", signupValidation, validate, register);

router.use(verifyToken);

router.get("/profile", getProfile);
router.patch("/profile", updateProfileValidation, validate, updateProfile);
router.patch("/business-settings", updateBusinessSettingsValidation, validate, updateBusinessSettings);
router.get("/verification-status", getVerificationStatus);
router.patch("/notifications", updateNotifications);

router.get("/dashboard", getDashboard);
router.get("/transactions", getTransactions);
router.get("/wallet", getWallet);
router.post("/request-withdrawal", withdrawalValidation, validate, requestWithdrawal);

router.get("/qr-code", getQrCode);

router.get("/ads", getAds);
router.post("/ads", createAdValidation, validate, createAd);
router.get("/ads/:adId", getAdById);
router.patch("/ads/:adId", updateAd);
router.delete("/ads/:adId", deleteAd);

router.get("/login-activity", getLoginActivity);
router.get("/terms", getTerms);

module.exports = router;
