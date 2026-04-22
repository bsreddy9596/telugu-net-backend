const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  getTransactions,
  auditTransaction,
} = require("../controllers/transactionController");
const {
  getTransactionsValidation,
  auditTransactionValidation,
} = require("../validations/transactionValidation");

router.get("/", verifyToken, getTransactionsValidation, validate, getTransactions);

router.get("/audit/:refId", verifyToken, auditTransactionValidation, validate, auditTransaction);

module.exports = router;
