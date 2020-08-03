// FILENAME : Project.js

const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
  pId: {
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

// export model Project with ProjectSchema
module.exports = mongoose.model('Project', ProjectSchema);
