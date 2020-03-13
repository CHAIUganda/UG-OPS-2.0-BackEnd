// FILENAME : Leave.js

const mongoose = require('mongoose');

const LeaveSchema = mongoose.Schema({
  startDate: {
    // datetime format new Date("2016-05-22T10:05:44")
    type: Date,
    required: true
    // default: Date.now()
  },
  endDate: {
    // datetime formatnew Date("2016-05-22T10:05:44")
    type: Date,
    required: true
  },
  type: {
    // STUDY, ANNUAL ..... HOME
    type: String,
    required: true
  },
  staff: {
    email: {
      type: String,
      required: true
    },
    fName: {
      type: String,
      required: true
    },
    lName: {
      type: String,
      required: true
    }
  },
  supervisorEmail: {
    type: String,
    required: true
  },
  status: {
    // can be planned, pending, cancelled, rejected approved taken nottaken
    type: String,
    required: true
  },
  comment: {
    // Comments/Description   optional on application
    type: String,
    required: false
  },
  program: {
    // program
    type: String,
    required: true
  },

  rejectionReason: {
    // optional reason why supervisor o countyDirector rejeccted
    type: String,
    required: false
  },
  modificationDetails: {
    isModified: {
      // To track is leave has been modified
      type: Boolean,
      default: false
    },
    modLeaves: [
      {
        StartDate: Date,
        endDate: Date,
        comment: String
      }
    ]
  }
});

// export model leave with LeaveSchema
module.exports = mongoose.model('leave', LeaveSchema);
