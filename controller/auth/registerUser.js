const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('debug')('server');
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
        expiresIn: 10000 //  values are in seconds, strings need timeunits i.e. "2 days", "10h","7d"
      },
      (error, token) => {
        if (error) throw error;
        // create user verication token in token schema
        const usertokenDoc = new Token({ _userId: user._id, token });
        // Save the verification token
        usertokenDoc.save((err) => {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          // Send the email
          const from = 'no-reply@clintonhealthaccess.org';
          const to = user.email;
          const subject = 'Account Verification Token';

          // prettier-ignore
          const text = `${'Hello,\n\n'
            + 'Please verify your account by clicking the link: \nhttp://'}${
            req.headers.host
          }/auth/confirmation/${token}\n`;

          Mailer(from, to, subject, text, res);
        });

        // res.status(200).json({
        //   token
        // });
      }
    );
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = registerUser;
