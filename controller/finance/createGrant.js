const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Grant = require('../../model/Grant');
const Program = require('../../model/Program');

const createGrant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    gId,
  } = req.body;
  let { programId } = req.body;
  const status = 'Active';
  try {
    let Grantprogram;
    let GrantprogramShortForm;
    if (mongoose.Types.ObjectId.isValid(programId)) {
      const program = await Program.findOne({
        _id: programId,
      });
      if (!program) {
        programId = null;
        Grantprogram = null;
        GrantprogramShortForm = null;
      } else {
        Grantprogram = program.name;
        GrantprogramShortForm = program.shortForm;
      }
    } else {
      programId = null;
      Grantprogram = null;
      GrantprogramShortForm = null;
    }

    const gIds = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const grant = await Grant.findOne({
          gId: arr[controller],
        });
        if (grant) {
          recurseProcessLeave(controller + 1, arr);
        } else {
          const granttoSave = new Grant({
            gId: arr[controller],
            status,
            programId,
          });

          await granttoSave.save();

          const grantRemade = {
            _id: granttoSave._id,
            gId: arr[controller],
            status,
            programId,
            program: Grantprogram,
            programShortForm: GrantprogramShortForm,
          };

          gIds.push(grantRemade);
          recurseProcessLeave(controller + 1, arr);
        }
      } else {
        res.status(201).json({
          message: 'Created Successfully.',
          gIds,
        });
      }
    };
    await recurseProcessLeave(0, gId);
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error Creating Grant',
    });
  }
};

module.exports = createGrant;
