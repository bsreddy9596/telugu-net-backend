const { body } = require("express-validator");

exports.rechargeWalletValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number (min 1)"),
];

exports.verifyRechargeValidation = [
  body("razorpay_order_id").notEmpty().withMessage("Razorpay Order ID is required"),
  body("razorpay_payment_id").notEmpty().withMessage("Razorpay Payment ID is required"),
  body("razorpay_signature").notEmpty().withMessage("Razorpay Signature is required"),
];

exports.payWithWalletValidation = [
  body("merchantId").notEmpty().withMessage("Merchant ID is required").isMongoId().withMessage("Invalid Merchant ID format"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number (min 1)"),
];
