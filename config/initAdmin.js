const bcrypt = require("bcryptjs");
const User = require("../models/User");

const initAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminRole = process.env.ADMIN_ROLE || "admin";

        if (!adminEmail || !adminPassword) {
            console.warn("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
            return;
        }

        let admin = await User.findOne({ email: adminEmail, role: adminRole });

        if (!admin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            admin = await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                phone: 9999999999,
                role: adminRole,
                isApproved: true,
                walletBalance: 0,
            });

            console.log("Admin created with email:", admin.email);
        } else {
            console.log("iAdmin already exists:", admin.email);
        }
    } catch (err) {
        console.error(" Error initializing admin:", err);
    }
};

module.exports = { initAdmin };
