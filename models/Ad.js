const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isPremium: {
      type: Boolean,
      default: false,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
