const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const debug = require('debug')('server');
const log4js = require('log4js');
const mongoose = require('mongoose');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const WorkPermit = require('../../model/WorkPermit');
const Program = require('../../model/Program');
const errorToString = require('../../helpers/errorToString');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  const logger = log4js.getLogger('Timed');
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const {
    fName,
    lName,
    contractStartDate,
    contractEndDate,
    birthDate,
    contractType,
    gender,
    title,
    type,
    level,
    team,
    supervisorEmail,
    oNames,
    email,
    password,
  } = req.body;

  let {
    hr,
    supervisor,
    admin,
    programId,
    countryDirector,
    bankAccounts,
    nssfNumber,
    tinNumber,
    workPermitStartDate,
    workPermitEndDate,
  } = req.body;

  if (bankAccounts == null) {
    bankAccounts = [];
  }
  if (nssfNumber == null) {
    nssfNumber = '';
  }
  if (tinNumber == null) {
    tinNumber = '';
  }
  if (workPermitStartDate == null) {
    workPermitStartDate = undefined;
  }
  if (workPermitEndDate == null) {
    workPermitEndDate = undefined;
  }
  if (!admin === true) {
    admin = false;
  }
  if (!hr === true) {
    hr = false;
  } else {
    const hrrole = await User.findOne({
      'roles.hr': true,
    });

    if (hrrole) {
      return res.status(400).json({
        message: 'A User with an HR Role Already Exists',
      });
    }
  }
  if (!supervisor === true) {
    supervisor = false;
  }
  if (!countryDirector === true) {
    countryDirector = false;
  } else {
    const cd = await User.findOne({
      'roles.countryDirector': true,
    });

    if (cd) {
      return res.status(400).json({
        message: 'A User with a Country Director Role Already Exists',
      });
    }
  }
  try {
    // Annual leave brought forward is 0 when staff  is created.
    // to be updated when staff leave is approved
    const annualLeaveBF = 0;

    const contractStatus = 'ACTIVE';
    const workPermitStatus = 'ACTIVE';
    let user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(400).json({
        message: 'User Already Exists',
      });
    }

    if (mongoose.Types.ObjectId.isValid(programId)) {
      const program = await Program.findOne({
        _id: programId,
      });
      if (!program) {
        programId = null;
      }
    } else {
      programId = null;
    }

    // Create user
    user = new User({
      fName,
      lName,
      supervisorEmail,
      gender,
      roles: {
        admin,
        hr,
        supervisor,
        countryDirector,
      },
      title,
      birthDate,
      programId,
      oNames,
      email,
      type,
      level,
      team,
      password,
      annualLeaveBF,
      bankAccounts,
      nssfNumber,
      tinNumber,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // create user contract
    const contract = new Contract({
      _userId: user._id,
      contractStartDate,
      contractEndDate,
      contractType,
      contractStatus,
    });

    await contract.save();
    await user.save();
    if (user.type === 'expat' || user.type === 'tcn') {
      // create user WP
      const workpermit = new WorkPermit({
        _userId: user._id,
        workPermitStartDate,
        workPermitEndDate,
        workPermitStatus,
      });

      await workpermit.save();
    }
    res.status(201).json({ message: 'User Created successfully' });
  } catch (err) {
    debug(err.message);
    logger.error(`Error saving ${err.message}`);
    console.log(`Error saving ${err.message}`);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
