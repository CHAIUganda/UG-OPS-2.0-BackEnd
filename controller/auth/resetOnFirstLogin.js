const debug = require('debug')('server');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../model/User');
const Token = require('../../model/Token');
const Mailer = require('../../helpers/Mailer');
const errorToString = require('../../helpers/errorToString');

// Get LoggedIn User
const resetOnFirstLogin = async (req, res) => {
  try {
    // check input error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errorToString(errors.array()),
      });
    }
    // Find a matching token
    const tokensent = await Token.findOne({ token: req.header('token') });
    if (!tokensent) {
      // if token expired we are sending another
      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return res.status(400).json({
          message: 'User Does not exist',
        });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };

      // resend token to user email token generation is needed here
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '5 days', // values are in seconds, strings need timeunits i.e "2 days", "10h","7d"
        },
        (error, token) => {
          if (error) throw error;
          const usertokenDoc = new Token({ _userId: user._id, token });
          // Save the verification token
          usertokenDoc.save((err) => {
            if (err) {
              return res.status(400).json({ message: err.message });
            }
            const subject = 'Ugops Account Setup.';
            const from = 'UGOperations@clintonhealthaccess.org';
            const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;

            const UI_HOST = process.env.UI_HOST || 'http://localhost:3000/#/';
            // mail staff
            // prettier-ignore
            const textStaff = `Dear  ${user.fName}, 

Please set your account password by clicking the link: ${UI_HOST}auth/ResetPassword/${user.email}/${token} ${footer}
                                  `;
            Mailer(from, user.email, subject, textStaff, '');
          });
          return res.status(400).json({
            message:
              'Password reset token is invalid or has expired. We have sent another password reset link to your email',
          });
        }
      );
    } else {
      // If we found a token, find a matching user using token userid and supplied email
      const user = await User.findOne({
        _id: tokensent._userId,
        email: req.body.email,
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
        res.status(200).json({
          message: 'The account password has been set. Please log in.',
        });
      });
    }
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in seting user password' });
  }
};
module.exports = resetOnFirstLogin;
