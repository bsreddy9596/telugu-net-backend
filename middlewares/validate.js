const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/httpStatus");
const { COMMON_MESSAGES } = require("../constants/messages");
const { buildErrorResponse } = require("../utils/apiResponse");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("VALIDATION ERRORS:", JSON.stringify(errors.array(), null, 2));
    console.log("REQUEST PHONE:", req.body.phone);
  }

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push(err.msg));

  const message =
    extractedErrors.length === 1
      ? extractedErrors[0]
      : COMMON_MESSAGES.VALIDATION_FAILED;

  return res.status(HTTP_STATUS.BAD_REQUEST).json(
    buildErrorResponse({
      message,
      ...(extractedErrors.length > 1 ? { errors: extractedErrors } : {}),
      data: null,
    })
  );
};

module.exports = validate;
