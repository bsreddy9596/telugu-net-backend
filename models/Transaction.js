const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: [
        "recharge",
        "payment",
        "cashback",
        "commission",
        "merchant_credit",
        "withdrawal_request",
        "withdrawal_settle",
      ],
      required: true,
    },

    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ merchantId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
