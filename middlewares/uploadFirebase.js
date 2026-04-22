const multer = require("multer");
const admin = require("firebase-admin");
const path = require("path");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    const isPlaceholder = env.firebase.privateKey.includes("YOUR_KEY_HERE") || !env.firebase.privateKey.includes("BEGIN PRIVATE KEY");
    
    if (isPlaceholder) {
      logger.warn("Firebase Private Key is a placeholder. Firebase features (Storage/FCM) will be disabled.");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
        storageBucket: env.firebase.storageBucket,
      });
      logger.info("Firebase app initialized successfully");
      firebaseInitialized = true;
    }
  } catch (err) {
    logger.error("Firebase initialization failed:", { message: err.message });
    logger.warn("Continuing without Firebase. Storage/FCM operations will fail.");
  }
} else {
  firebaseInitialized = true;
}

const bucket = firebaseInitialized ? admin.storage().bucket() : null;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(new AppError("Only JPG, JPEG, PNG allowed", 400));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { upload, bucket, admin, firebaseInitialized };
