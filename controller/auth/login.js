const { validationResult } = require('express-validator/check');
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

    // on reg use 2 lines below
    // caputures pwd and encrpts it and stores crypt
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);

    let isMatch;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!user || !isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    // if (!user.isPwdReset) {
    //   return res.status(400).json({
    //     message: 'Please first set a new password'
    //   });
    // }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: '1 day', //  values are in seconds, strings need timeunits i.e. "2 days", "10h", "7d"
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
