const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(\+91)?[0-9]{10}$/,
        "Phone number must be valid (+91XXXXXXXXXX or 10 digits)",
      ],
    },
    password: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    name: {
      type: String,
      trim: true,
    },

    wallet_balance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile_image: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
      index: true,
    },
    settings: {
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
      },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      alias: "dob",
    },

    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, "Pincode must be 6 digits"],
    },
    cashback: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
