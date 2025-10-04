const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post("/login", adminController.adminLogin);

router.get(
  "/users",
  verifyToken,
  checkRole(["admin"]),
  adminController.listUsers
);
router.put(
  "/users/:userId/approve",
  verifyToken,
  checkRole(["admin"]),
  adminController.approveUser
);
router.put(
  "/users/:userId/deactivate",
  verifyToken,
  checkRole(["admin"]),
  adminController.deactivateUser
);

router.get(
  "/merchants",
  verifyToken,
  checkRole(["admin"]),
  adminController.listMerchants
);
router.put(
  "/merchants/:merchantId/approve",
  verifyToken,
  checkRole(["admin"]),
  adminController.approveMerchant
);
router.put(
  "/merchants/:merchantId/reject",
  verifyToken,
  checkRole(["admin"]),
  adminController.rejectMerchant
);

router.get(
  "/revenue",
  verifyToken,
  checkRole(["admin"]),
  adminController.getRevenueReport
);
router.get(
  "/analytics",
  verifyToken,
  checkRole(["admin"]),
  adminController.getAnalytics
);

router.get(
  "/ads/pending",
  verifyToken,
  checkRole(["admin"]),
  adminController.listPendingAds
);
router.put(
  "/ads/:adId/approve",
  verifyToken,
  checkRole(["admin"]),
  adminController.approveAd
);
router.put(
  "/ads/:adId/reject",
  verifyToken,
  checkRole(["admin"]),
  adminController.rejectAd
);

module.exports = router;
