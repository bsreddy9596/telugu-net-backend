const User = require("../models/User");
const Plan = require("../models/Plan");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { USER_MESSAGES } = require("../constants/messages");
const cache = require("../utils/cache");
const walletService = require("./walletService");
const transactionService = require("./transactionService");
const discoveryService = require("./discoveryService");
const faqService = require("./faqService");

const getProfile = async (userId) => {
  const cachedProfile = cache.get(`user:${userId}:profile`);
  if (cachedProfile) return cachedProfile;

  const user = await User.findById(userId).lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  cache.set(`user:${userId}:profile`, user);
  return user;
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if (updateData.email) {
    const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: userId } }).lean();
    if (existingUser) throw new AppError("Email already in use", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).lean();
  cache.del(`user:${userId}:profile`);
  return updatedUser;
};

const uploadProfileImage = async (userId, imageUrl) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { $set: { profile_image: imageUrl } }, { new: true }).lean();
  if (!updatedUser) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  cache.del(`user:${userId}:profile`);
  return updatedUser;
};

const completeProfile = async (userId, profileData) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const { fullName, email, dateOfBirth, address, city, state, pincode } = profileData;
  const isComplete = !!(fullName && email && dateOfBirth && address && city && state && pincode);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: fullName,
        email,
        dateOfBirth,
        address,
        city,
        state,
        pincode,
        isProfileComplete: isComplete
      }
    },
    { new: true, runValidators: true }
  ).lean();

  cache.del(`user:${userId}:profile`);

  return {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: USER_MESSAGES.PROFILE_UPDATED,
    data: { isProfileComplete: updatedUser.isProfileComplete },
  };
};

const getUserSettings = async (userId) => {
  const user = await User.findById(userId).select("settings").lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user.settings;
};

const updateUserSettings = async (userId, settingsData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { $set: { settings: settingsData } }, { new: true }).lean();
  if (!updatedUser) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  cache.del(`user:${userId}:profile`);
  return updatedUser.settings;
};

const updateFcmToken = async (userId, fcmToken) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { $set: { fcmToken } }, { new: true }).lean();
  if (!updatedUser) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return updatedUser;
};

const getReferral = async (userId) => {
  const user = await User.findById(userId).select("referralCode referralEarnings referredUsers").lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return {
    code: user.referralCode,
    earnings: user.referralEarnings || 0,
    referrals: user.referredUsers ? user.referredUsers.length : 0,
  };
};

const getPlan = async (userId) => {
  const plan = await Plan.findOne({ userId }).lean();
  if (!plan) return null;
  return {
    planName: plan.planName,
    speed: plan.speed,
    data: plan.dataLimit,
    billAmount: plan.billAmount || 0,
    status: plan.status,
  };
};

const getHomeData = async (userId, { lat, lng }) => {
  const [profile, walletBalance, plan, transactionsResult, offers, shops, faqs, categories] = await Promise.all([
    getProfile(userId),
    walletService.getBalance(userId),
    getPlan(userId),
    transactionService.getTransactions({ userId }, { limit: 5 }),
    discoveryService.getOffers(),
    discoveryService.getNearbyShops(lat, lng),
    faqService.getFaqs(),
    discoveryService.getCategories()
  ]);

  return {
    user: {
      name: profile.name || profile.fullName || "User",
      phone: profile.phone,
      email: profile.email,
      greeting: `Hi ${profile.name || profile.fullName || "User"} 👋`
    },
    plan: plan ? {
      name: plan.planName,
      speed: plan.speed,
      data: plan.data,
      usedData: `${plan.usedData || 0} GB`,
      status: plan.status === "active" ? "Active" : "Inactive"
    } : null,
    wallet: {
      balance: walletBalance,
      cashback: profile.cashback || 0
    },
    categories,
    recentTransactions: transactionsResult.data.map(tx => ({
      id: tx._id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt
    })),
    offers,
    nearbyShops: shops,
    faqs
  };
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  completeProfile,
  getUserSettings,
  updateUserSettings,
  updateFcmToken,
  getReferral,
  getPlan,
  getHomeData,
};
