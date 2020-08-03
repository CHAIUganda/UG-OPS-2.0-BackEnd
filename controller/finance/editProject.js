const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Project = require('../../model/Project');
const Program = require('../../model/Program');

const editProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  const { id } = req.body;

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  let { pId, status, programId } = req.body;
  try {
    const project = await Project.findOne({
      _id: id,
    });
    if (!project) {
      return res.status(400).json({
        message: 'This Project does not exist in the system',
      });
    }

    if (pId == null) {
      pId = project.pId;
    }
    if (status == null) {
      status = project.status;
    }
    if (programId == null) {
      programId = project.programId;
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

    // modify Project
    await Project.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          pId,
          status,
          programId,
        },
      }
    );

    res.status(200).json({
      message: 'Project modified successfully',
      _id: project._id,
      pId,
      status,
      programId,
      program: projectProgram,
      programShortForm: projectProgramShortForm,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying Project',
    });
  }
};

module.exports = editProject;
