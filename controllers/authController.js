const crypto = require("crypto");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOtp = require("../utils/sendOtp");
const JWT = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const JWT_EXP = process.env.JWT_EXP || "7d";

const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    ins;

    await Otp.findOneAndUpdate(
      { phone },
      { codeHash, expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await sendOtp(phone, otp);

    const tempToken = JWT.sign({ phone }, JWT_SECRET, { expiresIn: "5m" });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      token: tempToken,
    });
  } catch (error) {
    console.error("requestOtp error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWT.verify(token, JWT_SECRET);
    const phone = decoded.phone;

    const { code, name, email } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "OTP code required" });
    }

    const otpDoc = await Otp.findOne({ phone });
    if (!otpDoc) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    if (codeHash !== otpDoc.codeHash) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        name: name || "User",
        email: email || `${phone}@telugunet.local`,
        role: "user",
        walletBalance: 0,
        isApproved: true,
      });
    }

    await Otp.deleteMany({ phone });

    const payload = { id: user._id, phone: user.phone, role: user.role };
    const mainToken = JWT.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

    const userObj = user.toObject();
    delete userObj.password;

    return res.json({
      success: true,
      message: "OTP verified, login successful",
      token: mainToken,
      user: userObj,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
};
