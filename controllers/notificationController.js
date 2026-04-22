const notificationService = require("../services/notificationService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");

const getNotifications = asyncHandler(async (req, res) => {
  const response = await notificationService.getNotifications(req.user.id, req.query);
  return applyServiceResponse(res, response);
});

const markAsRead = asyncHandler(async (req, res) => {
  const response = await notificationService.markAsRead(req.user.id, req.params.id);
  return applyServiceResponse(res, response);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const response = await notificationService.deleteNotification(req.user.id, req.params.id);
  return applyServiceResponse(res, response);
});

const sendBroadcastNotification = asyncHandler(async (req, res) => {
  const response = await notificationService.sendBroadcastNotification(req.user, req.body);
  return applyServiceResponse(res, response);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const response = await notificationService.markAllAsRead(req.user.id);
  return applyServiceResponse(res, response);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcastNotification,
};
