// FILENAME : Grant.js

const mongoose = require('mongoose');

const GrantSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  gId: {
    type: String,
    required: false,
  },
  desciption: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
});

// export model Grant with GrantSchema
module.exports = mongoose.model('Grant', GrantSchema);
