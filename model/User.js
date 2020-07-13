// FILENAME : User.js

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
  oNames: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: false,
  },
  programId: {
    // operations  Vaccines etc
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  supervisorEmail: {
    type: String,
    required: true,
  },
  type: {
    // national tcn expat
    type: String,
    required: true,
  },
  level: {
    // 1-6
    type: String,
    required: false,
  },
  team: {
    // countryOffice global
    type: String,
    required: true,
  },
  annualLeaveBF: {
    type: Number,
    required: true,
  },
  leaves: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bankAccounts: [
    {
      bankName: String,
      accountNumber: String,
      Currency: String,
      status: String,
    },
  ],
  nssfNumber: {
    type: String,
    required: false,
  },
  tinNumber: {
    type: String,
    required: false,
  },
  roles: {
    admin: {
      // To track is user is admin
      type: Boolean,
      default: false,
    },
    ordinary: {
      type: Boolean,
      default: true,
    },
    hr: {
      type: Boolean,
      default: false,
    },
    supervisor: {
      type: Boolean,
      default: false,
    },
    countryDirector: {
      // To track is user is CD
      type: Boolean,
      default: false,
    },
    deputyCountryDirector: {
      type: Boolean,
      default: false,
    },
    procurementAdmin: {
      type: Boolean,
      default: false,
    },
    financeAdmin: {
      // To track is user is CD
      type: Boolean,
      default: false,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  notifications: [
    {
      title: String,
      message: String,
      status: String,
      createDate: Date,
      linkTo: String,
      refType: String,
      refId: mongoose.Schema.Types.ObjectId,
    },
  ],
});

// export model user with UserSchema
module.exports = mongoose.model('user', UserSchema);
