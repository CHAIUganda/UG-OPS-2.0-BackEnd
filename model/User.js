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
  program: {
    // operations  Vaccines etc
    type: String,
    required: true
  },
  supervisorEmail: {
    type: String,
    required: true
  },
  type: {
    // local TCN expat
    type: String,
    required: true
  },
  level: {
    // 1-6
    type: String,
    required: true
  },
  team: {
    // countryOffice global
    type: String,
    required: true
  },
  leaveDetails: {
    annualLeaveBF: {
      type: Number,
      required: true
    },
    homeLeaveTaken: {
      type: Number,
      required: true
    },
    unPaidLeaveTaken: {
      type: Number,
      required: true
    },
    annualLeaveTaken: {
      type: Number,
      required: true
    },
    maternityLeaveTaken: {
      type: Number,
      required: true
    },
    paternityLeaveTaken: {
      type: Number,
      required: true
    },
    sickLeaveTaken: {
      type: Number,
      required: true
    },
    studyLeaveTaken: {
      type: Number,
      required: true
    }
  },
  leaves: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now()
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
    }
  }
});

// export model user with UserSchema
module.exports = mongoose.model('user', UserSchema);
