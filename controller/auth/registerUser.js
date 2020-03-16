const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const debug = require('debug')('server');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const errorToString = require('../../helpers/errorToString');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
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
    program,
    type,
    level,
    bankName,
    accountNumber,
    team,
    supervisorEmail,
    oNames,
    email,
    password
  } = req.body;

  // prettier-ignore
  let {
    hr, supervisor, admin, countryDirector
  } = req.body;

  if (!admin === true) {
    admin = false;
  }
  if (!hr === true) {
    hr = false;
  }
  if (!supervisor === true) {
    supervisor = false;
  }
  if (!countryDirector === true) {
    countryDirector = false;
  }
  try {
    // Annual leave brought forward is 0 when staff  is created.
    // to be updated when staff leave is approved
    const annualLeaveBF = 0;

    const contractStatus = 'ACTIVE';
    let user = await User.findOne({
      email
    });

    if (user) {
      return res.status(400).json({
        message: 'User Already Exists'
      });
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
        countryDirector
      },
      title,
      birthDate,
      program,
      oNames,
      email,
      type,
      level,
      bankName,
      accountNumber,
      team,
      password,
      annualLeaveBF
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // create user contract
    const contract = new Contract({
      _userId: user._id,
      contractStartDate,
      contractEndDate,
      contractType,
      contractStatus
    });
    await contract.save();
    await user.save();
    res.status(201).json({ message: 'User Created successfully' });
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
