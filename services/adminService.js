const User = require("../models/User");
const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const transactionService = require("./transactionService");
const walletService = require("./walletService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { withSession } = require("../config/db");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { ADMIN_MESSAGES, AUTH_MESSAGES, USER_MESSAGES, MERCHANT_MESSAGES } = require("../constants/messages");

const login = async ({ email, password }) => {
  const admin = await User.findOne({ email, role: "admin" }).select("+password").lean();
  if (!admin) throw new AppError(ADMIN_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS || "Invalid credentials", HTTP_STATUS.UNAUTHORIZED);

  const payload = { id: admin._id, email: admin.email, role: admin.role };
  const token = jwt.sign(payload, env.accessToken.secret, { expiresIn: env.accessToken.expiresIn });

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.LOGIN_SUCCESS,
    token,
    data: { id: admin._id, email: admin.email, role: admin.role },
  };
};

const listUsers = async () => {
  const users = await User.find().select("-password -__v").sort({ createdAt: -1 }).lean();
  return {
    statusCode: HTTP_STATUS.OK,
    data: users,
  };
};

const approveUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true }).select("-password -__v").lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.USER_APPROVED,
    data: user,
  };
};

const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select("-password -__v").lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.USER_DEACTIVATED,
    data: user,
  };
};

const listMerchants = async () => {
  const merchants = await Merchant.find().select("-__v").sort({ createdAt: -1 }).lean();
  return {
    statusCode: HTTP_STATUS.OK,
    data: merchants,
  };
};

const approveMerchant = async (merchantId) => {
  const merchant = await Merchant.findByIdAndUpdate(merchantId, { isApproved: true, status: "approved" }, { new: true }).select("-__v").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.MERCHANT_APPROVED,
    data: merchant,
  };
};

const rejectMerchant = async (merchantId) => {
  const merchant = await Merchant.findByIdAndUpdate(merchantId, { isApproved: false, status: "rejected" }, { new: true }).select("-__v").lean();
  if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.MERCHANT_REJECTED,
    data: merchant,
  };
};

const getRevenueReport = async () => {
  return await transactionService.getRevenueReport();
};

const getAnalytics = async () => {
  const [activeUsers, totalMerchants, approvedMerchants, txnCount] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Merchant.countDocuments(),
    Merchant.countDocuments({ isApproved: true }),
    Transaction.countDocuments(),
  ]);

  return {
    statusCode: HTTP_STATUS.OK,
    message: ADMIN_MESSAGES.ANALYTICS_FETCHED,
    data: { activeUsers, totalMerchants, approvedMerchants, transactions: txnCount },
  };
};

const listPendingWithdrawals = async () => {
  const pendingTxns = await Transaction.find({ type: "withdrawal_request" })
    .populate("merchantId", "name email businessDetails.type")
    .sort({ createdAt: -1 })
    .lean();

  return {
    statusCode: HTTP_STATUS.OK,
    data: pendingTxns,
  };
};

const settleWithdrawal = async (id, action) => {
  let result;
  await withSession(async (session) => {
    const withdrawalReq = await Transaction.findById(id).session(session);
    if (!withdrawalReq || withdrawalReq.type !== "withdrawal_request") {
      throw new AppError("Withdrawal request not found", HTTP_STATUS.NOT_FOUND);
    }
    if (withdrawalReq.status !== "pending") {
      throw new AppError(ADMIN_MESSAGES.ALREADY_SETTLED, HTTP_STATUS.BAD_REQUEST);
    }

    const merchant = await Merchant.findById(withdrawalReq.merchantId).session(session).lean();
    if (!merchant) throw new AppError(MERCHANT_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (action === "reject") {

      await walletService.credit(merchant.ownerUserId, withdrawalReq.amount, session);

      withdrawalReq.status = "failed";
      await withdrawalReq.save({ session });

      await transactionService.createTransaction({
        merchantId: merchant._id,
        userId: merchant.ownerUserId,
        amount: withdrawalReq.amount,
        type: "merchant_credit",
        direction: "credit",
        status: "success",
        meta: { note: "Withdrawal rejected, refunded", relatedId: id }
      }, session);

      result = { statusCode: HTTP_STATUS.OK, message: ADMIN_MESSAGES.WITHDRAWAL_REJECTED };
    } else if (action === "approve") {

      withdrawalReq.status = "success";
      await withdrawalReq.save({ session });

      await transactionService.createTransaction({
        merchantId: merchant._id,
        userId: merchant.ownerUserId,
        amount: withdrawalReq.amount,
        type: "withdrawal_settle",
        direction: "debit",
        status: "success",
        meta: { note: "Withdrawal approved & settled", relatedId: id }
      }, session);

      result = { statusCode: HTTP_STATUS.OK, message: ADMIN_MESSAGES.WITHDRAWAL_SETTLED };
    } else {
      throw new AppError(ADMIN_MESSAGES.INVALID_ACTION, HTTP_STATUS.BAD_REQUEST);
    }
  });

  return result;
};

module.exports = {
  login,
  listUsers,
  approveUser,
  deactivateUser,
  listMerchants,
  approveMerchant,
  rejectMerchant,
  getRevenueReport,
  getAnalytics,
  listPendingWithdrawals,
  settleWithdrawal,
};
