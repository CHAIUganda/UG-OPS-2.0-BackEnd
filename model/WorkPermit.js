// FILENAME : User.js

const mongoose = require('mongoose');

const WorkPermitSchema = mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  workPermitStartDate: {
    type: Date,
    required: true
  },
  workPermitEndDate: {
    type: Date,
    required: true
  },
  workPermitType: {
    type: String,
    required: true
  },
  workPermitStatus: {
    type: String,
    required: true
  }
});

// export model workPermit with WorkPermitSchema
module.exports = mongoose.model('workPermit', WorkPermitSchema);
