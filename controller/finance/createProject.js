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
  } = req.body;
  const status = 'Active';
  let { programId } = req.body;

  try {
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

    const pIds = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const project = await Project.findOne({
          pId: arr[controller],
        });
        if (project) {
          recurseProcessLeave(controller + 1, arr);
        } else {
          const projecttoSave = new Project({
            pId: arr[controller],
            status,
            programId,
          });

          await projecttoSave.save();

          const projectRemade = {
            _id: projecttoSave._id,
            pId: arr[controller],
            status,
            programId,
            program: projectProgram,
            programShortForm: projectProgramShortForm,
          };

          pIds.push(projectRemade);
          recurseProcessLeave(controller + 1, arr);
        }
      } else {
        res.status(201).json({
          message: 'Created Successfully.',
          pIds,
        });
      }
    };
    await recurseProcessLeave(0, pId);
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Project',
    });
  }
};

module.exports = createProject;
