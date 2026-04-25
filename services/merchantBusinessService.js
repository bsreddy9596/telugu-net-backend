const Merchant = require("../models/Merchant");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { MERCHANT_MESSAGES } = require("../constants/messages");

const getProfile = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).select("-password -__v").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: MERCHANT_MESSAGES.PROFILE_FETCHED,
    data: merchant,
  };
};

const updateProfile = async (merchantId, data) => {
  const { name, email, profileImage, gst, website } = data;
  
  const updatePayload = { name, email, image: profileImage };
  if (gst !== undefined) updatePayload["businessDetails.gst"] = gst;
  if (website !== undefined) updatePayload["businessDetails.website"] = website;

  const merchant = await Merchant.findByIdAndUpdate(
    merchantId, 
    { $set: updatePayload }, 
    { new: true, runValidators: true }
  ).lean();
  
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: MERCHANT_MESSAGES.PROFILE_UPDATED, data: merchant };
};

const updateBusinessSettings = async (merchantId, data) => {
  const { businessName, category, address, gst, website } = data;
  const updatePayload = {
    businessDetails: {
      name: businessName,
      category,
      address,
      gst,
      website
    }
  };
  const merchant = await Merchant.findByIdAndUpdate(merchantId, updatePayload, { new: true }).lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: "Business details updated", data: merchant.businessDetails };
};

const getVerificationStatus = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).select("status businessDetails.documents").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { 
    statusCode: HTTP_STATUS.OK, 
    message: "Verification status fetched", 
    data: { status: merchant.status, submittedDocuments: merchant.businessDetails?.documents || [] } 
  };
};

const updateNotifications = async (merchantId, settings) => {
  const { push, email, sms } = settings;
  const merchant = await Merchant.findByIdAndUpdate(
    merchantId, 
    { "settings.notifications": { push, email, sms } }, 
    { new: true }
  ).lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: "Notifications updated", data: merchant.settings?.notifications };
};

const getLoginActivity = async (merchantId) => {
  return { 
    statusCode: HTTP_STATUS.OK, 
    message: "Login activity fetched", 
    data: [{ ip: "192.168.1.1", device: "Chrome / Windows", date: new Date() }] 
  };
};

const getTerms = async () => {
  return { statusCode: HTTP_STATUS.OK, message: "Terms fetched", data: { content: "Merchant Terms & Privacy Policy..." } };
};

const updateBankDetails = async (merchantId, bankDetails) => {
  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { $set: { bankDetails } },
    { new: true, runValidators: true }
  ).lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return { statusCode: HTTP_STATUS.OK, message: "Bank details updated", data: merchant.bankDetails };
};

module.exports = {
  getProfile,
  updateProfile,
  updateBusinessSettings,
  getVerificationStatus,
  updateNotifications,
  getLoginActivity,
  getTerms,
  updateBankDetails,
};
