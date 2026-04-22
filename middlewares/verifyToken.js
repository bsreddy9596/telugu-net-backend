const jwt = require("jsonwebtoken");

const env = require("../config/env");
const HTTP_STATUS = require("../constants/httpStatus");
const { COMMON_MESSAGES } = require("../constants/messages");
const { buildErrorResponse } = require("../utils/apiResponse");

module.exports = function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        buildErrorResponse({
          message: COMMON_MESSAGES.MISSING_TOKEN,
        })
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.accessToken.secret);

    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("protect middleware:", err.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      buildErrorResponse({
        message: COMMON_MESSAGES.UNAUTHORIZED,
      })
    );
  }
};
