const debug = require('debug')('server');
const bcrypt = require('bcryptjs');
const User = require('../../model/User');
const Token = require('../../model/Token');

// Get LoggedIn User
const reset = async (req, res) => {
  try {
    // Find a matching token
    const token = await Token.findOne({ token: req.header('token') });
    if (!token) {
      return res
        .status(400)
        .json({ message: 'Password reset token is invalid or has expired.' });
    }

    // If we found a token, find a matching user using token userid and supplied email
    const user = await User.findOne({
      _id: token._userId,
      email: req.body.email
    });

    const userClone = user;
    if (!user) {
      return res.status(400).json({ message: 'token user Not-Found' });
    }

    // Verify and save the user
    userClone.isPwdReset = true;
    const salt = await bcrypt.genSalt(10);
    userClone.password = await bcrypt.hash(req.body.password, salt);
    userClone.save((error) => {
      if (error) {
        return res.status(500).send({ message: error.message });
      }
      // delete token after usage
      token.remove();
      res.status(200).json({
        message: 'The account password has been set. Please log in.'
      });
    });
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in reseting user password' });
  }
};
module.exports = reset;
