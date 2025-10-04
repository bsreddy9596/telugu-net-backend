const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    shop_name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    bank_details: {
      bank_name: { type: String, required: true },
      account_number: { type: String, required: true },
      ifsc_code: { type: String, required: true },
      holder_name: { type: String, required: true },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    qrCodeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["merchant"],
      default: "merchant",
    },
  },
  { timestamps: true }
);

const Merchant = mongoose.model("merchant", merchantSchema);

module.exports = Merchant;
