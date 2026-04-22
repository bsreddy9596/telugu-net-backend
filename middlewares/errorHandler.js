const HTTP_STATUS = require("../constants/httpStatus");
const { COMMON_MESSAGES } = require("../constants/messages");
const logger = require("../config/logger");
const { buildErrorResponse } = require("../utils/apiResponse");

function errorHandler(err, req, res, next) {
  let statusCode =
    err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || COMMON_MESSAGES.INTERNAL_SERVER_ERROR;
  let errors;

  if (err.name === "ValidationError" && err.errors) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = COMMON_MESSAGES.VALIDATION_FAILED;
    errors = Object.values(err.errors).map(
      (validationError) => validationError.message
    );
  }

  if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = err.statusCode || HTTP_STATUS.UNAUTHORIZED;
  }

  logger.error(message, {
    statusCode,
    stack: logger.isDevelopment ? err.stack : undefined,
  });

  const response = buildErrorResponse({
    message,
    data: null,
    ...(errors ? { errors } : {}),
    ...(logger.isDevelopment ? { stack: err.stack } : {}),
  });

  return res.status(Number(statusCode)).json(response);
}

module.exports = errorHandler;
