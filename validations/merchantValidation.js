const { body } = require("express-validator");

exports.sendOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10,15}$/)
    .withMessage("Phone must be 10 digits"),
];

exports.verifyOtpValidation = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10,15}$/)
    .withMessage("Phone must be 10 digits"),
  body("otp")
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

exports.signupValidation = [
  body("shop_name").notEmpty().withMessage("Shop name is required").trim(),
  body("category").notEmpty().withMessage("Category is required").trim(),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be 10 digits"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

exports.updateProfileValidation = [
  body("name").optional().trim().notEmpty(),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("profileImage").optional().isString(),
  body("gst").optional().trim(),
  body("website").optional().isURL().withMessage("Invalid URL format"),
];

exports.updateBusinessSettingsValidation = [
  body("address").optional().trim().notEmpty(),
  body("city").optional().trim().notEmpty(),
  body("state").optional().trim().notEmpty(),
  body("pincode").optional().matches(/^\d{6}$/).withMessage("Pincode must be 6 digits"),
];

exports.withdrawalValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number (min 1)"),
];

exports.createAdValidation = [
  body("title").notEmpty().withMessage("Ad title is required"),
  body("media").isArray({ min: 1 }).withMessage("At least one media file is required"),
  body("category").optional(),
  body("location").optional(),
  body("isPremium").optional().isBoolean(),
];
