const { validationResult } = require('express-validator/check');
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
  } = req.body;

  let {
    hr,
    supervisor,
    admin,
    programId,
    countryDirector,
    deputyCountryDirector,
    procurementAdmin,
    financeAdmin,
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

  if (!financeAdmin === true) {
    financeAdmin = false;
  } else {
    const financeAdminrole = await User.findOne({
      'roles.financeAdmin': true,
    });

    if (financeAdminrole) {
      return res.status(400).json({
        message: `${financeAdminrole.fName} ${financeAdminrole.lName} Already has the Finance Admin role on the system. First edit that user removing the role. `,
      });
    }
  }

  if (!procurementAdmin === true) {
    procurementAdmin = false;
  } else {
    const procurementAdminrole = await User.findOne({
      'roles.procurementAdmin': true,
    });

    if (procurementAdminrole) {
      return res.status(400).json({
        message: `${procurementAdminrole.fName} ${procurementAdminrole.lName} Already has the Procurement Admin role on the system. First edit that user removing the role. `,
      });
    }
  }

  if (!deputyCountryDirector === true) {
    deputyCountryDirector = false;
  } else {
    const deputyCountryDirectorrole = await User.findOne({
      'roles.deputyCountryDirector': true,
    });

    if (deputyCountryDirectorrole) {
      return res.status(400).json({
        message: `${deputyCountryDirectorrole.fName} ${deputyCountryDirectorrole.lName} Already has the Deputy Country Director  role on the system. First edit that user removing the role. `,
      });
    }
  }

  if (!hr === true) {
    hr = false;
  } else {
    const hrrole = await User.findOne({
      'roles.hr': true,
    });

    if (hrrole) {
      return res.status(400).json({
        message: `${hrrole.fName} ${hrrole.lName} Already has the HR role on the system. First edit that user removing the role. `,
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
        message: `${cd.fName} ${cd.lName} Already has the Country Director role on the system. First edit that user removing the role. `,
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
        deputyCountryDirector,
        procurementAdmin,
        financeAdmin,
      },
      title,
      birthDate,
      programId,
      oNames,
      email,
      type,
      level,
      team,
      annualLeaveBF,
      bankAccounts,
      nssfNumber,
      tinNumber,
    });

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
