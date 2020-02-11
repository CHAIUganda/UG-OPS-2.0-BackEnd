const debug = require('debug')('server');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../model/User');
const Token = require('../../model/Token');
const Mailer = require('../../helpers/Mailer');

// Get LoggedIn User
const reset = async (req, res) => {
  try {
    // check input error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()
      });
    }
    // Find a matching token
    const tokensent = await Token.findOne({ token: req.header('token') });
    if (!tokensent) {
      // if token expired we are sending another
      const user = await User.findOne({
        email: req.body.email
      });

      if (!user) {
        return res.status(400).json({
          message: 'User Does not exist'
        });
      }
      const payload = {
        user: {
          id: user.id
        }
      };

      // resend token to user email token generation is needed here
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: 10000 // values are in seconds, strings need timeunits i.e "2 days", "10h","7d"
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
            const uiHost = 'localhost:3000/#/';
            // prettier-ignore
            const text = `${'Hello,\n\n'
       + 'Please reset your account password by clicking the link: \nhttp://'}${
              uiHost
            }/auth/ResetPassword/${user.email}/${token}\n`;
            Mailer(from, to, subject, text, res);
          });
        }
      );

      return res.status(400).json({
        message:
          'Password reset token is invalid or has expired. We have sent another to your email'
      });
    }

    // If we found a token, find a matching user using token userid and supplied email
    const user = await User.findOne({
      _id: tokensent._userId,
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
      tokensent.remove();
      // create a token for the user
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '1 day' //  values are in seconds, strings need timeunits i.e. "2 days", "10h", "7d"
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            message: 'password set. user logged in "use token" .',
            token,
            userClone
          });
        }
      );
    });
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in reseting user password' });
  }
};
module.exports = reset;
