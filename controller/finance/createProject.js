const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Project = require('../../model/Project');
const Program = require('../../model/Program');

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    pId,
    status,
  } = req.body;
  let { programId } = req.body;

  try {
    const project = await Project.findOne({
      pId,
    });
    if (project) {
      return res.status(400).json({
        message: 'This Project already exists in the system',
      });
    }
    let projectProgram;
    let projectProgramShortForm;
    if (mongoose.Types.ObjectId.isValid(programId)) {
      const program = await Program.findOne({
        _id: programId,
      });
      if (!program) {
        programId = null;
        projectProgram = null;
        projectProgramShortForm = null;
      } else {
        projectProgram = program.name;
        projectProgramShortForm = program.shortForm;
      }
    } else {
      programId = null;
      projectProgram = null;
      projectProgramShortForm = null;
    }

    const projecttoSave = new Project({
      pId,
      status,
      programId,
    });

    await projecttoSave.save();

    res.status(201).json({
      message: 'Project Created Successfully.',
      _id: projecttoSave._id,
      pId,
      programId,
      status,
      program: projectProgram,
      programShortForm: projectProgramShortForm,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Project',
    });
  }
};

module.exports = createProject;
