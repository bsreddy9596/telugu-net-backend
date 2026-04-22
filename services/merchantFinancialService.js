const Merchant = require("../models/Merchant");
const QRCode = require('qrcode');
const walletService = require("./walletService");
const transactionService = require("./transactionService");
const { withSession } = require("../config/db");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { MERCHANT_MESSAGES } = require("../constants/messages");

const getDashboard = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).select("ownerUserId").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [walletBalance, transactionsResult, todayTransactionsResult, totalUsersCount] = await Promise.all([
    walletService.getBalance(merchant.ownerUserId),
    transactionService.getTransactions({ merchantId }, { limit: 1000 }),
    transactionService.getTransactions({ merchantId, startDate: startOfDay }, { limit: 1000 }),
    transactionService.getTransactions({ merchantId }, { limit: 1 }).then(res => res.total),
  ]);

  const totalEarnings = transactionsResult.data.reduce((sum, txn) => sum + txn.amount, 0);
  const todayEarnings = todayTransactionsResult.data.reduce((sum, txn) => sum + txn.amount, 0);

  return {
    statusCode: HTTP_STATUS.OK,
    message: MERCHANT_MESSAGES.DASHBOARD_FETCHED,
    data: {
      walletBalance,
      todayEarnings,
      todayTransactionsCount: todayTransactionsResult.total,
      totalUsers: totalUsersCount,
      totalEarnings,
      recentTransactions: transactionsResult.data.slice(0, 5).map(tx => ({
        amount: tx.amount,
        type: tx.type,
        user: tx.userId?.name || tx.userId?.phone || "Unknown User",
        status: tx.status,
        date: tx.createdAt
      })),
    },
  };
};

const getQrCode = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).select("qrId").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  let qrId = merchant.qrId || `MERCHANT_QR_${merchant._id}`;
  if (!merchant.qrId) {
    await Merchant.findByIdAndUpdate(merchantId, { $set: { qrId } });
  }

  const qrData = JSON.stringify({ merchantId });
  const qrImage = await QRCode.toDataURL(qrData);

  return {
    statusCode: HTTP_STATUS.OK,
    message: "QR Code generated",
    data: { qrId, qrImage },
  };
};

const getWallet = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).select("ownerUserId").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const balance = await walletService.getBalance(merchant.ownerUserId);
  return { 
    statusCode: HTTP_STATUS.OK, 
    message: MERCHANT_MESSAGES.FETCHED || "Wallet fetched", 
    data: { balance } 
  };
};

const requestWithdrawal = async (merchantId, amount) => {
  let result;
  await withSession(async (session) => {
    const merchant = await Merchant.findById(merchantId).session(session).lean();
    if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    await walletService.debit(merchant.ownerUserId, amount, session);

    await transactionService.createTransaction({
      userId: merchant.ownerUserId,
      merchantId: merchant._id,
      amount,
      type: "withdrawal_request",
      direction: "debit",
      status: "pending",
      meta: { note: "Merchant withdrawal request" },
    }, session);

    result = { 
      statusCode: HTTP_STATUS.OK, 
      message: MERCHANT_MESSAGES.WITHDRAWAL_REQUESTED, 
      data: { amount, status: "pending" } 
    };
  });
  return result;
};

module.exports = {
  getDashboard,
  getQrCode,
  getWallet,
  requestWithdrawal,
};
