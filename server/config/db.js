const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';

  try {
    // Attempt connecting to the configured URI first
    console.log(`Connecting to MongoDB at: ${uri} ...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no local server
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${primaryErr.message}).`);
    console.log('🔄 Initializing embedded in-memory MongoDB fallback for instant zero-config usage...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'staffsync',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ MongoDB Connected (Embedded In-Memory Engine): ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB:`, memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};

module.exports = { connectDB, disconnectDB };
