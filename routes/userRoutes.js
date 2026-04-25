const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const { upload } = require("../middlewares/uploadFirebase");

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  completeProfile,
  getUserSettings,
  updateUserSettings,
  updateFcmToken,
  getPlan,
  getReferral,
  getOffers,
  getNearbyShops,
  getHomeData,
  payBill,
  getRewards,
  redeemReward,
  getShopById,
  getShopItems,
} = require("../controllers/userController");

const {
  updateProfileValidation,
  updateSettingsValidation,
  updateFcmTokenValidation,
  completeProfileValidation,
} = require("../validations/userValidation");

router.use(verifyToken);

router.get("/profile", getProfile);
router.patch("/profile", updateProfileValidation, validate, updateProfile);
router.patch("/profile/complete", completeProfileValidation, validate, completeProfile);
router.post("/profile/upload", upload.single("image"), uploadProfileImage);
router.post("/fcm-token", updateFcmTokenValidation, validate, updateFcmToken);

router.get("/settings", getUserSettings);
router.patch("/settings", updateSettingsValidation, validate, updateUserSettings);

router.get("/home", getHomeData);
router.get("/my-plan", getPlan);
router.post("/my-plan/paybill", payBill);

router.get("/referral", getReferral);
router.get("/offers", getOffers);
router.get("/rewards", getRewards);
router.post("/rewards/:id/redeem", redeemReward);

router.get("/nearby-shops", getNearbyShops);
router.get("/shops/:shopId", getShopById);
router.get("/shops/:shopId/items", getShopItems);

module.exports = router;
