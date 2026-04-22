const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    category: { type: String, required: true },
    distance: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    discount: { type: String, required: true },
    image: { type: String, required: true },
    isSponsored: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
