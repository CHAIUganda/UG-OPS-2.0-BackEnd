// FILENAME : Program.js

const mongoose = require('mongoose');

const ProgramSchema = mongoose.Schema({
  name: {
    // Name of the Program
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
  shortForm: {
    // Name of the Program
    type: String,
    required: true,
  },
  programManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  operationsLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

// export model Program with ProgramSchema
module.exports = mongoose.model('Program', ProgramSchema);
