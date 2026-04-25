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
  getTerms,
  getAdAnalytics,
  uploadAdMedia,
  changePassword,
  setup2fa,
  updateBankDetails
} = require("../controllers/merchantController");
const { upload } = require("../middlewares/uploadFirebase");

const {
  sendOtpValidation,
  verifyOtpValidation,
  signupValidation,
  updateProfileValidation,
  updateBusinessSettingsValidation,
  withdrawalValidation,
  createAdValidation,
} = require("../validations/merchantValidation");


router.post(
  "/send-otp",

  // 🔥 NORMALIZE BEFORE VALIDATION
  (req, res, next) => {
    console.log("SEND OTP ROUTE HIT");
    if (req.body.phone) {
      let phone = req.body.phone.replace(/\s+/g, "");
      if (!phone.startsWith("+")) {
        phone = "+91" + phone;
      }
      req.body.phone = phone;
    }
    next();
  },

  sendOtpValidation,
  validate,
  sendOtp
);

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

router.post("/change-password", changePassword);
router.post("/2fa", setup2fa);
router.patch("/bank-details", updateBankDetails);

router.get("/ads/:adId/analytics", getAdAnalytics);
router.post("/ads/upload", upload.single("media"), uploadAdMedia);

module.exports = router;
