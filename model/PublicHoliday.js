// FILENAME : Leave.js

const mongoose = require('mongoose');

const PublicHolidaySchema = mongoose.Schema({
  name: {
    // Name of the public holiday
    type: String,
    required: true
    // default: Date.now()
  },
  date: {
    // datetime format ("26/12")
    type: String,
    required: true
  }
});

// export model PublicHoliday with PublicHoliday
module.exports = mongoose.model('PublicHolday', PublicHolidaySchema);
