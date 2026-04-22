const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { 
  initiateQrPay, 
  verifyQrPay, 
  handleWebhook 
} = require("../controllers/paymentController");

router.post("/qr/initiate", verifyToken, initiateQrPay);
router.post("/qr/verify", verifyToken, verifyQrPay);
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;
