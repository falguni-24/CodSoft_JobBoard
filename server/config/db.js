const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobconnect';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.warn(
      `[Database Tip] Ensure MongoDB is running locally (e.g. 'net start MongoDB' or 'mongod') or set MONGODB_URI in server/.env with your MongoDB Atlas connection string.`
    );
    // Don't kill process immediately in dev so health checks and logs can be reviewed
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
