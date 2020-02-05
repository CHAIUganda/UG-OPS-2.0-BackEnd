const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');

const Leave = require('../../model/Leave');

const createLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()
    });
  }

  const { startDate, endDate, type, staffEmail, status, progress } = req.body;
  try {
    // let user = await User.findOne({
    //     email
    // });
    // if (user) {
    //     return res.status(400).json({
    //         msg: "User Already Exists"
    //     });
    // }

    const leave = new Leave({
      startDate,
      endDate,
      type,
      staffEmail,
      status,
      progress
    });

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
