// FILENAME : Vendor.js

const mongoose = require('mongoose');

const VendorSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  vendorEmail: {
    type: String,
    required: false,
  },
  vendorTin: {
    type: String,
    required: false,
  },
  exemptFromWHT: {
    type: Boolean,
    default: false,
  },
  onPrequalifiedList: {
    type: Boolean,
    default: false,
  },
  bankDetails: [
    {
      bankName: String,
      accountNumber: String,
      Currency: String,
    },
  ],
});

// export model vendor with VendorSchema
module.exports = mongoose.model('vendor', VendorSchema);
