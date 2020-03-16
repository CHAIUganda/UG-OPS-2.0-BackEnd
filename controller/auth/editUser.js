const { validationResult } = require('express-validator/check');
const debug = require('debug')('server');
const User = require('../../model/User');
const errorToString = require('../../helpers/errorToString');

const editUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  let {
    fName,
    lName,
    bankName,
    accountNumber,
    birthDate,
    gender,
    title,
    program,
    type,
    level,
    team,
    supervisorEmail,
    oNames,
    email,
    hr,
    supervisor,
    admin,
    countryDirector
  } = req.body;

  try {
    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(400).json({
        message: 'User Doesnot Exist'
      });
    }

    // check for what has not been modified
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
    if (bankName == null) {
      bankName = user.bankName;
    }
    if (accountNumber == null) {
      accountNumber = user.accountNumber;
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
    if (program == null) {
      program = user.program;
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

    if (email == null) {
      email = user.email;
    }

    // modify program
    await User.updateOne(
      {
        email
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
            countryDirector
          },
          bankDetails: {
            bankName,
            accountNumber
          },
          title,
          birthDate,
          program,
          oNames,
          email,
          type,
          level,
          team
        }
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
