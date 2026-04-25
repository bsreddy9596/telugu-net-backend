const { body } = require("express-validator");

const PHONE_REGEX = /^\+?\d{10,15}$/;

exports.requestOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(PHONE_REGEX)
    .withMessage("Valid phone number required"),
];

exports.verifyOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(PHONE_REGEX)
    .withMessage("Valid phone number required"),
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
