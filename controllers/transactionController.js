const transactionService = require("../services/transactionService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");

const getTransactions = asyncHandler(async (req, res) => {
  const response = await transactionService.getTransactions(req.user.id, req.query);
  return applyServiceResponse(res, response);
});

const auditTransaction = asyncHandler(async (req, res) => {
  const response = await transactionService.auditTransaction(req.params.refId);
  return applyServiceResponse(res, response);
});

module.exports = {
  getTransactions,
  auditTransaction,
};
