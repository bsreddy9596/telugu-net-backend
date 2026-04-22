const merchantAuthService = require("../services/merchantAuthService");
const merchantBusinessService = require("../services/merchantBusinessService");
const merchantFinancialService = require("../services/merchantFinancialService");
const transactionService = require("../services/transactionService");
const adService = require("../services/adService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");

exports.sendOtp = asyncHandler(async (req, res) => {
  const response = await merchantAuthService.sendOtp(req.body);
  return applyServiceResponse(res, response);
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const response = await merchantAuthService.verifyOtp(req.body);
  return applyServiceResponse(res, response);
});

exports.register = asyncHandler(async (req, res) => {
  const response = await merchantAuthService.register(req.body);
  return applyServiceResponse(res, response);
});

exports.getProfile = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.getProfile(req.user.id);
  return applyServiceResponse(res, response);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.updateProfile(req.user.id, req.body);
  return applyServiceResponse(res, response);
});

exports.updateBusinessSettings = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.updateBusinessSettings(req.user.id, req.body);
  return applyServiceResponse(res, response);
});

exports.getVerificationStatus = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.getVerificationStatus(req.user.id);
  return applyServiceResponse(res, response);
});

exports.updateNotifications = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.updateNotifications(req.user.id, req.body);
  return applyServiceResponse(res, response);
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const response = await merchantFinancialService.getDashboard(req.user.id);
  return applyServiceResponse(res, response);
});

exports.getTransactions = asyncHandler(async (req, res) => {
  const response = await transactionService.getTransactions({ merchantId: req.user.id }, req.query);
  return applyServiceResponse(res, response);
});

exports.getWallet = asyncHandler(async (req, res) => {
  const response = await merchantFinancialService.getWallet(req.user.id);
  return applyServiceResponse(res, response);
});

exports.requestWithdrawal = asyncHandler(async (req, res) => {
  const response = await merchantFinancialService.requestWithdrawal(req.user.id, req.body.amount);
  return applyServiceResponse(res, response);
});

exports.getQrCode = asyncHandler(async (req, res) => {
  const response = await merchantFinancialService.getQrCode(req.user.id);
  return applyServiceResponse(res, response);
});

exports.createAd = asyncHandler(async (req, res) => {
  const response = await adService.createAd(req.user.id, req.body);
  return applyServiceResponse(res, response);
});

exports.getAds = asyncHandler(async (req, res) => {
  const response = await adService.getMerchantAds(req.user.id);
  return applyServiceResponse(res, response);
});

exports.getAdById = asyncHandler(async (req, res) => {
  const response = await adService.getAdById(req.params.adId);
  return applyServiceResponse(res, response);
});

exports.updateAd = asyncHandler(async (req, res) => {
  const response = await adService.updateAd(req.params.adId, req.user.id, req.body);
  return applyServiceResponse(res, response);
});

exports.deleteAd = asyncHandler(async (req, res) => {
  const response = await adService.deleteAd(req.params.adId, req.user.id);
  return applyServiceResponse(res, response);
});

exports.getLoginActivity = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.getLoginActivity(req.user.id);
  return applyServiceResponse(res, response);
});

exports.getTerms = asyncHandler(async (req, res) => {
  const response = await merchantBusinessService.getTerms();
  return applyServiceResponse(res, response);
});
