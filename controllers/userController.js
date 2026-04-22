const userService = require("../services/userService");
const discoveryService = require("../services/discoveryService");
const asyncHandler = require("../middlewares/asyncHandler");
const HTTP_STATUS = require("../constants/httpStatus");
const { USER_MESSAGES } = require("../constants/messages");

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.PROFILE_FETCHED, 
    data: user 
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.PROFILE_UPDATED, 
    data: user 
  });
});

exports.uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
    statusCode: HTTP_STATUS.BAD_REQUEST, 
    success: false, 
    message: USER_MESSAGES.IMAGE_REQUIRED 
  });
  const user = await userService.uploadProfileImage(req.user.id, req.file.publicUrl);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.PROFILE_IMAGE_UPDATED, 
    data: user 
  });
});

exports.completeProfile = asyncHandler(async (req, res) => {
  const result = await userService.completeProfile(req.user.id, req.body);
  res.status(result.statusCode).json(result);
});

exports.getUserSettings = asyncHandler(async (req, res) => {
  const settings = await userService.getUserSettings(req.user.id);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.SETTINGS_FETCHED, 
    data: settings 
  });
});

exports.updateUserSettings = asyncHandler(async (req, res) => {
  const settings = await userService.updateUserSettings(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.SETTINGS_UPDATED, 
    data: settings 
  });
});

exports.updateFcmToken = asyncHandler(async (req, res) => {
  await userService.updateFcmToken(req.user.id, req.body.fcmToken);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: USER_MESSAGES.FCM_TOKEN_UPDATED 
  });
});

exports.getHomeData = asyncHandler(async (req, res) => {
  const data = await userService.getHomeData(req.user.id, req.query);
  res.status(HTTP_STATUS.OK).json({
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Home data fetched successfully",
    data
  });
});

exports.getPlan = asyncHandler(async (req, res) => {
  const plan = await userService.getPlan(req.user.id);
  if (!plan) return res.status(HTTP_STATUS.NOT_FOUND).json({ 
    statusCode: HTTP_STATUS.NOT_FOUND, 
    success: false, 
    message: "No active plan found" 
  });
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: "Plan details fetched", 
    data: plan 
  });
});

exports.getOffers = asyncHandler(async (req, res) => {
  const offers = await discoveryService.getOffers();
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: "Offers fetched", 
    data: offers 
  });
});

exports.getNearbyShops = asyncHandler(async (req, res) => {
  const { lat, lng, category } = req.query;
  const shops = await discoveryService.getNearbyShops(lat, lng, category);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: "Nearby shops fetched", 
    data: shops 
  });
});

exports.getReferral = asyncHandler(async (req, res) => {
  const referral = await userService.getReferral(req.user.id);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK, 
    success: true, 
    message: "Referral info fetched", 
    data: referral 
  });
});
