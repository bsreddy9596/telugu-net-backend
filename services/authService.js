const JWT = require("jsonwebtoken");
const twilio = require("twilio");
const env = require("../config/env");
const logger = require("../config/logger");
const HTTP_STATUS = require("../constants/httpStatus");
const { AUTH_MESSAGES } = require("../constants/messages");
const User = require("../models/User");
const Otp = require("../models/Otp");
const AppError = require("../utils/AppError");
const { createAccessToken, createRefreshToken } = require("../utils/token");
const { getRefreshTokenCookieOptions } = require("./refreshService");

const PHONE_REGEX = /^\+\d{10,15}$/;
const twilioClient = twilio(env.twilio.sid, env.twilio.authToken);

async function requestOtp({ phone }) {
  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new AppError(AUTH_MESSAGES.INVALID_PHONE, HTTP_STATUS.BAD_REQUEST);
  }

  const isDev = env.nodeEnv !== "production";

  if (isDev) {
    return {
      statusCode: HTTP_STATUS.OK,
      message: "OTP sent (dev mode)",
      data: {
        phone,
        otp: "1234"
      }
    };
  }

  let otpCode = null;
  const isDebugMode =
    !env.twilio.sid ||
    env.twilio.sid.includes("placeholder") ||
    !env.twilio.verifySid ||
    env.twilio.verifySid.includes("placeholder");

  if (isDebugMode) {
    otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("DEBUG OTP:", otpCode, "Phone:", phone);
  } else {
    try {
      const verification = await twilioClient.verify.v2
        .services(env.twilio.verifySid)
        .verifications.create({ to: phone, channel: "sms" });

      logger.info("OTP sent successfully via Twilio", {
        phone,
        verificationSid: verification.sid,
      });
    } catch (err) {
      logger.error("Twilio Send Error:", err.message);
      throw new AppError("Failed to send OTP. SMS service is currently unavailable.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { phone },
    { codeHash: otpCode || "SENT_VIA_TWILIO", expiresAt },
    { upsert: true }
  );

  return {
    statusCode: HTTP_STATUS.OK,
    message: "OTP sent",
    data: {
      phone
    }
  };
}

async function verifyOtp({ phone, otp }) {
  if (!phone || !otp) {
    throw new AppError("Phone and OTP are required", HTTP_STATUS.BAD_REQUEST);
  }

  const isDev = env.nodeEnv !== "production";

  if (isDev) {
    if (otp !== "1234") {
      throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }
  } else {
    const isDebugMode =
      !env.twilio.sid ||
      env.twilio.sid.includes("placeholder") ||
      !env.twilio.verifySid ||
      env.twilio.verifySid.includes("placeholder");

    if (isDebugMode) {
      const otpRecord = await Otp.findOne({ phone }).lean();
      if (!otpRecord || otpRecord.codeHash !== otp || otpRecord.expiresAt < new Date()) {
        throw new AppError(AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST);
      }
      await Otp.deleteOne({ phone });
    } else {
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(env.twilio.verifySid)
          .verificationChecks.create({ to: phone, code: otp });

        if (verificationCheck.status !== "approved") {
          throw new AppError(AUTH_MESSAGES.INVALID_OR_EXPIRED_OTP, HTTP_STATUS.BAD_REQUEST);
        }
      } catch (err) {
        logger.error("Twilio Verify Error:", err.message);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to verify OTP with SMS provider.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    }
  }

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
