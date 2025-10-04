const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post("/signup", merchantController.signup);
router.post("/login", merchantController.login);
router.get(
  "/profile",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.getProfile
);
router.get(
  "/dashboard",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.getDashboard
);
router.post(
  "/ads",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.createAd
);
router.get(
  "/ads",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.getAds
);

router.get(
  "/earnings",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.getEarningSummary
);
router.post(
  "/withdrawals",
  verifyToken,
  checkRole(["merchant"]),
  merchantController.requestWithdrawal
);

module.exports = router;
