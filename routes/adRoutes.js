const express = require("express");
const router = express.Router();
const adController = require("../controllers/adController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post("/", verifyToken, checkRole(["merchant"]), adController.createAd);
router.get(
  "/mine",
  verifyToken,
  checkRole(["merchant"]),
  adController.getMyAds
);

router.put(
  "/:adId/review",
  verifyToken,
  checkRole(["admin"]),
  adController.reviewAd
);

router.get("/", verifyToken, checkRole(["admin"]), adController.getAllAds);

router.get("/premium", adController.getPremiumAds);

module.exports = router;
