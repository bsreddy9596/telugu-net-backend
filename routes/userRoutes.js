const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.get(
  "/profile",
  verifyToken,
  checkRole("user"),
  userController.getProfile
);
router.patch(
  "/profile",
  verifyToken,
  checkRole("user"),
  userController.updateProfile
);

module.exports = router;
