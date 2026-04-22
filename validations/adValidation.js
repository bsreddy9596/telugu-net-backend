const { body, param, query } = require("express-validator");

exports.createAdValidation = [
  body("title").notEmpty().withMessage("Ad title is required"),
  body("media").isArray({ min: 1 }).withMessage("At least one media file is required"),
  body("category").optional(),
  body("location").optional(),
  body("description").optional(),
];

exports.reviewAdValidation = [
  param("adId").notEmpty().isMongoId().withMessage("Invalid Ad ID"),
  body("status").isIn(["approved", "rejected", "pending"]).withMessage("Invalid status"),
  body("isPremium").optional().isBoolean(),
];

exports.getAdsValidation = [
  query("category").optional().isString(),
  query("location").optional().isString(),
  query("status").optional().isString(),
];
