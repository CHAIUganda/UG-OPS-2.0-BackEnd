const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const debug = require('debug')('server');
const User = require('../../model/User');
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
    contractType,
    gender,
    position,
    department,
    internationalStaff,
    programmeManagerEmail,
    oNames,
    email,
    password
  } = req.body;
  try {
    // Annual leave brought forward and unpaid leave taken are 0 when staff  is created.
    const annualLeaveBF = 0;
    const unPaidLeaveTaken = 0;

    let user = await User.findOne({
      email
    });

    if (user) {
      return res.status(400).json({
        message: 'User Already Exists'
      });
    }
    user = new User({
      fName,
      lName,
      contractStartDate,
      contractEndDate,
      contractType,
      internationalStaff,
      programmeManagerEmail,
      gender,
      position,
      department,
      oNames,
      email,
      password,
      leaveDetails: {
        annualLeaveBF,
        unPaidLeaveTaken
      }
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ message: 'User Created successfully' });
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
