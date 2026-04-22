const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: String, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
