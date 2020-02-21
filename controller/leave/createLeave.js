const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');

const createLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    startDate,
    endDate,
    type,
    staffEmail,
    daysTaken,
    publicHolidays, // array of days i.e ['25/12/2020','26/12/2020','01/01/2021']
    comment,
    status,
    progress
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

    const leave = new Leave({
      startDate,
      endDate,
      type,
      staffEmail,
      daysTaken,
      publicHolidays, // array of days i.e ['25/12/2020','26/12/2020','01/01/2021']
      comment,
      status,
      progress
    });
    // leave saved on staff collecttion after it has been approved and taken
    user.leaves.push(leave._id);
    await user.save();
    await leave.save();
    res.status(200).json({
      message: 'Leave Created successfully'
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Leave'
    });
  }
};

module.exports = createLeave;
