const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const debug = require('debug')('server');
const jwt = require('jsonwebtoken');
const Mailer = require('../../helpers/Mailer');
const User = require('../../model/User');
const Token = require('../../model/Token');

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

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 10000 //  values are in seconds, strings need timeunits i.e. "2 days", "10h","7d"
      },
      (error, token) => {
        if (error) throw error;
        const usertokenDoc = new Token({ _userId: user._id, token });
        // Save the verification token
        usertokenDoc.save((err) => {
          if (err) {
            return res.status(500).send({ mesg: err.message });
          }
          // Send the email
          const from = 'no-reply@clintonhealthaccess.org';
          const to = user.email;
          const subject = 'UG-OPPS 2.0 Account Password ReSetting';
          // to be put in .env file
          const uiHost = 'localhost:3000/#';
          // prettier-ignore
          const text = `${'Hello,\n\n'
       + 'Please reset your account password by clicking the link: \nhttp://'}${
            uiHost
          }/auth/ResetPassword/${user.email}/${token}\n`;

          Mailer(from, to, subject, text, res);
        });
      }
    );
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
