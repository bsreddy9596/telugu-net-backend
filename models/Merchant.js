const mongoose = require('mongoose');


const merchantSchema = new mongoose.Schema({
    shop_name: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    bank_details: {
        account_number: String,
        ifsc: String,
        bank_name: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Merchant', merchantSchema);