
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const env = require("../config/env");

const ACCESS_TOKEN_SECRET = env.accessToken.secret;
const ACCESS_TOKEN_EXPIRES_IN = env.accessToken.expiresIn;
const REFRESH_TOKEN_EXPIRES_DAYS = env.refreshToken.expiresInDays;

function createAccessToken(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

async function createRefreshToken(user) {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.updateMany(
    { user: user._id, revoked: false },
    { revoked: true }
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    revoked: false,
  });

  return token;
}

async function verifyRefreshToken(rawToken) {
  if (!rawToken) return null;

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const tokenDoc = await RefreshToken.findOne({ tokenHash }).populate("user");

  if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
    return null;
  }

  return tokenDoc;
}

async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await RefreshToken.updateOne({ tokenHash }, { revoked: true });
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
};
