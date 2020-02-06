const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('debug')('server');
const User = require('../../model/User');

const login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()
    });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Your account has not been verified.'
      });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      'randomString',
      {
        expiresIn: 3600 //  values are in seconds, strings need timeunits i.e. "2 days", "10h", "7d"
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token
        });
      }
    );
  } catch (e) {
    debug(e);
    res.status(500).json({
      message: 'Server Error'
    });
  }
};

module.exports = login;
