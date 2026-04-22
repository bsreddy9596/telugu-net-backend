const paymentService = require("./paymentService");
const transactionService = require("./transactionService");
const settlementService = require("./settlementService");
const HTTP_STATUS = require("../constants/httpStatus");
const AppError = require("../utils/AppError");

const initiatePaymentFlow = async (userId, { amount, merchantId, type, direction, refPrefix = "TXN" }) => {

  const orderData = await paymentService.createOrder(amount);

  await transactionService.createTransaction({
    refId: `${refPrefix}${Date.now()}`,
    userId,
    merchantId,
    type,
    direction: direction || (type === "wallet_recharge" ? "credit" : "debit"),
    amount,
    orderId: orderData.orderId,
    status: "pending",
  });

  return orderData;
};

const verifyAndSettleFlow = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {

  const isAuthentic = await paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isAuthentic) {

    await transactionService.updateTransactionStatus(razorpay_order_id, {
      status: "failed",
      paymentId: razorpay_payment_id,
    });
    throw new AppError("Payment verification failed", HTTP_STATUS.BAD_REQUEST);
  }

  return await settlementService.finalizePayment(razorpay_order_id, razorpay_payment_id);
};

module.exports = {
  initiatePaymentFlow,
  verifyAndSettleFlow,
};
