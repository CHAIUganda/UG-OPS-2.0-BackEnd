const { validationResult } = require('express-validator/check');
const debug = require('debug')('server');
const mongoose = require('mongoose');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const Program = require('../../model/Program');
const errorToString = require('../../helpers/errorToString');

const editUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }
  const { contractId, email } = req.body;
  let {
    fName,
    lName,
    newEmail,
    bankAccounts,
    contractStartDate,
    contractEndDate,
    contractType,
    contractStatus,
    birthDate,
    gender,
    title,
    programId,
    type,
    level,
    team,
    supervisorEmail,
    oNames,
    hr,
    supervisor,
    admin,
    countryDirector,
  } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: 'User Doesnot Exist',
      });
    }
    const contract = await Contract.findOne({
      _id: contractId,
    });

    if (!contract) {
      return res.status(400).json({
        message: 'Contract Doesnot Exist',
      });
    }
    // check for what has not been modified
    if (admin == null) {
      admin = user.roles.admin;
    }
    if (newEmail == null) {
      newEmail = user.email;
    }
    if (admin == null) {
      admin = user.roles.admin;
    }
    if (admin == null) {
      admin = user.roles.admin;
    }
    if (admin == null) {
      admin = user.roles.admin;
    }
    if (hr == null) {
      hr = user.roles.hr;
    }
    if (supervisor == null) {
      supervisor = user.roles.supervisor;
    }
    if (countryDirector == null) {
      countryDirector = user.roles.countryDirector;
    }

    if (fName == null) {
      fName = user.fName;
    }

    if (lName == null) {
      lName = user.lName;
    }
    if (bankAccounts == null) {
      bankAccounts = user.bankAccounts;
    }
    if (birthDate == null) {
      birthDate = user.birthDate;
    }
    if (gender == null) {
      gender = user.gender;
    }
    if (title == null) {
      title = user.title;
    }
    if (programId == null) {
      programId = user.programId;
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
    if (type == null) {
      type = user.type;
    }
    if (level == null) {
      level = user.level;
    }
    if (team == null) {
      team = user.team;
    }
    if (supervisorEmail == null) {
      supervisorEmail = user.supervisorEmail;
    }
    if (oNames == null) {
      oNames = user.oNames;
    }

    if (contractStatus == null) {
      contractStatus = contract.contractStatus;
    }
    if (contractStartDate == null) {
      contractStartDate = contract.contractStartDate;
    }
    if (contractEndDate == null) {
      contractEndDate = contract.contractEndDate;
    }
    if (contractType == null) {
      contractType = contract.contractType;
    }

    // modify user
    await User.updateOne(
      {
        email,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
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
          bankAccounts,
          title,
          birthDate,
          programId,
          oNames,
          email: newEmail,
          type,
          level,
          team,
        },
      }
    );
    // update contract
    await Contract.updateOne(
      {
        _id: contractId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          contractStartDate,
          contractEndDate,
          contractType,
          contractStatus,
        },
      }
    );

    res
      .status(201)
      .json({ message: 'User details have been Modified successfully' });
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Modifying User' });
  }
};

module.exports = editUser;
