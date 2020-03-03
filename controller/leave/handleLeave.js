const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');

const handleLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    leaveId,
    staffEmail,
    status,
    reason
  } = req.body;

  try {
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exists'
      });
    }

    const leave = await Leave.findOne({
      _id: leaveId
    });
    if (!leave) {
      return res.status(400).json({
        message: 'The leave doesnot exist'
      });
    }
    // handle leave here
    if (status === 'approved') {
      if (user.type === 'expat' || user.type === 'tcn') {
        // do logic here
        return res.status(400).json({
          message: 'Home leave only given to Expatriates '
        });
      } else {
        // do logic here
        return res.status(400).json({
          message: 'Home leave only given to Expatriates '
        });
      }
    } else if (status === 'rejected') {
      if (user.type !== 'Expat') {
        return res.status(400).json({
          message: 'Home leave only given to Expatriates '
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status'
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave'
    });
  }
};

module.exports = handleLeave;
