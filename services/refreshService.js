const env = require("../config/env");
const logger = require("../config/logger");
const HTTP_STATUS = require("../constants/httpStatus");
const { AUTH_MESSAGES } = require("../constants/messages");
const AppError = require("../utils/AppError");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require("../utils/token");

function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
    maxAge: env.refreshToken.expiresInDays * 24 * 60 * 60 * 1000,
  };
}

function getRefreshTokenClearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
  };
}

async function refreshAccessToken({ refreshToken }) {
  if (!refreshToken) {
    throw new AppError(AUTH_MESSAGES.MISSING_REFRESH_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }

  const dbTokenDoc = await verifyRefreshToken(refreshToken);
  if (!dbTokenDoc) {
    throw new AppError(AUTH_MESSAGES.INVALID_OR_EXPIRED_REFRESH_TOKEN, HTTP_STATUS.FORBIDDEN);
  }

  const user = dbTokenDoc.user;
  if (!user) {
    throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND_FOR_TOKEN, HTTP_STATUS.NOT_FOUND);
  }

  await revokeRefreshToken(refreshToken);

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user);

  logger.info("Access token refreshed", { userId: String(user._id) });

  return {
    statusCode: HTTP_STATUS.OK,
    message: AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED,
    data: { accessToken: newAccessToken },
    accessToken: newAccessToken,
    cookies: [
      {
        name: "refreshToken",
        value: newRefreshToken,
        options: getRefreshTokenCookieOptions(),
      },
    ],
  };
}

async function logout({ refreshToken }) {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  logger.info("User logged out");

  return {
    statusCode: HTTP_STATUS.OK,
    message: AUTH_MESSAGES.LOGGED_OUT,
    data: null,
    clearCookies: [
      {
        name: "refreshToken",
        options: getRefreshTokenClearCookieOptions(),
      },
    ],
  };
}

module.exports = {
  refreshAccessToken,
  logout,
  getRefreshTokenCookieOptions,
};
