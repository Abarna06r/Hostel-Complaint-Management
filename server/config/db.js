const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_complaints?directConnection=true';
  try {
    const conn = await mongoose.connect(uri, {
      directConnection: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, DB -> ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Retry once after 2 seconds before exiting
    setTimeout(async () => {
      try {
        const conn = await mongoose.connect(uri, {
          directConnection: true,
          serverSelectionTimeoutMS: 15000,
        });
        console.log(`[MongoDB Connected on retry]: Host -> ${conn.connection.host}, DB -> ${conn.connection.name}`);
      } catch (err) {
        console.error(`[MongoDB Final Retry Failed]: ${err.message}`);
      }
    }, 2000);
  }
};

module.exports = connectDB;
