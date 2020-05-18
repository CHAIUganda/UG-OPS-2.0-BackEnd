const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Program = require('../../model/Program');
const User = require('../../model/User');

const createProgram = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    name,
    shortForm,
    programManagerId,
    operationsLeadId
  } = req.body;

  try {
    const user = await User.findOne({
      _id: programManagerId,
    });
    if (!user) {
      return res.status(400).json({
        message: 'Program Manager does not Exist',
      });
    }

    const userOppsLd = await User.findOne({
      _id: operationsLeadId,
    });
    if (!userOppsLd) {
      return res.status(400).json({
        message: 'Operations Lead does not Exist',
      });
    }
    const program = await Program.findOne({
      name,
    });
    if (program) {
      return res.status(400).json({
        message: 'This Program already exists',
      });
    }

    const programtoSave = new Program({
      name,
      shortForm,
      programManagerId: user._id,
      operationsLeadId: userOppsLd._id,
    });

    await programtoSave.save();
    const programManagerDetails = {
      fName: user.fName,
      lName: user.lName,
    };

    const operationsLeadDetails = {
      fName: userOppsLd.fName,
      lName: userOppsLd.lName,
    };

    res.status(201).json({
      message: 'Program Created Successfully.',
      _id: programtoSave._id,
      name,
      shortForm,
      programManagerId,
      programManagerDetails,
      operationsLeadDetails,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Program',
    });
  }
};

module.exports = createProgram;
