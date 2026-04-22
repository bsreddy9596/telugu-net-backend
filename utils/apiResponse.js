function sendSuccess(res, { statusCode = 200, message, data = null, ...extra }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
}

function buildErrorResponse({ message, data = null, ...extra }) {
  return {
    success: false,
    message,
    data,
    ...extra,
  };
}

module.exports = {
  sendSuccess,
  buildErrorResponse,
};
