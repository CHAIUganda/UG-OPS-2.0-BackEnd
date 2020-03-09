const { validationResult } = require('express-validator/check');
const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const getLeavesTaken = require('./getLeavesTaken');

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
    status
  } = req.body;

  let { comment } = req.body;
  if (comment === null) {
    comment = '';
  }

  try {
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exists'
      });
    }
    const { program } = user;
    const progress = 'supervisor';
    // set timezone to kampala
    const CurrentDate = moment()
      .tz('Africa/Kampala')
      .format();
    const today = new Date(CurrentDate);
    const currentMonth = today.getMonth();

    // Computing Annual Leave
    let accruedAnnualLeave;
    if (currentMonth === 0) {
      accruedAnnualLeave = 0;
    } else {
      accruedAnnualLeave = currentMonth * 1.75;
    }
    const { annualLeaveBF } = user;
    const leaveDetails = await getLeavesTaken(user);

    const {
      unPaidLeaveTaken,
      homeLeaveTaken,
      annualLeaveTaken,
      maternityLeaveTaken,
      paternityLeaveTaken,
      sickLeaveTaken,
      studyLeaveTaken
    } = leaveDetails;

    // prettier-ignore
    const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
    const maternity = 60;
    const paternity = 7;
    const sick = 42;
    const study = 4;
    const unpaid = 60;

    if (type === 'Paternity') {
      if (user.gender === 'Female') {
        return res.status(400).json({
          message: 'Paternity leave only given to Gentlemen'
        });
      }
      const totalPaternity = paternityLeaveTaken + daysTaken;
      if (paternity === totalPaternity || paternity < totalPaternity) {
        return res.status(400).json({
          message: 'You Dont have enough Paternity Leave days'
        });
      }
    } else if (type === 'Home') {
      if (user.type !== 'Expat' || user.type !== 'tcn') {
        return res.status(400).json({
          message: 'Home leave only given to Expatriates and TCNs'
        });
      }
      const totalHome = homeLeaveTaken + annualLeaveTaken + daysTaken;
      const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF === totalHome;
      const chk2 = totalAcruedAnualLeavePlusAnualLeaveBF < totalHome;
      if (chk1 || chk2) {
        return res.status(400).json({
          message: 'You Dont have enough Annual Leave days'
        });
      }
    } else if (type === 'Maternity') {
      if (user.gender === 'Male') {
        return res.status(400).json({
          message: 'Maternity leave only given to Ladies'
        });
      }
      const totalMaternity = maternityLeaveTaken + daysTaken;
      if (maternity === totalMaternity || maternity < totalMaternity) {
        return res.status(400).json({
          message: 'You Dont have enough Maternity Leave days'
        });
      }
    } else if (type === 'Sick') {
      const totalSick = sickLeaveTaken + daysTaken;
      if (sick === totalSick || sick < totalSick) {
        return res.status(400).json({
          message: 'You Dont have enough Sick Leave days'
        });
      }
    } else if (type === 'Unpaid') {
      const totalUnpaid = unPaidLeaveTaken + daysTaken;
      if (unpaid === totalUnpaid || unpaid < totalUnpaid) {
        return res.status(400).json({
          message: 'You Dont have enough Unpaid Leave days'
        });
      }
    } else if (type === 'Study') {
      const totalStudy = studyLeaveTaken + daysTaken;
      if (study === totalStudy || study < totalStudy) {
        return res.status(400).json({
          message: 'You Dont have enough Study Leave days'
        });
      }
    } else if (type === 'Annual') {
      const totalAnnual = annualLeaveTaken + daysTaken;
      const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF === totalAnnual;
      const chk2 = totalAcruedAnualLeavePlusAnualLeaveBF < totalAnnual;
      if (chk1 || chk2) {
        return res.status(400).json({
          message: 'You Dont have enough Annual Leave days',
          annualLeaveTaken,
          daysTaken,
          totalAcruedAnualLeavePlusAnualLeaveBF
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave type selected'
      });
    }

    // checks if user has enough leaves days happen here basing on what has been computed
    const { supervisorEmail } = user;
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
      progress,
      program
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
