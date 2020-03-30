const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const handlePlannedLeave = async (req, res) => {
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
    action
  } = req.body;
  // action applyForLeave, cancelLeave

  try {
    // check if user exists
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist'
      });
    }

    // check if Supervisor exists in System
    const supervisor = await User.findOne({ email: user.supervisorEmail });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor is not Registered in system'
      });
    }

    const leaveToTake = await Leave.findOne({
      _id: leaveId
    });
    if (!leaveToTake) {
      return res.status(400).json({
        message: 'The leave doesnot exist'
      });
    }
    let { startDate, endDate } = leaveToTake;
    // set timezone to kampala
    let CurrentDate = moment()
      .tz('Africa/Kampala')
      .format();
    CurrentDate = new Date(CurrentDate);
    endDate = new Date(endDate);
    startDate = new Date(startDate);
    const subject = 'Uganda Operations Leaves';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // handle leave here
    if (moment(startDate).isAfter(endDate)) {
      return res.status(400).json({
        message: 'Start Date cannot be after End date',
        endDate,
        startDate
      });
    }
    // eslint-disable-next-line object-curly-newline
    const { type, comment, program } = leaveToTake;
    const publicHolidays = await PublicHoliday.find({});
    const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);
    const { supervisorEmail } = user;

    if (leaveToTake.status === 'Planned') {
      if (action === 'applyForLeave') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          return res.status(400).json({
            message:
              'This leave already passed',
            CurrentDate,
            startDate
          });
        }
        if (moment(CurrentDate).isSame(startDate)) {
          return res.status(400).json({
            message: 'This leave already passed',
            CurrentDate,
            startDate
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'This Leave already passed',
            CurrentDate,
            endDate
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message: 'This leave already passed',
            CurrentDate,
            endDate
          });
        }
        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Pending Supervisor' } }
        );
        // mail supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 
  
  ${user.fName}  ${user.lName} is requesting to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                                        `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');
        // eslint-disable-next-line object-curly-newline
        const leave = {
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
          status: 'Pending Supervisor',
          program,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays
        };
        res.status(200).json({
          message: 'Leave has been applied For',
          leave
        });
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Cancelled' } }
        );
        const leave = {
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
          status: 'Cancelled',
          program,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays
        };
        res.status(200).json({
          message: 'Leave has been Cancelled',
          leave
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification'
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status for handling planned leave'
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave',
      msg: err.message,
      err
    });
  }
};

module.exports = handlePlannedLeave;
