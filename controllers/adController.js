const adService = require("../services/adService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");

const createAd = asyncHandler(async (req, res) => {
  const response = await adService.createAd(req.user.id, req.body);
  return applyServiceResponse(res, response);
});

const getMyAds = asyncHandler(async (req, res) => {
  const response = await adService.getMerchantAds(req.user.id);
  return applyServiceResponse(res, response);
});

const reviewAd = asyncHandler(async (req, res) => {
  const response = await adService.updateAdStatus(req.params.adId, req.body);
  return applyServiceResponse(res, response);
});

const getAllAds = asyncHandler(async (req, res) => {
  const response = await adService.getAllAds(req.query);
  return applyServiceResponse(res, response);
});

const getPremiumAds = asyncHandler(async (req, res) => {
  const response = await adService.getPremiumAds();
  return applyServiceResponse(res, response);
});

const getAdById = asyncHandler(async (req, res) => {
  const response = await adService.getAdById(req.params.adId);
  return applyServiceResponse(res, response);
});

const updateAd = asyncHandler(async (req, res) => {
  const response = await adService.updateAd(req.params.adId, req.user.id, req.body);
  return applyServiceResponse(res, response);
});

const deleteAd = asyncHandler(async (req, res) => {
  const response = await adService.deleteAd(req.params.adId, req.user.id);
  return applyServiceResponse(res, response);
});

module.exports = {
  createAd,
  getMyAds,
  reviewAd,
  getAllAds,
  getPremiumAds,
  getAdById,
  updateAd,
  deleteAd,
};
