const { body } = require("express-validator");

exports.requestOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Valid phone number required with country code")
    .matches(/^\+\d{10,15}$/)
    .withMessage("Valid phone number required with country code"),
];

exports.verifyOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+\d{10,15}$/)
    .withMessage("Valid phone number required with country code"),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
];

exports.refreshTokenValidation = [
  body("refreshToken").optional().trim(),
];
