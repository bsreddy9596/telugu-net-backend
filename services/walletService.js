const User = require("../models/User");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { USER_MESSAGES, WALLET_MESSAGES } = require("../constants/messages");
const transactionService = require("./transactionService");
const { withSession } = require("../config/db");

const getBalance = async (userId) => {
  const user = await User.findById(userId).select("wallet_balance").lean();
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user.wallet_balance || 0;
};

const credit = async (userId, amount, session = null) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { wallet_balance: amount } },
    { new: true, session, lean: true }
  );
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user.wallet_balance;
};

const debit = async (userId, amount, session = null) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new AppError(USER_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  if ((user.wallet_balance || 0) < amount) {
    throw new AppError(WALLET_MESSAGES.INSUFFICIENT_BALANCE, HTTP_STATUS.BAD_REQUEST);
  }

  user.wallet_balance -= amount;
  await user.save({ session });
  return user.wallet_balance;
};

const payWithWallet = async (userId, { amount, merchantId, merchantOwnerId }) => {
  let result;
  await withSession(async (session) => {

    const newBalance = await debit(userId, amount, session);

    await transactionService.createTransaction({
      refId: `WP${Date.now()}`,
      userId: userId,
      merchantId,
      type: "wallet_payment",
      direction: "debit",
      amount,
      status: "success",
    }, session);

    if (merchantOwnerId) {
      await credit(merchantOwnerId, amount, session);
    }

    result = { newBalance };
  });
  return result;
};

module.exports = {
  getBalance,
  credit,
  debit,
  payWithWallet,
};
