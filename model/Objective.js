// FILENAME : Objective.js

const mongoose = require('mongoose');

const ObjectiveSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  objectiveCode: {
    type: String,
    required: false,
  },
  desciption: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  projectId: {
    // project the objective belogs to
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

// export model Objective with ObjectiveSchema
module.exports = mongoose.model('Objective', ObjectiveSchema);
