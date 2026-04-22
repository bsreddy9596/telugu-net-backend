const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "recharge",
        "cashback",
        "payment",
        "merchant_credit",
        "commission",
        "promo",
        "system",
        "broadcast",
      ],
      default: "system",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
