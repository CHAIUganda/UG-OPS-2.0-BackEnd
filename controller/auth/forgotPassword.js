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
      message: errors.array()
    });
  }

  const { email } = req.body;
  try {
    // Annual leave brought forward and unpaid leave taken are 0 when staff  is created.
    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(400).json({
        message: 'email does not exist'
      });
    }

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
          const uiHost = 'localhost:3000/#/';
          // prettier-ignore
          const text = `Hello, 
              Please reset your account password by clicking the link: http://${uiHost}auth/ResetPassword/${user.email}/${token}
              `;
          Mailer(from, to, subject, text, res);
        });
      }
    );
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = forgotPassword;
