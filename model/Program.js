// FILENAME : Program.js

const mongoose = require('mongoose');

const ProgramSchema = mongoose.Schema({
  name: {
    // Name of the Program
    type: String,
    required: true
    // default: Date.now()
  },
  programManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// export model Program with ProgramSchema
module.exports = mongoose.model('Program', ProgramSchema);
