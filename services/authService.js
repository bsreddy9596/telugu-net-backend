const JWT = require("jsonwebtoken");
const env = require("../config/env");
const logger = require("../config/logger");
const HTTP_STATUS = require("../constants/httpStatus");
const { AUTH_MESSAGES } = require("../constants/messages");
const User = require("../models/User");
const Otp = require("../models/Otp");
const AppError = require("../utils/AppError");

const PHONE_REGEX = /^\+?\d{10,15}$/;

async function requestOtp({ phone }) {
  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new AppError(AUTH_MESSAGES.INVALID_PHONE, HTTP_STATUS.BAD_REQUEST);
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
      ...(env.nodeEnv !== "production" && { otp: otpCode })
    }
  };
}

async function verifyOtp({ phone, otp }) {
  if (!phone || !otp) {
    throw new AppError("Phone and OTP are required", HTTP_STATUS.BAD_REQUEST);
  }

  const otpRecord = await Otp.findOne({ phone }).lean();
  if (!otpRecord || otpRecord.codeHash !== otp || otpRecord.expiresAt < new Date()) {
    throw new AppError(AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST);
  }
  await Otp.deleteOne({ phone });

  let user = await User.findOne({ phone }).lean();

  if (!user) {
    user = await User.create({
      phone,
      role: "user",
      isProfileComplete: false,
      isApproved: true,
      wallet_balance: 0,
    });
  }

  const payload = { id: user._id, phone: user.phone, role: user.role };
  const accessToken = JWT.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  logger.info("OTP verified successfully", { userId: String(user._id), phone });

  return {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "OTP verified successfully",
    data: {
      token: accessToken,
      isProfileComplete: user.isProfileComplete,
    },
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
};
