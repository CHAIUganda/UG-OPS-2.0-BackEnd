// FILENAME : Objective.js

const mongoose = require('mongoose');

const ObjectiveSchema = mongoose.Schema({
  objectiveCode: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  programId: {
    // operations  Vaccines etc
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

// export model Objective with ObjectiveSchema
module.exports = mongoose.model('Objective', ObjectiveSchema);
