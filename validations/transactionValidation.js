const { query, param } = require("express-validator");

exports.getTransactionsValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("type").optional().isString().trim(),
  query("direction").optional().isIn(["credit", "debit"]).withMessage("Invalid direction"),
  query("date").optional().isISO8601().withMessage("Invalid date format (YYYY-MM-DD)"),
];

exports.auditTransactionValidation = [
  param("refId").notEmpty().withMessage("Reference ID is required"),
];
