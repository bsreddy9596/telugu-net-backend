const { body, param, query } = require("express-validator");

exports.getNotificationsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

exports.notificationIdValidation = [
  param("id").notEmpty().withMessage("Notification ID is required").isMongoId().withMessage("Invalid Notification ID"),
];

exports.broadcastValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("target").optional(),
];
