const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Program = require('../../model/Program');
const User = require('../../model/User');

const editProgram = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    id,
    name,
    shortForm
  } = req.body;

  let { programManagerId, operationsLeadId, status } = req.body;

  try {
    const program = await Program.findOne({
      _id: id,
    });
    if (!program) {
      return res.status(400).json({
        message: 'This program doesnot exist',
      });
    }
    if (programManagerId == null) {
      programManagerId = program.programManagerId;
    }

    const user = await User.findOne({
      _id: programManagerId,
    });
    if (!user) {
      return res.status(400).json({
        message: 'Program Manager does not Exist',
      });
    }

    if (operationsLeadId == null) {
      operationsLeadId = program.operationsLeadId;
    }

    const userOppsLd = await User.findOne({
      _id: operationsLeadId,
    });
    if (!userOppsLd) {
      return res.status(400).json({
        message: 'Operations Lead does not Exist',
      });
    }
    if (status == null) {
      if (program.status == null) {
        status = 'Active';
      } else {
        status = program.status;
      }
    }

    // modify program
    await Program.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          name,
          shortForm,
          status,
          programManagerId: user._id,
          operationsLeadId: userOppsLd._id,
        },
      }
    );

    const programManagerDetails = {
      fName: user.fName,
      lName: user.lName,
    };

    const operationsLeadDetails = {
      fName: userOppsLd.fName,
      lName: userOppsLd.lName,
    };

    res.status(200).json({
      message: 'Program modified successfully',
      _id: program._id,
      name,
      shortForm,
      status,
      programManagerId,
      operationsLeadId,
      programManagerDetails,
      operationsLeadDetails,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying program',
    });
  }
};

module.exports = editProgram;
