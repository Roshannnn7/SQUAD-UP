const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/squadup';

  const tryConnect = async (uri, label) => {
    try {
      const masked = uri.replace(/:\/\/.*@/, '://<REDACTED>@');
      console.log(`Attempting to connect to ${label} MongoDB at: ${masked}`);

      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`${label} MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.error(`${label} MongoDB connection error:`, err.message || err);
      return err;
    }
  };

  // Prefer Atlas if provided
  if (atlasUri) {
    const result = await tryConnect(atlasUri, 'Atlas');
    if (result === true) return;

    // Inspect error for common Atlas causes
    const errMsg = typeof result === 'object' ? result.message || String(result) : String(result);
    if (errMsg.toLowerCase().includes('whitelist') || errMsg.toLowerCase().includes('ip') || errMsg.toLowerCase().includes('serverselection')) {
      console.warn('Atlas connection failed — attempting to connect to local MongoDB for development fallback.');
      const localResult = await tryConnect(localUri, 'Local');
      if (localResult === true) return;

      console.error('Both Atlas and Local MongoDB connections failed. The server will keep running but database functionality will be unavailable.');
      console.error('Atlas error:', errMsg);
      console.error('Local error:', typeof localResult === 'object' ? localResult.message : localResult);
      return;
    }

    // If Atlas failure was not a whitelist/network issue, rethrow
    console.error('Atlas connection failed with unexpected error. See message above.');
    return;
  }

  // No atlas URI provided, try local
  const localResult = await tryConnect(localUri, 'Local');
  if (localResult === true) return;

  console.error('Local MongoDB connection failed. Please install/start MongoDB or provide a valid MONGODB_URI.');
};

module.exports = connectDB;
