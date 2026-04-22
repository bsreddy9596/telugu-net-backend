const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  createAd,
  getMyAds,
  reviewAd,
  getAllAds,
  getPremiumAds,
} = require("../controllers/adController");

const {
  createAdValidation,
  reviewAdValidation,
  getAdsValidation,
} = require("../validations/adValidation");

router.get("/", getAdsValidation, validate, getAllAds);
router.get("/premium", getPremiumAds);
router.post("/", verifyToken, createAdValidation, validate, createAd);
router.get("/my-ads", verifyToken, getMyAds);
router.patch("/:adId/review", verifyToken, reviewAdValidation, validate, reviewAd);

module.exports = router;
