// FILENAME : Leave.js

const mongoose = require('mongoose');

const LeaveSchema = mongoose.Schema({
  startDate: {
    // datetime format new Date("2016-05-22T10:05:44")
    type: Date,
    required: true,
    // default: Date.now()
  },
  endDate: {
    // datetime formatnew Date("2016-05-22T10:05:44")
    type: Date,
    required: true,
  },
  type: {
    // STUDY, ANNUAL ..... HOME
    type: String,
    required: true,
  },
  staff: {
    email: {
      type: String,
      required: true,
    },
    fName: {
      type: String,
      required: true,
    },
    lName: {
      type: String,
      required: true,
    },
  },
  supervisorEmail: {
    type: String,
    required: true,
  },
  status: {
    // can be planned, pending, cancelled, rejected approved taken nottaken
    type: String,
    required: true,
    text: true,
  },
  comment: {
    // Comments/Description   optional on application
    type: String,
    required: false,
  },
  programId: {
    // operations  Vaccines etc
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  rejectionReason: {
    // optional reason why supervisor o countyDirector rejeccted
    type: String,
    required: false,
  },
  isModfied: {
    // To track is leave has been modified
    type: Boolean,
    default: false,
  },
  takenPending: {
    startDate: {
      // datetime format new Date("2016-05-22T10:05:44")
      type: Date,
      required: false,
      // default: Date.now()
    },
    endDate: {
      // datetime formatnew Date("2016-05-22T10:05:44")
      type: Date,
      required: false,
    },
    comment: {
      // Comments/Description   optional on application
      type: String,
      required: false,
    },
    type: {
      // Comments/Description   optional on application
      type: String,
      required: false,
    },
    rejectionReason: {
      // optional reason why supervisor o countyDirector rejeccted
      type: String,
      required: false,
    },
    status: {
      // optional reason why supervisor o countyDirector rejeccted
      type: String,
      required: false,
    },
  },
  modificationDetails: {
    modLeaves: [
      {
        startDate: Date,
        endDate: Date,
        comment: String,
        typ: String,
      },
    ],
  },
});

// export model leave with LeaveSchema
module.exports = mongoose.model('leave', LeaveSchema);
