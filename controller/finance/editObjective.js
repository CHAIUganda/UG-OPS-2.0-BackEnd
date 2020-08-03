const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Objective = require('../../model/Objective');
const Program = require('../../model/Program');

const editObjective = async (req, res) => {
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
  let { objectiveCode, status, programId } = req.body;

  try {
    const objective = await Objective.findOne({
      _id: id,
    });
    if (!objective) {
      return res.status(400).json({
        message: 'This Objective does not exist in the system',
      });
    }

    if (objectiveCode == null) {
      objectiveCode = objective.objectiveCode;
    }
    if (status == null) {
      status = objective.status;
    }
    if (programId == null) {
      programId = objective.programId;
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

    // modify Objective
    await Objective.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          objectiveCode,
          status,
          programId,
        },
      }
    );

    res.status(200).json({
      message: 'Objective modified successfully',
      _id: objective._id,
      objectiveCode,
      status,
      programId,
      program: objectiveProgram,
      programShortForm: objectiveProgramShortForm,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying Objective',
    });
  }
};

module.exports = editObjective;
