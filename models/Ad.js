const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true
    },
    ad_content: { type: String },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);