const User = require("../models/User");
const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const { withSession } = require("../config/db");

const qrPayment = async (req, res) => {
  const { merchantId, amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    await withSession(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");

      const merchant = await Merchant.findById(merchantId).session(session);
      if (!merchant) throw new Error("Merchant not found");

      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      const cashback = Math.floor(amount * 0.05);
      const commission = Math.floor(amount * 0.05);
      const merchantCredit = amount - cashback - commission;

      user.walletBalance = user.walletBalance - amount + cashback;
      await user.save({ session });

      const merchantOwner = await User.findById(merchant.ownerUserId).session(
        session
      );
      if (!merchantOwner) throw new Error("Merchant Owner not found");

      merchantOwner.walletBalance += merchantCredit;
      await merchantOwner.save({ session });

      const adminUserId = process.env.ADMIN_USER_ID;
      if (!adminUserId) throw new Error("Admin not configured");

      const adminUser = await User.findById(adminUserId).session(session);
      if (!adminUser) throw new Error("Admin user not found");

      adminUser.walletBalance += commission;
      await adminUser.save({ session });

      await Transaction.create(
        [
          {
            userId,
            merchantId,
            amount,
            type: "payment",
            direction: "debit",
            meta: { note: "User → Merchant payment" },
          },
          {
            userId,
            amount: cashback,
            type: "cashback",
            direction: "credit",
            meta: { note: "5% cashback credited" },
          },
          {
            userId: adminUserId,
            merchantId,
            amount: commission,
            type: "commission",
            direction: "credit",
            meta: { note: "Admin commission" },
          },
          {
            userId: merchantOwner._id,
            merchantId,
            amount: merchantCredit,
            type: "merchant_credit",
            direction: "credit",
            meta: { note: "Merchant credited" },
          },
        ],
        { session }
      );

      res.json({
        message: "Payment successful",
        paidAmount: amount,
        cashback,
        commission,
        merchantCredit,
        userBalance: user.walletBalance,
      });
    });
  } catch (error) {
    console.error("qrPayment error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { qrPayment };
