const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Objective = require('../../model/Objective');
const Program = require('../../model/Program');

const createObjective = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    objectiveCode,
  } = req.body;
  const status = 'Active';

  let { programId } = req.body;

  try {
    const objective = await Objective.findOne({
      objectiveCode,
    });
    if (objective) {
      return res.status(400).json({
        message: 'This Objective already exists in the system',
      });
    }
    let objectiveProgram;
    let objectiveProgramShortForm;
    if (mongoose.Types.ObjectId.isValid(programId)) {
      const program = await Program.findOne({
        _id: programId,
      });
      if (!program) {
        programId = null;
        objectiveProgram = null;
        objectiveProgramShortForm = null;
      } else {
        objectiveProgram = program.name;
        objectiveProgramShortForm = program.shortForm;
      }
    } else {
      programId = null;
      objectiveProgram = null;
      objectiveProgramShortForm = null;
    }

    const objectivetoSave = new Objective({
      objectiveCode,
      programId,
      status,
    });

    await objectivetoSave.save();

    res.status(201).json({
      message: 'Objective Created Successfully.',
      _id: objectivetoSave._id,
      objectiveCode,
      programId,
      status,
      program: objectiveProgram,
      programShortForm: objectiveProgramShortForm,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Objective',
    });
  }
};

module.exports = createObjective;
