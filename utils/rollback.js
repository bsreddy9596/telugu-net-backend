const AppError = require("./AppError");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const logger = require("../config/logger");

async function rollbackTransaction(session, rollbackData) {
  try {
    logger.info("Initiating rollback...");

    for (const r of rollbackData) {
      const { userId, amount, reason } = r;

      const user = await User.findById(userId).session(session);
      if (!user) throw new AppError(`User ${userId} not found`, 404);

      user.walletBalance = parseFloat((user.walletBalance + amount).toFixed(2));
      await user.save({ session });

      await Transaction.create(
        [
          {
            userId,
            amount,
            type: "rollback",
            direction: "credit",
            meta: { note: reason || "Auto rollback due to failure" },
          },
        ],
        { session }
      );
    }

    logger.info("Rollback completed successfully.");
  } catch (error) {
    logger.error("Rollback failed:", { message: error.message });
    throw new AppError("Rollback process failed", 500);
  }
}

module.exports = { rollbackTransaction };
