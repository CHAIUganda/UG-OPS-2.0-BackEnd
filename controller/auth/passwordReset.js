const debug = require('debug')('server');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const User = require('../../model/User');
const errorToString = require('../../helpers/errorToString');

// Get LoggedIn User
const passwordReset = async (req, res) => {
  try {
    // check input error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errorToString(errors.array())
      });
    }

    const { email, newPassword, oldPassword } = req.body;
    const user = await User.findOne({
      email
    });

    let isMatch;
    if (user) {
      isMatch = await bcrypt.compare(oldPassword, user.password);
    }

    if (!user || !isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    //  save the new user pwd
    const userClone = user;
    userClone.isPwdReset = true;
    const salt = await bcrypt.genSalt(10);
    userClone.password = await bcrypt.hash(newPassword, salt);
    userClone.save((error) => {
      if (error) {
        return res.status(500).send({ message: error.message });
      }
      // delete token after usage
      res.status(200).json({
        message: 'password has been reset.'
      });
    });
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in reseting user password' });
  }
};
module.exports = passwordReset;
