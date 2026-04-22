const Transaction = require("../models/Transaction");
const Ad = require("../models/Ad");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { TRANSACTION_MESSAGES } = require("../constants/messages");

const createTransaction = async (transactionData, session = null) => {
  const transaction = await Transaction.create([transactionData], { session });
  return transaction[0];
};

const getTransactionByOrderId = async (orderId, session = null) => {
  const transaction = await Transaction.findOne({ orderId }).session(session).lean();
  if (!transaction) throw new AppError(TRANSACTION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return transaction;
};

const updateTransactionStatus = async (orderId, updates, session = null) => {
  const transaction = await Transaction.findOneAndUpdate(
    { orderId },
    { $set: updates },
    { new: true, session }
  ).lean();
  if (!transaction) throw new AppError(TRANSACTION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return transaction;
};

const getTransactions = async (params, query) => {
  const { userId, merchantId } = params;
  
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (userId) filter.userId = userId;
  if (merchantId) filter.merchantId = merchantId;
  
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name phone" })
      .populate({ path: "merchantId", select: "name businessDetails.name category" })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    statusCode: HTTP_STATUS.OK,
    message: TRANSACTION_MESSAGES.FETCHED,
    data: transactions,
    total,
    page,
    limit,
  };
};

const getRevenueReport = async () => {
  const [commissionTotal, rechargeTotal, adsRevenue] = await Promise.all([
    Transaction.aggregate([{ $match: { type: "commission", status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { type: "wallet_recharge", status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Ad.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, total: { $sum: "$cost" } } }]),
  ]);

  return {
    statusCode: HTTP_STATUS.OK,
    message: "Revenue report generated",
    data: {
      commission: commissionTotal[0]?.total || 0,
      recharge: rechargeTotal[0]?.total || 0,
      ads: adsRevenue[0]?.total || 0,
    },
  };
};

module.exports = {
  createTransaction,
  getTransactionByOrderId,
  updateTransactionStatus,
  getTransactions,
  getRevenueReport,
};
