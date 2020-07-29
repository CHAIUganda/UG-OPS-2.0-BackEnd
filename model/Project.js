// FILENAME : Project.js

const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  pId: {
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
  objectives: [mongoose.Schema.Types.ObjectId],
});

// export model Project with ProjectSchema
module.exports = mongoose.model('Project', ProjectSchema);
