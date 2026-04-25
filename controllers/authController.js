const authService = require("../services/authService");
const asyncHandler = require("../middlewares/asyncHandler");
const HTTP_STATUS = require("../constants/httpStatus");

exports.requestOtp = asyncHandler(async (req, res) => {
  if (req.body.phone) {
    req.body.phone = req.body.phone.replace(/\s+/g, "");
    if (!req.body.phone.startsWith("+")) req.body.phone = "+91" + req.body.phone;
  }
  const result = await authService.requestOtp(req.body);
  res.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  if (req.body.phone) {
    req.body.phone = req.body.phone.replace(/\s+/g, "");
    if (!req.body.phone.startsWith("+")) req.body.phone = "+91" + req.body.phone;
  }
  const result = await authService.verifyOtp({
    phone: req.body.phone,
    otp: req.body.otp,
  });

  res.status(result.statusCode).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});
