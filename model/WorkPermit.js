// FILENAME : User.js

const mongoose = require('mongoose');

const WorkPermitSchema = mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  workPermitStartDate: {
    type: Date,
    required: false,
  },
  workPermitEndDate: {
    type: Date,
    required: false,
  },
  workPermitStatus: {
    type: String,
    required: false,
  },
  wpDismiss: {
    type: Boolean,
    default: false,
  },
  wpSnooze: {
    type: Boolean,
    default: false,
  },
  snoozeDate: {
    type: Date,
    required: false,
  },
});

// export model workPermit with WorkPermitSchema
module.exports = mongoose.model('workPermit', WorkPermitSchema);
