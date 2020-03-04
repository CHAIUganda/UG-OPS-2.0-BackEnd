// FILENAME : Program.js

const mongoose = require('mongoose');

const ProgramSchema = mongoose.Schema({
  name: {
    // Name of the Program
    type: String,
    required: true
    // default: Date.now()
  },
  programManagerEmail: {
    type: String,
    required: true
  },
  programManagerDetails: {
    fName: {
      type: String,
      required: true
    },
    lName: {
      type: String,
      required: true
    }
  }
});

// export model Program with ProgramSchema
module.exports = mongoose.model('Program', ProgramSchema);
