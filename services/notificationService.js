const User = require("../models/User");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const { sendFCMNotification } = require("../utils/fcmHelper");
const HTTP_STATUS = require("../constants/httpStatus");
const { NOTIFICATION_MESSAGES } = require("../constants/messages");

const getNotifications = async (userId, query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);

  return {
    statusCode: HTTP_STATUS.OK,
    message: NOTIFICATION_MESSAGES.FETCHED,
    data: notifications,
    total,
    page,
    limit,
  };
};

const markAsRead = async (userId, notificationId) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!updated) {
    throw new AppError(NOTIFICATION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return {
    statusCode: HTTP_STATUS.OK,
    message: NOTIFICATION_MESSAGES.MARKED_READ,
    data: updated,
  };
};

const deleteNotification = async (userId, notificationId) => {
  const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!deleted) {
    throw new AppError(NOTIFICATION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return {
    statusCode: HTTP_STATUS.OK,
    message: NOTIFICATION_MESSAGES.DELETED,
    data: null,
  };
};

const sendBroadcastNotification = async (sender, { title, message, target }) => {
  if (sender.role !== "admin" && sender.role !== "merchant") {
    throw new AppError(NOTIFICATION_MESSAGES.ACCESS_DENIED, HTTP_STATUS.FORBIDDEN);
  }

  let userFilter = {};
  if (Array.isArray(target)) userFilter = { _id: { $in: target } };
  else if (target === "active") userFilter = { isActive: true };

  const users = await User.find(userFilter).select("_id fcmToken name").lean();
  if (!users.length) {
    throw new AppError(NOTIFICATION_MESSAGES.NO_USERS_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const notifications = users.map((u) => ({
    userId: u._id,
    title,
    message,
    type: "broadcast",
    meta: { sentBy: sender.role, senderId: sender.id },
  }));

  await Notification.insertMany(notifications);

  const tokens = users.filter((u) => u.fcmToken).map((u) => u.fcmToken);
  if (tokens.length) {
    sendFCMNotification({
      token: tokens,
      title,
      body: message,
      data: { type: "broadcast" },
    }).catch(err => console.error("FCM Broadcast Error:", err));
  }

  return {
    statusCode: HTTP_STATUS.OK,
    message: `${NOTIFICATION_MESSAGES.BROADCAST_SENT} to ${users.length} users`,
    data: { userCount: users.length },
  };
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return {
    statusCode: HTTP_STATUS.OK,
    message: NOTIFICATION_MESSAGES.MARKED_READ,
    data: null,
  };
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcastNotification,
};
