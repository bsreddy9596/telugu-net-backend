const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: false,
    },

    type: {
      type: String,
      enum: [
        "recharge",
        "payment",
        "wallet_recharge",
        "wallet_payment",
        "cashback",
        "commission",
        "merchant_credit",
        "withdrawal_request",
        "withdrawal_settle",
        "qr_payment",
        "bill_payment"
      ],
      required: true,
    },

    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderId: {
      type: String,
    },

    paymentId: {
      type: String,
    },

    meta: {
      type: Object,
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ merchantId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ direction: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
