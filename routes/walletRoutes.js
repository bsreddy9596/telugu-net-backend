const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  getBalance,
  initiateRecharge,
  verifyRecharge,
  payWithWallet,
} = require("../controllers/walletController");

const {
  rechargeWalletValidation,
  verifyRechargeValidation,
  payWithWalletValidation,
} = require("../validations/walletValidation");

router.use(verifyToken);

router.get("/", getBalance);
router.post("/recharge/create-order", rechargeWalletValidation, validate, initiateRecharge);
router.post("/recharge/verify", verifyRechargeValidation, validate, verifyRecharge);
router.post("/pay", payWithWalletValidation, validate, payWithWallet);

module.exports = router;
