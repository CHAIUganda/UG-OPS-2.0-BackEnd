// FILENAME : Travel.js

const mongoose = require('mongoose');

const TravelSchema = mongoose.Schema({
  employeeName: {
    type: String,
    required: false,
  },
  employeeEmail: {
    type: String,
    required: false,
  },
  travelLocation: {
    type: String,
    required: false,
  },
  typeOTrip: {
    type: String,
    required: true,
  },
  dates: {
    // datetime format  2020-05-18
    travelDate: Date,
    returnDate: Date,
  },
  employeeContact: {
    type: String,
    required: false,
  },
});

// export model travel with TravelSchema
module.exports = mongoose.model('travel', TravelSchema);
