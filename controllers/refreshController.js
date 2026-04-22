const asyncHandler = require("../middlewares/asyncHandler");
const refreshService = require("../services/refreshService");
const { applyServiceResponse } = require("../utils/serviceResponse");

exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const response = await refreshService.refreshAccessToken({
    refreshToken: req.cookies?.refreshToken || req.body?.refreshToken,
  });

  return applyServiceResponse(res, response);
});

exports.logout = asyncHandler(async (req, res) => {
  const response = await refreshService.logout({
    refreshToken: req.cookies?.refreshToken || req.body?.refreshToken,
  });

  return applyServiceResponse(res, response);
});
