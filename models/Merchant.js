const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
      alias: "dob",
    },
    businessDetails: {
      name: { type: String },
      type: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
      accountType: { type: String },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["merchant"],
      default: "merchant",
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    discount: {
      type: String,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

merchantSchema.index({ "location": "2dsphere" });

const Merchant = mongoose.model("Merchant", merchantSchema);

module.exports = Merchant;
