const orchestrator = require("../services/paymentOrchestratorService");
const walletService = require("../services/walletService");
const asyncHandler = require("../middlewares/asyncHandler");
const HTTP_STATUS = require("../constants/httpStatus");

exports.getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getBalance(req.user.id);
  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Balance fetched successfully",
    data: { wallet_balance: balance } 
  });
});

exports.initiateRecharge = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  const orderData = await orchestrator.initiatePaymentFlow(req.user.id, {
    amount,
    type: "wallet_recharge",
    direction: "credit",
    refPrefix: "WR"
  });

  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Recharge order created successfully",
    data: orderData 
  });
});

exports.verifyRecharge = asyncHandler(async (req, res) => {
  const result = await orchestrator.verifyAndSettleFlow(req.body);

  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result.data
  });
});

exports.payWithWallet = asyncHandler(async (req, res) => {
  const { amount, merchantId, merchantOwnerId } = req.body;

  const result = await walletService.payWithWallet(req.user.id, { 
    amount, 
    merchantId, 
    merchantOwnerId 
  });

  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Payment processed via wallet",
    data: { wallet_balance: result.newBalance } 
  });
});
