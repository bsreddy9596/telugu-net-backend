const env = require("./env");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const logger = require("./logger");

const initAdmin = async () => {
    try {
        const adminEmail = env.admin?.email;
        const adminPassword = env.admin?.password;
        const adminRole = env.admin?.role || "admin";

        if (!adminEmail || !adminPassword) {
            logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
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

            logger.info("Admin created", { email: admin.email });
        } else {
            logger.info("Admin already exists", { email: admin.email });
        }
    } catch (err) {
        logger.error("Error initializing admin", { message: err.message });
    }
};

module.exports = { initAdmin };
