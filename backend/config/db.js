const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo-procure-hub';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('Database connection error:', error);
    }
}

module.exports = connectDB;