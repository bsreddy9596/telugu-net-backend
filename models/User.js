const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true, },
    email: { type: String },
    wallet_balance: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
    created_at: { type: Date, default: Date.now }

}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)