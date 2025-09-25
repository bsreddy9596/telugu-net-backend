const mongoose = require('mongoose')

require('dotenv').config();

//models

const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Transaction = require('../models/Transaction');
const Ad = require('../models/Ad');


async function main() {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('mongoDB connected')

        await User.init();
        await Merchant.init();
        await Transaction.init();
        await Ad.init();

        console.log(' collections & indexes created successfully');
        process.exit(0);

    } catch (error) {
        console.error('migration Error:', error);
        process(1);
    }

}

main()
