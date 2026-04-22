const { body, param } = require("express-validator");

exports.adminLoginValidation = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.userIdValidation = [
  param("userId").notEmpty().isMongoId().withMessage("Invalid User ID"),
];

exports.merchantIdValidation = [
  param("merchantId").notEmpty().isMongoId().withMessage("Invalid Merchant ID"),
];

exports.adIdValidation = [
  param("adId").notEmpty().isMongoId().withMessage("Invalid Ad ID"),
];

exports.settleWithdrawalValidation = [
  param("id").notEmpty().isMongoId().withMessage("Invalid Transaction ID"),
  body("action").isIn(["approve", "reject"]).withMessage("Invalid action. Must be 'approve' or 'reject'"),
];
