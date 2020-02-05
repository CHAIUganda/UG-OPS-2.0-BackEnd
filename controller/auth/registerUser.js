const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('debug')('server');

const User = require('../../model/User');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()
    });
  }

  const {
    fName,
    lName,
    contractStartDate,
    contractEndDate,
    contractType,
    internationalStaff,
    annualLeaveBF,
    programmeManagerEmail,
    unPaidLeaveTaken,
    oNames,
    email,
    password
  } = req.body;
  try {
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

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      'randomString',
      {
        expiresIn: 10000
      },
      (err, token) => {
        if (err) throw err;
        // debug('User has been Registered');
        res.status(200).json({
          token
        });
      }
    );
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
