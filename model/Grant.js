// FILENAME : Grant.js

const mongoose = require('mongoose');

const GrantSchema = mongoose.Schema({
  gId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  programId: {
    // operations  Vaccines etc
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

// export model Grant with GrantSchema
module.exports = mongoose.model('Grant', GrantSchema);
