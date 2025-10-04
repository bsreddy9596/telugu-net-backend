const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.DB_URL;

        mongoose.set("strictQuery", true);

        await mongoose.connect(uri, {
            autoIndex: true,
        });

        console.log(
            `✅ MongoDB connected: ${uri.includes("mongodb+srv") ? "Atlas Cluster" : "Localhost"
            }`
        );
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
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
