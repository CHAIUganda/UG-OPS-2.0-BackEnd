// FILENAME : User.js

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  fName: {
    type: String,
    required: true
  },
  lName: {
    type: String,
    required: true
  },
  isPwdReset: {
    // To track verification
    type: Boolean,
    default: false
  },
  oNames: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    // HR Finance Vaccines etc
    type: String,
    required: true
  },
  programmeManagerEmail: {
    type: String,
    required: true
  },
  contractStartDate: {
    type: Date,
    required: true
  },
  contractEndDate: {
    type: Date,
    required: true
  },
  contractType: {
    type: String,
    required: true
  },
  internationalStaff: {
    type: String,
    required: true
  },
  leaveDetails: {
    annualLeaveBF: {
      type: Number,
      required: true
    },
    unPaidLeaveTaken: {
      type: Number,
      required: true
    }
  },
  leaves: [],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model('user', UserSchema);
