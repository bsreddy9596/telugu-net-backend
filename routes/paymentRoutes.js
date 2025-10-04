const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post(
  "/qr",
  verifyToken,
  checkRole(["user"]),
  paymentController.qrPayment
);

module.exports = router;
