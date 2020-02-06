// FILENAME : token.js

const mongoose = require('mongoose');
// When a user signs up, we’re going to create a verification token within Mongo.
// We need a new model to handle our verification tokens.

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200 //  TTL(self delete after). values are in seconds
    // strings need timeunits i.e. "2 days", "10h", "7d"
  }
});

// export model token with tokenSchema
module.exports = mongoose.model('token', tokenSchema);
