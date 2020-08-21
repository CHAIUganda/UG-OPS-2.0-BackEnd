const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const codesToString = require('../../helpers/codesToString');
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

    const objectiveCodes = [];
    const alreadyExistingCodes = [];
    const addedCodes = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const objective = await Objective.findOne({
          objectiveCode: arr[controller],
        });
        if (objective) {
          alreadyExistingCodes.push(arr[controller]);
          recurseProcessLeave(controller + 1, arr);
        } else {
          const objectivetoSave = new Objective({
            objectiveCode: arr[controller],
            status,
            programId,
          });

          await objectivetoSave.save();
          addedCodes.push(arr[controller]);
          const objectiveRemade = {
            _id: objectivetoSave._id,
            pId: arr[controller],
            status,
            programId,
            program: objectiveProgram,
            programShortForm: objectiveProgramShortForm,
          };

          objectiveCodes.push(objectiveRemade);
          recurseProcessLeave(controller + 1, arr);
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (alreadyExistingCodes.length > 0) {
          // prettier-ignore
          if (addedCodes.length > 0) {
            res.status(400).json({
              // prettier-ignore
              message: `${await codesToString(0, addedCodes)} added successfully But ${await codesToString(0, alreadyExistingCodes)} not added because already existed`,
              objectiveCodes,
            });
          } else {
            res.status(400).json({
              // prettier-ignore
              message: `${await codesToString(0, alreadyExistingCodes)} not added because already existed`,
              objectiveCodes,
            });
          }
        } else {
          res.status(201).json({
            message: 'Created Successfully.',
            objectiveCodes,
          });
        }
      }
    };
    await recurseProcessLeave(0, objectiveCode);
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Objective',
    });
  }
};

module.exports = createObjective;
