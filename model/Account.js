// FILENAME : Account.js

const mongoose = require('mongoose');

const AccountSchema = mongoose.Schema({
  financialGrouping: {
    type: String,
    required: false,
  },
  accountCode: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  useDecsription: {
    type: String,
    required: false,
  },
  includeOn: {
    costedWorkPlans: {
      type: Boolean,
      default: true,
    },
    quickBooks: {
      type: Boolean,
      default: true,
    },
  },
  usedInCountry: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    required: false,
  },
});

// export model Account with AccountSchema
module.exports = mongoose.model('Account', AccountSchema);
