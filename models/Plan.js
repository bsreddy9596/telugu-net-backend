const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    speed: { type: String, required: true },
    dataLimit: { type: String, required: true },
    usedData: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    cashbackEarned: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
