const Merchant = require("../models/Merchant");
const Offer = require("../models/Offer");
const ShopItem = require("../models/ShopItem");

const getOffers = async () => {
  const offers = await Offer.find({ isActive: true }).lean();
  return offers.map(offer => ({
    title: offer.title,
    imageUrl: offer.imageUrl,
    discountText: offer.discountText,
    description: offer.description,
  }));
};

const getNearbyShops = async (lat, lng, category) => {
  const query = { status: "approved", isActive: true };
  if (category) query.category = category;

  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: 10000,
      },
    };
  }

  const shops = await Merchant.find(query).limit(50).lean();
  
  shops.sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    return 0;
  });

  return shops.map(shop => ({
    merchantId: shop._id,
    shopName: shop.name || shop.businessDetails?.name,
    category: shop.category,
    distance: "Near you",
    rating: shop.rating || 0,
    discount: shop.discount || "",
    image: shop.image || "",
    isSponsored: shop.isSponsored || false,
  }));
};

const getCategories = async () => {
  const categories = await Merchant.distinct("category", { status: "approved", isActive: true });
  return categories.filter(Boolean).map(cat => ({
    name: cat,
    icon: "storefront"
  }));
};

const getShopById = async (shopId) => {
  const shop = await Merchant.findById(shopId).lean();
  if (!shop || !shop.isActive || shop.status !== "approved") {
    const AppError = require("../utils/AppError");
    const HTTP_STATUS = require("../constants/httpStatus");
    throw new AppError("Shop not found", HTTP_STATUS.NOT_FOUND);
  }
  return {
    merchantId: shop._id,
    shopName: shop.name || shop.businessDetails?.name,
    category: shop.category,
    rating: shop.rating || 0,
    discount: shop.discount || "",
    image: shop.image || "",
    isSponsored: shop.isSponsored || false,
    businessDetails: shop.businessDetails,
    location: shop.location
  };
};

const getShopItems = async (shopId) => {
  const items = await ShopItem.find({ shopId, isActive: true }).lean();
  return items;
};

module.exports = {
  getOffers,
  getNearbyShops,
  getCategories,
  getShopById,
  getShopItems,
};
