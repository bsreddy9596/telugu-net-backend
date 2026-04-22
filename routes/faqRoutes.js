const express = require("express");
const router = express.Router();
const faqService = require("../services/faqService");
const asyncHandler = require("../middlewares/asyncHandler");
const { applyServiceResponse } = require("../utils/serviceResponse");
const HTTP_STATUS = require("../constants/httpStatus");

router.get("/", asyncHandler(async (req, res) => {
  const faqs = await faqService.getFaqs();
  return res.status(HTTP_STATUS.OK).json({
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQs fetched successfully",
    data: faqs
  });
}));

module.exports = router;
