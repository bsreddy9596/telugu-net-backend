const express = require("express");
const authController = require("../controllers/authController");
const refreshController = require("../controllers/refreshController");
const validate = require("../middlewares/validate");
const {
  requestOtpValidation,
  verifyOtpValidation,
  refreshTokenValidation,
} = require("../validations/authValidation");

const router = express.Router();

router.post("/request-otp", requestOtpValidation, validate, authController.requestOtp);
router.post("/verify-otp", verifyOtpValidation, validate, authController.verifyOtp);
router.post("/refresh", refreshTokenValidation, validate, refreshController.refreshAccessToken);
router.post("/logout", refreshTokenValidation, validate, refreshController.logout);

module.exports = router;
