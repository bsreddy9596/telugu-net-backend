require("dotenv").config();


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initAdmin } = require('./config/initAdmin'); // 🔑 Add this line


const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const adRoutes = require('./routes/adRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);


app.get('/', (req, res) => {
    res.send('Telugu-Net Backend is running...');
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

const PORT = process.env.PORT || 5000;


connectDB().then(() => {
    initAdmin();


    app.listen(PORT, () => {
        console.log(` Server started on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
});
