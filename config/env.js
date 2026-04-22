require("dotenv").config();

function requireEnv(key) {
  if (!process.env[key]) {
    throw new Error(`CRITICAL ERROR: Environment variable "${key}" is missing. Execution halted for security.`);
  }
  return process.env[key];
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    tempTokenExpiresIn: "5m",
  },
  
  accessToken: {
    secret: requireEnv("ACCESS_TOKEN_SECRET"),
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  },
  
  refreshToken: {
    expiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7),
  },
  
  twilio: {
    sid: requireEnv("TWILIO_SID"),
    authToken: requireEnv("TWILIO_AUTH_TOKEN"),
    verifySid: requireEnv("TWILIO_VERIFY_SID"),
  },
  
  swagger: {
    localUrl: process.env.SWAGGER_LOCAL_URL || "http://localhost:5000",
    productionUrl: process.env.SWAGGER_PRODUCTION_URL || "https://api.telugunet.in",
  },
  
  razorpay: {
    keyId: requireEnv("RAZORPAY_KEY_ID"),
    keySecret: requireEnv("RAZORPAY_KEY_SECRET"),
  },
  
  firebase: {
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
    clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    storageBucket: process.env.FIREBASE_BUCKET,
  },
  
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: process.env.ADMIN_ROLE || "admin",
  },
  dbUrl: requireEnv("DB_URL"),
};
