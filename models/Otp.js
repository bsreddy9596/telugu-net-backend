const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: String, required: true, index: true },
    createdAt: { type: String, required: true }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema)