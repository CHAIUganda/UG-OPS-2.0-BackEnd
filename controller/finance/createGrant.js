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
    status,
  } = req.body;
  let { programId } = req.body;

  try {
    const grant = await Grant.findOne({
      gId,
    });
    if (grant) {
      return res.status(400).json({
        message: 'This Grant already exists in the system',
      });
    }
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
    const granttoSave = new Grant({
      gId,
      status,
      programId,
    });

    await granttoSave.save();

    res.status(201).json({
      message: 'Grant Created Successfully.',
      _id: granttoSave._id,
      gId,
      programId,
      status,
      program: Grantprogram,
      programShortForm: GrantprogramShortForm,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Grant',
    });
  }
};

module.exports = createGrant;
