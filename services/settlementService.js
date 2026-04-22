const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const transactionService = require("./transactionService");
const walletService = require("./walletService");
const { withSession } = require("../config/db");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");

const finalizePayment = async (orderId, paymentId) => {
  let result;

  await withSession(async (session) => {

    const transaction = await Transaction.findOneAndUpdate(
      { orderId, status: { $ne: "success" } },
      { $set: { status: "success", paymentId: paymentId } },
      { new: true, session }
    ).lean();

    if (!transaction) {
      const existingTx = await Transaction.findOne({ orderId }).session(session).lean();
      if (existingTx && existingTx.status === "success") {
        result = { success: true, message: "Payment already processed", data: existingTx };
        return;
      }
      throw new AppError("Transaction not found or invalid flow", HTTP_STATUS.NOT_FOUND);
    }

    if (transaction.type === "wallet_recharge") {

      await walletService.credit(transaction.userId, transaction.amount, session);
    } 
    else if (transaction.type === "qr_payment") {

      if (transaction.merchantId) {
        const merchant = await Merchant.findById(transaction.merchantId)
          .session(session)
          .select("ownerUserId")
          .lean();
        
        if (merchant && merchant.ownerUserId) {
          await walletService.credit(merchant.ownerUserId, transaction.amount, session);
        }
      }
    }

    result = { 
      success: true, 
      message: "Settlement completed successfully", 
      data: transaction 
    };
  });

  return result;
};

module.exports = {
  finalizePayment,
};
