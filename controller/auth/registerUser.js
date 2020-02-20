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
    // Annual leave brought forward and others leaves taken are 0 when staff  is created.
    // to be updated when staff leave is approved
    const annualLeaveBF = 0;
    const unPaidLeaveTaken = 0;
    const homeLeaveTaken = 0;
    const annualLeaveTaken = 0;
    const maternityLeaveTaken = 0;
    const paternityLeaveTaken = 0;
    const sickLeaveTaken = 0;
    const studyLeaveTaken = 0;

    const contactStatus = 'ACTIVE';
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
        unPaidLeaveTaken,
        homeLeaveTaken,
        annualLeaveTaken,
        maternityLeaveTaken,
        paternityLeaveTaken,
        sickLeaveTaken,
        studyLeaveTaken
      }
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // create user contract
    const contract = new Contract({
      _userId: user._id,
      contractStartDate,
      contractEndDate,
      contractType,
      contactStatus
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
