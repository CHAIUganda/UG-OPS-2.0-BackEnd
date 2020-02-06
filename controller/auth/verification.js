const debug = require('debug')('server');
const User = require('../../model/User');
const Token = require('../../model/Token');

// Get LoggedIn User
const verification = (req, res) => {
  try {
    // Find a matching token
    Token.findOne({ token: req.params.token }, (err, token) => {
      if (!token) {
        return res.status(400).json({ message: 'not-verified' });
      }

      // If we found a token, find a matching user
      User.findOne(
        { _id: token._userId, email: req.body.email },
        (er, user) => {
          const userClone = user;
          if (!user) {
            return res.status(400).json({ message: 'token user Not-Found' });
          }
          if (user.isVerified) {
            return res.status(400).json({ message: 'already-verified' });
          }
          // Verify and save the user
          userClone.isVerified = true;
          userClone.save((error) => {
            if (error) {
              return res.status(500).send({ message: err.message });
            }
            res.status(200).json({
              message: 'The account has been verified. Please log in.'
            });
          });
        }
      );
    });
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in verifying user' });
  }
};
module.exports = verification;
