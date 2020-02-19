const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');

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
    status,
    progress
  } = req.body;

  try {
    // let user = await User.findOne({
    //     email
    // });
    // if (user) {
    //     return res.status(400).json({
    //         msg: "User Already Exists"
    //     });
    // }
    // leave can already exist so that check is not needed.
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
