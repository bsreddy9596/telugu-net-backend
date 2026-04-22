const AppError = require("../utils/AppError");
const HTTP_STATUS = require("../constants/httpStatus");
const { COMMON_MESSAGES } = require("../constants/messages");

module.exports = function notFound(req, res, next) {
  next(new AppError(COMMON_MESSAGES.ROUTE_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
};
