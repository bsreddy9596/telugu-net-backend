const twilio = require("twilio");
const env = require("../config/env");
const logger = require("../config/logger");

const client = twilio(env.twilio.sid, env.twilio.authToken);

module.exports = async function sendOtp(phone) {
  try {
    const verification = await client.verify.v2
      .services(env.twilio.verifySid)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    logger.info(`OTP sent to ${phone}, SID: ${verification.sid}`);
    return true;
  } catch (error) {
    logger.error("Twilio error:", { message: error.message, phone });
    throw new Error("OTP sending failed");
  }
};
