const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'merchent'
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128, required: true
    },
    type: {
        type: String, enum: ['recharge', 'payment'], required: true
    },
    createdAt: { type: Date, default: Date.now }
})

transactionSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Transaction', transactionSchema);