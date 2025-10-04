const Ad = require("../models/Ad");

const createAd = async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { title, description, category, location, media } = req.body;

        if (!title || !media || media.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "Title & media required" });
        }

        const ad = await Ad.create({
            merchantId,
            title,
            description,
            category,
            location,
            media,
        });

        res.status(201).json({ success: true, message: "Ad created", data: ad });
    } catch (err) {
        console.error("createAd error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getMyAds = async (req, res) => {
    try {
        const merchantId = req.user.id;
        const ads = await Ad.find({ merchantId }).sort({ createdAt: -1 });
        res.json({ success: true, data: ads });
    } catch (err) {
        console.error("getMyAds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const reviewAd = async (req, res) => {
    try {
        const { adId } = req.params;
        const { status, isPremium } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid status" });
        }

        const ad = await Ad.findByIdAndUpdate(
            adId,
            { status, isPremium: !!isPremium },
            { new: true }
        );

        if (!ad)
            return res.status(404).json({ success: false, message: "Ad not found" });

        res.json({ success: true, message: `Ad ${status}`, data: ad });
    } catch (err) {
        console.error("reviewAd error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getAllAds = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.location) filter.location = req.query.location;
        if (req.query.status) filter.status = req.query.status;

        const ads = await Ad.find(filter)
            .populate("merchantId", "shop_name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: ads });
    } catch (err) {
        console.error("getAllAds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getPremiumAds = async (req, res) => {
    try {
        const ads = await Ad.find({ status: "approved", isPremium: true }).sort({
            createdAt: -1,
        });
        res.json({ success: true, data: ads });
    } catch (err) {
        console.error("getPremiumAds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createAd,
    getMyAds,
    reviewAd,
    getAllAds,
    getPremiumAds,
};
