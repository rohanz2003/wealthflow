const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const connectDB = async (retries = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (retries < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY / 1000}s... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return connectDB(retries + 1);
    }
    console.error('Failed to connect to MongoDB after retries. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
