require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function migrateWalletField() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected");

    const users = await User.find({ walletBalance: { $exists: true } });
    console.log(
      `🔍 Found ${users.length} users with old 'walletBalance' field`
    );

    for (const user of users) {
      if (user.walletBalance !== undefined) {
        const newBalance = user.walletBalance;
        user.wallet_balance = newBalance;
        user.walletBalance = undefined;
        await user.save();
        console.log(`✅ Migrated user: ${user.email} → ${newBalance}`);
      }
    }

    console.log("🎯 Migration completed successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    mongoose.connection.close();
  }
}

migrateWalletField();
