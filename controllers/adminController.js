const User = require("../models/User");
const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const Ad = require("../models/Ad");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
const JWT_EXP = process.env.JWT_EXP || "7d";

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password required" });
        }

        const admin = await User.findOne({ email, role: "admin" });
        if (!admin) {
            return res
                .status(401)
                .json({ success: false, message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const payload = { id: admin._id, email: admin.email, role: admin.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

        return res.json({
            success: true,
            message: "Admin login successful",
            token,
            admin: { id: admin._id, email: admin.email, role: admin.role },
        });
    } catch (error) {
        console.error("adminLogin error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -__v")
            .sort({ createdAt: -1 });
        return res.json({ success: true, data: users });
    } catch (err) {
        console.error("listUsers error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { isApproved: true },
            { new: true }
        ).select("-password -__v");

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        return res.json({ success: true, message: "User approved", data: user });
    } catch (err) {
        console.error("approveUser error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        ).select("-password -__v");

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        return res.json({ success: true, message: "User deactivated", data: user });
    } catch (err) {
        console.error("deactivateUser error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const listMerchants = async (req, res) => {
    try {
        const merchants = await Merchant.find()
            .select("-password -__v")
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: merchants });
    } catch (err) {
        console.error("listMerchants error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const approveMerchant = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const merchant = await Merchant.findByIdAndUpdate(
            merchantId,
            { isApproved: true },
            { new: true }
        ).select("-password -__v");

        if (!merchant) {
            return res
                .status(404)
                .json({ success: false, message: "Merchant not found" });
        }

        return res.json({
            success: true,
            message: "Merchant approved",
            data: merchant,
        });
    } catch (err) {
        console.error("approveMerchant error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const rejectMerchant = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const merchant = await Merchant.findByIdAndUpdate(
            merchantId,
            { isApproved: false },
            { new: true }
        ).select("-password -__v");

        if (!merchant) {
            return res
                .status(404)
                .json({ success: false, message: "Merchant not found" });
        }

        return res.json({
            success: true,
            message: "Merchant rejected",
            data: merchant,
        });
    } catch (err) {
        console.error("rejectMerchant error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getRevenueReport = async (req, res) => {
    try {
        const commissionTotal = await Transaction.aggregate([
            { $match: { type: "commission" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const rechargeTotal = await Transaction.aggregate([
            { $match: { type: "recharge" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const adsRevenue = await Ad.aggregate([
            { $group: { _id: null, total: { $sum: "$cost" } } },
        ]);

        return res.json({
            success: true,
            data: {
                commission: commissionTotal[0]?.total || 0,
                recharge: rechargeTotal[0]?.total || 0,
                ads: adsRevenue[0]?.total || 0,
            },
        });
    } catch (err) {
        console.error("getRevenueReport error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const activeUsers = await User.countDocuments({ isActive: true });

        const totalMerchants = await Merchant.countDocuments();

        const approvedMerchants = await Merchant.countDocuments({
            isApproved: true,
        });

        const txnCount = await Transaction.countDocuments();

        return res.json({
            success: true,
            data: {
                activeUsers,
                totalMerchants,
                approvedMerchants,
                transactions: txnCount,
            },
        });
    } catch (err) {
        console.error("getAnalytics error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const listPendingAds = async (req, res) => {
    try {
        const ads = await Ad.find({ status: "pending" }).populate(
            "merchantId",
            "shop_name email"
        );
        res.json({ success: true, data: ads });
    } catch (err) {
        console.error("listPendingAds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const approveAd = async (req, res) => {
    try {
        const { adId } = req.params;
        const ad = await Ad.findByIdAndUpdate(
            adId,
            { status: "approved" },
            { new: true }
        );
        if (!ad)
            return res.status(404).json({ success: false, message: "Ad not found" });

        res.json({ success: true, message: "Ad approved", data: ad });
    } catch (err) {
        console.error("approveAd error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const rejectAd = async (req, res) => {
    try {
        const { adId } = req.params;
        const ad = await Ad.findByIdAndUpdate(
            adId,
            { status: "rejected" },
            { new: true }
        );
        if (!ad)
            return res.status(404).json({ success: false, message: "Ad not found" });

        res.json({ success: true, message: "Ad rejected", data: ad });
    } catch (err) {
        console.error("rejectAd error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    adminLogin,
    listUsers,
    approveUser,
    deactivateUser,
    listMerchants,
    approveMerchant,
    rejectMerchant,
    getRevenueReport,
    getAnalytics,
    listPendingAds,
    approveAd,
    rejectAd,
};
