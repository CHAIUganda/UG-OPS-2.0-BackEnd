const { validationResult } = require('express-validator/check');
// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const getLeavesTaken = require('./getLeavesTaken');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const createLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    type,
    staffEmail, // array of days i.e ['25/12/2020','26/12/2020','01/01/2021']
    status
  } = req.body;

  let { comment } = req.body;
  let { startDate, endDate } = req.body;
  if (comment == null) {
    comment = '';
  }

  try {
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist'
      });
    }
    if (status === 'pending') {
      const chkleaves = await Leave.find({
        _id: { $in: user.leaves },
        status,
        type
      });
      if (chkleaves.length > 0) {
        return res.status(400).json({
          message: `A pending Leave of type ${type} Already exists `,
          chkleaves
        });
      }
    }

    if (status === 'Pending Supervisor' || status === 'Planned') {
      const { program } = user;
      const publicHolidays = await PublicHoliday.find({});
      const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);
      // set timezone to kampala
      // const CurrentDate = moment().tz('Africa/Kampala').format();
      endDate = new Date(endDate);
      startDate = new Date(startDate);
      const endDateMonth = endDate.getMonth();

      // Computing Annual Leave
      let accruedAnnualLeave;
      if (endDateMonth === 0) {
        accruedAnnualLeave = 0;
      } else {
        // accruedAnnualLeave = currentMonth * 1.75;
        accruedAnnualLeave = Math.trunc(endDateMonth * 1.75);
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
        const totalPaternity = paternityLeaveTaken + daysDetails.totalDays;
        if (paternity < totalPaternity) {
          return res.status(400).json({
            message: 'You Dont have enough Paternity Leave days',
            paternityLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalPaternity,
            paternity
          });
        }
      } else if (type === 'Home') {
        if (user.type === 'local') {
          return res.status(400).json({
            message: 'Home leave only given to Expatriates and TCNs'
          });
        }
        // eslint-disable-next-line operator-linebreak
        const totalHome =
          homeLeaveTaken + annualLeaveTaken + daysDetails.totalDays;
        const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalHome;
        if (chk1) {
          return res.status(400).json({
            message: 'You Dont have enough Annual Leave days',
            annualLeaveTaken,
            homeLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalHome,
            totalAcruedAnualLeavePlusAnualLeaveBF
          });
        }
      } else if (type === 'Maternity') {
        if (user.gender === 'Male') {
          return res.status(400).json({
            message: 'Maternity leave only given to Ladies'
          });
        }
        const totalMaternity = maternityLeaveTaken + daysDetails.totalDays;
        if (maternity < totalMaternity) {
          return res.status(400).json({
            message: 'You Dont have enough Maternity Leave days',
            maternityLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalMaternity,
            maternity
          });
        }
      } else if (type === 'Sick') {
        const totalSick = sickLeaveTaken + daysDetails.totalDays;
        if (sick < totalSick) {
          return res.status(400).json({
            message: 'You Dont have enough Sick Leave days',
            sickLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalSick,
            sick
          });
        }
      } else if (type === 'Unpaid') {
        const totalUnpaid = unPaidLeaveTaken + daysDetails.totalDays;
        if (unpaid < totalUnpaid) {
          return res.status(400).json({
            message: 'You Dont have enough Unpaid Leave days',
            unPaidLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalUnpaid,
            unpaid
          });
        }
      } else if (type === 'Study') {
        const totalStudy = studyLeaveTaken + daysDetails.totalDays;
        if (study < totalStudy) {
          return res.status(400).json({
            message: 'You Dont have enough Study Leave days',
            studyLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalStudy,
            study
          });
        }
      } else if (type === 'Annual') {
        // eslint-disable-next-line operator-linebreak
        const totalAnnual =
          annualLeaveTaken + homeLeaveTaken + daysDetails.totalDays;
        const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalAnnual;
        if (chk1) {
          return res.status(400).json({
            message: 'You Dont have enough Annual Leave days',
            annualLeaveTaken,
            homeLeaveTaken,
            daysRequested: daysDetails.totalDays,
            totalAnnual,
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
        staff: {
          email: user.email,
          fName: user.fName,
          lName: user.lName
        },
        supervisorEmail,
        comment,
        status,
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
        message: 'Leave Created successfully',
        leave,
        daysDetails
      });
    } else {
      res.status(400).json({
        message: 'Invalid Leave Status'
      });
    }
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error Creating Leave'
    });
  }
};

module.exports = createLeave;
