const Ad = require("../models/Ad");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { AD_MESSAGES } = require("../constants/messages");

const createAd = async (merchantId, { title, description, media, category, location, isPremium }) => {
  if (!title) throw new AppError(AD_MESSAGES.TITLE_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  if (!media || media.length === 0) throw new AppError(AD_MESSAGES.MEDIA_REQUIRED, HTTP_STATUS.BAD_REQUEST);

  const ad = await Ad.create({
    merchantId,
    title,
    description,
    media,
    category,
    location,
    isPremium: isPremium || false,
    status: "pending",
  });

  return {
    statusCode: HTTP_STATUS.CREATED,
    message: AD_MESSAGES.CREATED,
    data: ad,
  };
};

const getMerchantAds = async (merchantId) => {
  const ads = await Ad.find({ merchantId }).sort({ createdAt: -1 }).lean();

  return {
    statusCode: HTTP_STATUS.OK,
    message: AD_MESSAGES.FETCHED,
    data: ads,
  };
};

const getAllAds = async (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.location) filter.location = query.location;
  if (query.status) filter.status = query.status;

  const ads = await Ad.find(filter)
    .populate("merchantId", "name businessDetails.name email")
    .sort({ createdAt: -1 })
    .lean();

  return {
    statusCode: HTTP_STATUS.OK,
    message: AD_MESSAGES.FETCHED,
    data: ads,
  };
};

const getPremiumAds = async () => {
  const ads = await Ad.find({ status: "approved", isPremium: true })
    .sort({ createdAt: -1 })
    .lean();

  return {
    statusCode: HTTP_STATUS.OK,
    message: AD_MESSAGES.FETCHED,
    data: ads,
  };
};

const updateAdStatus = async (adId, { status, isPremium }) => {
  if (status && !["approved", "rejected", "pending"].includes(status)) {
    throw new AppError("Invalid status", HTTP_STATUS.BAD_REQUEST);
  }

  const update = {};
  if (status) update.status = status;
  if (isPremium !== undefined) update.isPremium = !!isPremium;

  const ad = await Ad.findByIdAndUpdate(adId, update, { new: true }).lean();
  if (!ad) throw new AppError(AD_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: AD_MESSAGES.STATUS_UPDATED,
    data: ad,
  };
};

const getAdById = async (adId) => {
  const ad = await Ad.findById(adId)
    .populate("merchantId", "name businessDetails.name email")
    .lean();
  if (!ad) throw new AppError(AD_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: AD_MESSAGES.FETCHED, data: ad };
};

const updateAd = async (adId, merchantId, data) => {
  const ad = await Ad.findOneAndUpdate({ _id: adId, merchantId }, { $set: data }, { new: true }).lean();
  if (!ad) throw new AppError(AD_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: AD_MESSAGES.UPDATED, data: ad };
};

const deleteAd = async (adId, merchantId) => {
  const ad = await Ad.findOneAndDelete({ _id: adId, merchantId });
  if (!ad) throw new AppError(AD_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: AD_MESSAGES.DELETED, data: null };
};

const getAdAnalytics = async (adId, merchantId) => {
  const ad = await Ad.findOne({ _id: adId, merchantId }).lean();
  if (!ad) throw new AppError(AD_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  
  // Return mock analytics data
  return {
    statusCode: HTTP_STATUS.OK,
    message: "Ad analytics fetched",
    data: {
      views: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 200) + 10,
      conversions: Math.floor(Math.random() * 50) + 1,
    }
  };
};

const uploadAdMedia = async (merchantId, mediaUrl) => {
  return {
    statusCode: HTTP_STATUS.OK,
    message: "Media uploaded successfully",
    data: { url: mediaUrl }
  };
};

module.exports = {
  createAd,
  getMerchantAds,
  getAllAds,
  getPremiumAds,
  getAdById,
  updateAd,
  deleteAd,
  updateAdStatus,
  getAdAnalytics,
  uploadAdMedia,
};
