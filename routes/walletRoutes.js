const express = require("express");
const router = express.Router();
const walletController = require("../controllers/WalletController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post(
  "/recharge",
  verifyToken,
  checkRole("user"),
  walletController.rechargeWallet
);
router.get(
  "/balance",
  verifyToken,
  checkRole("user"),
  walletController.getWalletBalance
);
router.get(
  "/transactions",
  verifyToken,
  checkRole("user"),
  walletController.getTransactionHistory
);

module.exports = router;
