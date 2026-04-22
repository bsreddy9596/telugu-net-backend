const adminService = require("../services/adminService");
const adService = require("../services/adService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");

const adminLogin = asyncHandler(async (req, res) => {
  const response = await adminService.login(req.body);
  return applyServiceResponse(res, response);
});

const listUsers = asyncHandler(async (req, res) => {
  const response = await adminService.listUsers();
  return applyServiceResponse(res, response);
});

const approveUser = asyncHandler(async (req, res) => {
  const response = await adminService.approveUser(req.params.userId);
  return applyServiceResponse(res, response);
});

const deactivateUser = asyncHandler(async (req, res) => {
  const response = await adminService.deactivateUser(req.params.userId);
  return applyServiceResponse(res, response);
});

const listMerchants = asyncHandler(async (req, res) => {
  const response = await adminService.listMerchants();
  return applyServiceResponse(res, response);
});

const approveMerchant = asyncHandler(async (req, res) => {
  const response = await adminService.approveMerchant(req.params.merchantId);
  return applyServiceResponse(res, response);
});

const rejectMerchant = asyncHandler(async (req, res) => {
  const response = await adminService.rejectMerchant(req.params.merchantId);
  return applyServiceResponse(res, response);
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const response = await adminService.getRevenueReport();
  return applyServiceResponse(res, response);
});

const getAnalytics = asyncHandler(async (req, res) => {
  const response = await adminService.getAnalytics();
  return applyServiceResponse(res, response);
});

const listPendingAds = asyncHandler(async (req, res) => {
  const response = await adService.getAllAds({ status: "pending" });
  return applyServiceResponse(res, response);
});

const approveAd = asyncHandler(async (req, res) => {
  const response = await adService.updateAdStatus(req.params.adId, { status: "approved" });
  return applyServiceResponse(res, response);
});

const rejectAd = asyncHandler(async (req, res) => {
  const response = await adService.updateAdStatus(req.params.adId, { status: "rejected" });
  return applyServiceResponse(res, response);
});

const listPendingWithdrawals = asyncHandler(async (req, res) => {
  const response = await adminService.listPendingWithdrawals();
  return applyServiceResponse(res, response);
});

const settleWithdrawal = asyncHandler(async (req, res) => {
  const response = await adminService.settleWithdrawal(req.params.id, req.body.action);
  return applyServiceResponse(res, response);
});

module.exports = {
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
};
