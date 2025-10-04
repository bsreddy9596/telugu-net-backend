const twilio = require("twilio");

console.log("TWILIO_SID:", process.env.TWILIO_SID);
console.log(
  "TWILIO_AUTH_TOKEN:",
  process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing"
);
console.log("TWILIO_PHONE:", process.env.TWILIO_PHONE);

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

module.exports = async function sendOtp(phone, otp) {
  try {
    const message = await client.messages.create({
      body: `Your TeluguNet OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });

    console.log(`✅ OTP sent to ${phone}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("❌ Twilio error:", error.message);
    throw new Error("OTP sending failed");
  }
};
