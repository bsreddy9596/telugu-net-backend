const env = require("./env");
const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
    try {
        const uri = env.dbUrl;

        mongoose.set("strictQuery", true);

        await mongoose.connect(uri, {
            autoIndex: true,
        });

        logger.info(`MongoDB connected: ${uri.includes("mongodb+srv") ? "Atlas Cluster" : "Localhost"}`);
    } catch (error) {
        logger.error("MongoDB connection error:", { message: error.message });
        process.exit(1);
    }
};

const withSession = async (fn) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

module.exports = { connectDB, withSession };
