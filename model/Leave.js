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
  daysTaken: {
    // data type is number
    type: Number,
    required: true
  },
  publicHolidays: [Date],
  type: {
    // STUDY, ANNUAL ..... HOME
    type: String,
    required: true
  },
  staffEmail: {
    type: String,
    required: true
  },
  status: {
    // can be planned, pending, cancelled, rejected approved taken nottaken
    type: String,
    required: true
  },
  comment: {
    // Comments/Description   optional
    type: String,
    required: false
  },
  progress: {
    // supervisor countyDirector
    type: String,
    required: true
  }
});

// export model leave with LeaveSchema
module.exports = mongoose.model('leave', LeaveSchema);
