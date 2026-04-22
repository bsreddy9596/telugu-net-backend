const express = require("express");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  adminLogin,
  listUsers,
  approveUser,
  deactivateUser,
  listMerchants,
  approveMerchant,
  rejectMerchant,
  getRevenueReport,
  getAnalytics,
  listPendingAds,
  approveAd,
  rejectAd,
  listPendingWithdrawals,
  settleWithdrawal,
} = require("../controllers/adminController");

const {
  adminLoginValidation,
  userIdValidation,
  merchantIdValidation,
  adIdValidation,
  settleWithdrawalValidation,
} = require("../validations/adminValidation");

router.post("/login", adminLoginValidation, validate, adminLogin);

router.get("/users", verifyToken, listUsers);

router.put("/users/:userId/approve", verifyToken, userIdValidation, validate, approveUser);

router.put("/users/:userId/deactivate", verifyToken, userIdValidation, validate, deactivateUser);

router.get("/merchants", verifyToken, listMerchants);

router.put("/merchants/:merchantId/approve", verifyToken, merchantIdValidation, validate, approveMerchant);

router.put("/merchants/:merchantId/reject", verifyToken, merchantIdValidation, validate, rejectMerchant);

router.get("/revenue", verifyToken, getRevenueReport);

router.get("/analytics", verifyToken, getAnalytics);

router.get("/ads/pending", verifyToken, listPendingAds);

router.put("/ads/:adId/approve", verifyToken, adIdValidation, validate, approveAd);

router.put("/ads/:adId/reject", verifyToken, adIdValidation, validate, rejectAd);

router.get("/withdrawals/pending", verifyToken, listPendingWithdrawals);

router.post("/withdrawals/:id/settle", verifyToken, settleWithdrawalValidation, validate, settleWithdrawal);

module.exports = router;
