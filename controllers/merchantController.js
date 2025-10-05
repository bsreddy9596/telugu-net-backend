const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const Ad = require("../models/Ad");
const { withSession } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const JWT_EXP = process.env.JWT_EXP || "2d";

const signup = async (req, res) => {
  try {
    const { email, password, shop_name, category, bank_details } = req.body;

    if (!email || !password || !shop_name || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    const existing = await Merchant.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const merchant = await Merchant.create({
      email,
      password: hashed,
      shop_name,
      category,
      bank_details,
      role: "merchant",
    });

    const safeMerchant = merchant.toObject();
    delete safeMerchant.password;

    return res.status(201).json({
      success: true,
      message: "Merchant registered",
      data: safeMerchant,
    });
  } catch (error) {
    console.error("merchant signup error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const merchant = await Merchant.findOne({ email });
    if (!merchant)
      return res
        .status(400)
        .json({ success: false, message: "Merchant not found" });

    const isMatch = await bcrypt.compare(password, merchant.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = { id: merchant._id, role: merchant.role };

    console.log("Merchant login payload:", payload);

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

    const safeMerchant = merchant.toObject();
    delete safeMerchant.password;

    return res.json({
      success: true,
      message: "Login successful",
      token,
      data: safeMerchant,
    });
  } catch (error) {
    console.error("merchant login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    console.log("➡ req.user inside getProfile:", req.user);

    const merchant = await Merchant.findById(req.user.id).select(
      "-password -__v"
    );

    if (!merchant) {
      console.log("Merchant not found in DB for ID:", req.user.id);
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });
    }

    return res.json({ success: true, data: merchant });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const merchant = await Merchant.findById(merchantId);
    if (!merchant)
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });

    const payments = await Transaction.find({ merchantId, type: "payment" });

    const totalEarnings = payments.reduce((sum, txn) => sum + txn.amount, 0);

    const recentTransactions = await Transaction.find({
      merchantId,
      type: "payment",
    })
      .populate("userId", "phone name")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        shop_name: merchant.shop_name,
        category: merchant.category,
        totalPayments: payments.length,
        totalEarnings,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("merchant dashboard error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createAd = async (req, res) => {
  try {
    const { title, description, media, category, location, isPremium } =
      req.body;
    const merchantId = req.user.id;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Ad title is required" });
    }

    if (!media || media.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one media file is required",
      });
    }

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

    return res.status(201).json({
      success: true,
      message: "Ad created successfully (pending approval)",
      data: ad,
    });
  } catch (error) {
    console.error("createAd error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAds = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const ads = await Ad.find({ merchantId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: ads });
  } catch (error) {
    console.error("getAds error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { shop_name, category, bank_details } = req.body;

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { shop_name, category, bank_details },
      { new: true, runValidators: true }
    ).select("-password");

    if (!merchant)
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });

    return res.json({
      success: true,
      message: "Profile updated",
      data: merchant,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getEarningSummary = async (req, res) => {
  const merchantId = req.user.id;

  try {
    const transactions = await Transaction.find({
      merchantId,
      type: {
        $in: ["merchant_credit", "withdrawal_request", "withdrawal_settle"],
      },
    });

    const totalCredits = transactions
      .filter((t) => t.type === "merchant_credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter((t) => t.type === "withdrawal_settle")
      .reduce((sum, t) => sum + t.amount, 0);

    const availableBalance = totalCredits - totalWithdrawals;

    return res.json({
      success: true,
      data: { totalCredits, totalWithdrawals, availableBalance },
    });
  } catch (error) {
    console.error("getEarningSummary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestWithdrawal = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid withdrawal amount" });
  }

  try {
    await withSession(async (session) => {
      const merchant = await Merchant.findById(userId).session(session);
      if (!merchant) throw new Error("Merchant not found");

      const transactions = await Transaction.find({
        merchantId: merchant._id,
        type: { $in: ["merchant_credit", "withdrawal_settle"] },
      }).session(session);

      const totalCredits = transactions
        .filter((t) => t.type === "merchant_credit")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawals = transactions
        .filter((t) => t.type === "withdrawal_settle")
        .reduce((sum, t) => sum + t.amount, 0);

      const availableBalance = totalCredits - totalWithdrawals;
      if (availableBalance < amount) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient balance" });
      }

      await Transaction.create(
        [
          {
            userId,
            merchantId: merchant._id,
            amount,
            type: "withdrawal_request",
            direction: "debit",
            meta: { note: "Merchant withdrawal request" },
          },
        ],
        { session }
      );

      res.json({
        success: true,
        message: "Withdrawal request submitted",
        data: { amount, availableBalance: availableBalance - amount },
      });
    });
  } catch (error) {
    console.error("requestWithdrawal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getDashboard,
  createAd,
  getAds,
  updateProfile,
  getEarningSummary,
  requestWithdrawal,
};
