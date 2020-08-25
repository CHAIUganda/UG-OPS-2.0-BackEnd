const { validationResult } = require('express-validator/check');
const debug = require('debug')('server');
const jwt = require('jsonwebtoken');
const Mailer = require('../../helpers/Mailer');
const User = require('../../model/User');
const Token = require('../../model/Token');

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array(),
    });
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: 'email does not exist',
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: '5h', //  values are in seconds, strings need timeunits i.e. "2 days", "10h","7d"
      },
      (error, token) => {
        if (error) throw error;
        const usertokenDoc = new Token({ _userId: user._id, token });
        // Save the verification token
        usertokenDoc.save((err) => {
          if (err) {
            return res.status(500).send({ message: err.message });
          }
          // Send the email
          const subject = 'Ugops account password reset .';
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

Please reset your account password by clicking the link: ${UI_HOST}auth/ResetPassword/${user.email}/${token} ${footer}
                                `;
          Mailer(from, user.email, subject, textStaff, '');
          return res.status(200).json({
            message: 'A password reset link has been sent to your email',
          });
        });
      }
    );
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = forgotPassword;
