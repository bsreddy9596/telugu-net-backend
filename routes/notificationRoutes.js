const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  sendBroadcastNotification,
  markAllAsRead,
} = require("../controllers/notificationController");
const {
  getNotificationsValidation,
  notificationIdValidation,
  broadcastValidation,
} = require("../validations/notificationValidation");

router.get("/", verifyToken, getNotificationsValidation, validate, getNotifications);

router.put("/:id/read", verifyToken, notificationIdValidation, validate, markAsRead);
router.put("/read-all", verifyToken, markAllAsRead);

router.delete("/:id", verifyToken, notificationIdValidation, validate, deleteNotification);

router.post("/broadcast", verifyToken, broadcastValidation, validate, sendBroadcastNotification);

module.exports = router;
