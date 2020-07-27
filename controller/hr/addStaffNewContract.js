const { validationResult } = require('express-validator');
const debug = require('debug')('server');
const log4js = require('log4js');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const errorToString = require('../../helpers/errorToString');

const addStaffNewContract = async (req, res) => {
  const errors = validationResult(req);
  const logger = log4js.getLogger('Timed');
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const {
    contractStartDate,
    contractEndDate,
    contractType,
    staffEmail,
  } = req.body;

  let contractStatus = 'ACTIVE';

  try {
    const user = await User.findOne({
      email: staffEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
      });
    }

    const activeContract = await Contract.findOne({
      _userId: user._id,
      contractStatus: 'ACTIVE',
    });
    if (activeContract) {
      const PendingContract = await Contract.findOne({
        _userId: user._id,
        contractStatus: 'Pending',
      });

      if (PendingContract) {
        return res.status(400).json({
          message: `${user.fName} ${user.lName} Already has a Pending Contract about to start`,
        });
      }
      contractStatus = 'Pending';
    }

    // create user contract
    const contract = new Contract({
      _userId: user._id,
      contractStartDate,
      contractEndDate,
      contractType,
      contractStatus,
    });

    await contract.save();
    res.status(201).json({
      message: `${user.fName} ${user.lName}'s New Contract Added successfully`,
    });
  } catch (err) {
    debug(err.message);
    logger.error(`Error saving new Contract ${err.message}`);
    console.log(`Error saving new contract ${err.message}`);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = addStaffNewContract;
