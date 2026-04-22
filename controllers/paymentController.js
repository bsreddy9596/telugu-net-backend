const orchestrator = require("../services/paymentOrchestratorService");
const settlementService = require("../services/settlementService");
const asyncHandler = require("../middlewares/asyncHandler");
const HTTP_STATUS = require("../constants/httpStatus");

exports.initiateQrPay = asyncHandler(async (req, res) => {
  const { amount, merchantId } = req.body;

  const orderData = await orchestrator.initiatePaymentFlow(req.user.id, {
    amount,
    merchantId,
    type: "qr_payment",
    refPrefix: "QR"
  });

  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "QR Payment initiated",
    data: orderData 
  });
});

exports.verifyQrPay = asyncHandler(async (req, res) => {
  const result = await orchestrator.verifyAndSettleFlow(req.body);

  res.status(HTTP_STATUS.OK).json({ 
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result.data
  });
});

exports.handleWebhook = asyncHandler(async (req, res) => {

  const signature = req.headers["x-razorpay-signature"];

  const { event, payload } = req.body;
  if (event === "payment.captured") {
    const payment = payload.payment.entity;

    await settlementService.finalizePayment(payment.order_id, payment.id);
  }

  res.status(HTTP_STATUS.OK).json({ statusCode: 200, success: true });
});
