const { body } = require("express-validator");

exports.updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be 10 digits"),
  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for DOB"),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),
  body("state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State cannot be empty"),
  body("pincode")
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage("Pincode must be 6 digits"),
];

exports.updateSettingsValidation = [
  body("notifications")
    .optional()
    .isObject()
    .withMessage("Notifications must be an object"),
  body("privacy").optional().isObject().withMessage("Privacy must be an object"),
];

exports.updateFcmTokenValidation = [
  body("fcmToken")
    .notEmpty()
    .withMessage("FCM token is required")
    .isString()
    .withMessage("FCM token must be a string"),
];

exports.completeProfileValidation = [
  body("fullName").notEmpty().withMessage("Full name is required").trim(),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("dateOfBirth").notEmpty().withMessage("Date of birth is required").isISO8601().withMessage("Invalid date format for Date of Birth"),
  body("address").notEmpty().withMessage("Address is required").trim(),
  body("city").notEmpty().withMessage("City is required").trim(),
  body("state").notEmpty().withMessage("State is required").trim(),
  body("pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^[0-9]{6}$/)
    .withMessage("Pincode must be 6 digits"),
];
