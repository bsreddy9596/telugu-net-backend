const crypto = require("crypto");
const Razorpay = require("razorpay");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

const createOrder = async (amount) => {
  const amountInPaise = amount * 100;

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      keyId: env.razorpay.keyId,
    };
  } catch (error) {
    throw new AppError("Payment initiation failed", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", env.razorpay.keySecret || "dummy_secret")
    .update(sign.toString())
    .digest("hex");

  return expectedSign === razorpay_signature;
};

module.exports = {
  createOrder,
  verifyPayment,
};
