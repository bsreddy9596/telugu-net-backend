const { sendSuccess } = require("./apiResponse");

function applyServiceResponse(res, serviceResponse) {
  const {
    statusCode,
    message,
    data = null,
    cookies = [],
    clearCookies = [],
    ...extra
  } = serviceResponse;

  cookies.forEach(({ name, value, options }) => {
    res.cookie(name, value, options);
  });

  clearCookies.forEach(({ name, options }) => {
    res.clearCookie(name, options);
  });

  return sendSuccess(res, {
    statusCode,
    message,
    data,
    ...extra,
  });
}

module.exports = {
  applyServiceResponse,
};
