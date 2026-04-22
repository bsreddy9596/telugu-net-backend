const admin = require("firebase-admin");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

async function sendFCMNotification({ token, title, body, data = {} }) {
  try {
    if (!token) throw new AppError("FCM token missing", 400);

    const tokens = Array.isArray(token) ? token : [token];

    const message = {
      notification: { title, body },
      data: { ...data },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info("FCM Push Result:", { success: response.successCount, failed: response.failureCount });

    return {
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      errors: response.responses.filter((r) => !r.success),
    };
  } catch (err) {
    logger.error("FCM Notification Error:", { message: err.message });
    return { success: false, error: err.message };
  }
}

module.exports = { sendFCMNotification };
