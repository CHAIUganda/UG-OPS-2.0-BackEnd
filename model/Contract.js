// FILENAME : User.js

const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  contractStartDate: {
    type: Date,
    required: true,
  },
  contractEndDate: {
    type: Date,
    required: true,
  },
  contractType: {
    type: String,
    required: true,
  },
  contractStatus: {
    type: String,
    required: true,
  },
  dismiss: {
    type: Boolean,
    default: false,
  },
  snooze: {
    type: Boolean,
    default: false,
  },
});

// export model contract with ContractSchema
module.exports = mongoose.model('contract', ContractSchema);
