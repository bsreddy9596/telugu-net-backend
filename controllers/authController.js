const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp')
const sendOtp = require('../utils/sendOtp')
const JWT = require('jsonwebtoken')


const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const JWT_EXP = process.env.JWT_EXP || '7d'


exports.requestOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'phone number required' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const codeHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.findOneAndUpdate(
            { phone },
            { codeHash, expiresAt, createdAt: new Date() },
            { upsert: true, new: true }
        );
        await sendOtp(phone, otp);

        return res.json({ message: 'otp sent' })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'server error' })

    };
}


exports.verifyOtp = async (req, res) => {
    try {
        const { phone, code, name, email } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ message: 'phone and otp required' });
        }

        const otpDoc = await Otp.findOne({ phone });
        if (!otpDoc) {
            return res.status(400).json({ message: 'otp not found or expired' });
        }

        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        if (codeHash !== otpDoc.codeHash) {
            return res.status(400).json({ message: 'invalid OTP' })
        }

        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, name: name || "User", email });
        }

        await Otp.deleteMany({ phone })

        const payload = { id: user._id, phone: user.phone };
        const token = JWT.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

        return res.json({ message: 'OTP verified', token, user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'server error' });
    }
}