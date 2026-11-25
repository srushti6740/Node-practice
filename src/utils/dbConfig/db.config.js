const mongoose = require('mongoose');

/** Connects to MongoDB using DB_URL (and optional DB_NAME). Returns a promise. */
const connection = () =>
   mongoose.connect(process.env.DB_URL, {
      autoCreate: true,
      ...(process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {})
   });

module.exports = connection;
