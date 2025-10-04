const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { withSession } = require("../config/db");

const rechargeWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { amount, source } = req.body;
    const amt = Number(amount);

    if (!amt || isNaN(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    await withSession(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");

      user.walletBalance = (user.walletBalance || 0) + amt;
      await user.save({ session });

      await Transaction.create(
        [
          {
            userId,
            amount: amt,
            type: "recharge",
            direction: "credit",
            meta: {
              source: source || "manual_recharge",
              note: "Wallet recharge",
            },
          },
        ],
        { session }
      );

      res.status(200).json({
        success: true,
        message: "Wallet recharged successfully",
        data: { walletBalance: user.walletBalance },
      });
    });
  } catch (err) {
    console.error("rechargeWallet error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("walletBalance");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({
      success: true,
      data: { walletBalance: user.walletBalance },
    });
  } catch (err) {
    console.error("getWalletBalance error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .populate({ path: "merchantId", select: "shop_name category" })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page,
      limit,
      data: transactions,
    });
  } catch (err) {
    console.error("getTransactionHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  rechargeWallet,
  getWalletBalance,
  getTransactionHistory,
};
