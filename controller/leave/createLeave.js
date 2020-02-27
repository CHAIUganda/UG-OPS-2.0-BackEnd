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
    supervisorEmail,
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
    // checks if user has enough leaves days happen here basing on what has been computed
    const leave = new Leave({
      startDate,
      endDate,
      type,
      staffEmail,
      supervisorEmail,
      daysTaken,
      publicHolidays,
      // array of days i.e ["2020-02-25","2020-02-29"]
      comment,
      status,
      progress
    });
    // leave id saved on staff collection after it has been planned, it the status that is updated
    await User.updateOne(
      {
        email: staffEmail
      },
      { $push: { leaves: leave._id } }
    );
    await leave.save();
    // send email notification to supervisor if leave is is pending
    res.status(201).json({
      message: 'Leave Created successfully'
    });
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error Creating Leave'
    });
  }
};

module.exports = createLeave;
