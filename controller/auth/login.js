const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('debug')('server');
const User = require('../../model/User');

const login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let msg = '';

    errors.array().forEach((error) => {
      msg = `${msg} ${error.msg} ::`;
    });

    return res.status(400).json({
      message: msg,
    });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    let isMatch;
    if (!user) {
      return res.status(400).json({
        message: 'User doesnot exist',
      });
    }
    if (!user.password) {
      return res.status(400).json({
        message: 'Please first activate your account',
      });
    }
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!user || !isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    if (!user.isPwdReset) {
      return res.status(400).json({
        message: 'Please first set a new password',
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
        expiresIn: '1h', //  values are in seconds, strings need timeunits i.e. "2 days", "10h", "7d", 1 day
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
        });
      }
    );
  } catch (e) {
    debug(e);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

module.exports = login;
