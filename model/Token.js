// FILENAME : token.js

const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 432000, // valid for 5 days TTL(self delete after). values are in seconds
    // strings need timeunits i.e. "2 days", "10h", "7d"
  },
});

// export model token with tokenSchema
module.exports = mongoose.model('token', tokenSchema);
