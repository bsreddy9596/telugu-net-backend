const Merchant = require("../models/Merchant");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { withSession } = require("../config/db");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../config/logger");

const sendOtp = async ({ phone }) => {
  const PHONE_REGEX = /^\+\d{10,15}$/;
  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new AppError("Invalid phone number", HTTP_STATUS.BAD_REQUEST);
  }

  const otpCode = "1234";
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await Otp.findOneAndUpdate(
    { phone },
    { codeHash: otpCode, expiresAt },
    { upsert: true }
  );

  return { 
    statusCode: HTTP_STATUS.OK, 
    message: "OTP sent (static)", 
    data: { 
      phone,
      otp: otpCode 
    } 
  };
};

const verifyOtp = async ({ phone, otp }) => {
  if (!phone || !otp) throw new AppError("Phone and OTP are required", HTTP_STATUS.BAD_REQUEST);

  if (otp !== "1234") {
    throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  const merchant = await Merchant.findOne({ phone }).lean();

  if (!merchant) {
    return {
      statusCode: HTTP_STATUS.OK,
      message: "OTP verified successfully",
      data: { merchantExists: false }
    };
  }

  if (!merchant.isApproved) {
    throw new AppError("Account under review. Please wait for admin approval.", HTTP_STATUS.FORBIDDEN);
  }

  const payload = { id: merchant._id, role: merchant.role };
  const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

  const safeMerchant = { ...merchant };
  delete safeMerchant.password;

  return {
    statusCode: HTTP_STATUS.OK,
    message: "Login successful",
    token,
    data: safeMerchant
  };
};

const register = async ({ phone, name, email, dob, businessDetails, bankDetails }) => {
  let result;
  await withSession(async (session) => {
    const existingMerchant = await Merchant.findOne({ phone }).session(session).lean();
    if (existingMerchant) {
      throw new AppError("Merchant already registered with this phone number", HTTP_STATUS.BAD_REQUEST);
    }
    const existingEmail = await Merchant.findOne({ email }).session(session).lean();
    if (existingEmail) {
      throw new AppError("Merchant already registered with this email", HTTP_STATUS.BAD_REQUEST);
    }

    let ownerUser = await User.findOne({ phone }).session(session).lean();
    if (!ownerUser) {
      const newUser = await User.create([{ name, phone, email, role: "user", isApproved: true }], { session });
      ownerUser = newUser[0];
    }

    const newMerchant = await Merchant.create(
      [{
        name, phone, email, dob, businessDetails, bankDetails,
        ownerUserId: ownerUser._id, isApproved: false, status: "pending", role: "merchant"
      }], { session }
    );

    result = {
      statusCode: HTTP_STATUS.CREATED,
      message: "Registration successful. Account under review.",
      data: { merchant: newMerchant[0] }
    };
  });
  return result;
};

const changePassword = async (merchantId, data) => {
  const { newPassword } = data;
  if (!newPassword || newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters long", HTTP_STATUS.BAD_REQUEST);
  }

  const merchant = await Merchant.findById(merchantId).lean();
  if (!merchant) throw new AppError("Merchant not found", HTTP_STATUS.NOT_FOUND);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(merchant.ownerUserId, { password: hashedPassword });

  return { statusCode: HTTP_STATUS.OK, message: "Password updated successfully" };
};

const setup2fa = async (merchantId, data) => {
  const { isEnabled, secret } = data;
  
  const updateData = { isTwoFactorEnabled: isEnabled };
  if (secret) updateData.twoFactorSecret = secret;

  await Merchant.findByIdAndUpdate(merchantId, updateData);

  return { statusCode: HTTP_STATUS.OK, message: `2FA has been ${isEnabled ? 'enabled' : 'disabled'}` };
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  changePassword,
  setup2fa,
};
