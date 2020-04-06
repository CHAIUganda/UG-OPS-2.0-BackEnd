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
  title: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  programId: {
    // operations  Vaccines etc
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  supervisorEmail: {
    type: String,
    required: true
  },
  type: {
    // national TCN expat
    type: String,
    required: true
  },
  level: {
    // 1-6
    type: String,
    required: false
  },
  team: {
    // countryOffice global
    type: String,
    required: true
  },
  annualLeaveBF: {
    type: Number,
    required: true
  },
  leaves: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  bankAccounts: [
    {
      bankName: String,
      accountNumber: String,
      Currency: String,
      status: String
    }
  ],
  nssfNumber: {
    type: String,
    required: true
  },
  tinNumber: {
    type: String,
    required: true
  },
  roles: {
    admin: {
      // To track is user is admin
      type: Boolean,
      default: false
    },
    ordinary: {
      type: Boolean,
      default: true
    },
    hr: {
      type: Boolean,
      default: false
    },
    supervisor: {
      type: Boolean,
      default: false
    },
    countryDirector: {
      // To track is user is CD
      type: Boolean,
      default: false
    }
  }
});

// export model user with UserSchema
module.exports = mongoose.model('user', UserSchema);
