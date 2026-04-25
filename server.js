const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

const env = require("./config/env");
const logger = require("./config/logger");
const { connectDB } = require("./config/db");
console.log("SERVER RUNNING FROM:", __dirname);
const { initAdmin } = require("./config/initAdmin");
const { swaggerDocs } = require("./config/swagger");
const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const adRoutes = require("./routes/adRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const faqRoutes = require("./routes/faqRoutes");

const app = express();

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(requestLogger);

swaggerDocs(app);

app.get("/", (req, res) => {
  res.send("✅ Telugu-Net Backend is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/faqs", faqRoutes);

app.use("/user", userRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    logger.info("MongoDB connected successfully.");
    initAdmin();
    app.listen(env.port, () => {
      logger.info(`Server started on port ${env.port} in ${env.nodeEnv} mode`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", { message: err.message });
    process.exit(1);
  });
