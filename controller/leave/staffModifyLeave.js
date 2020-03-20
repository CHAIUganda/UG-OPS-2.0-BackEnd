const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const getLeavesTaken = require('./getLeavesTaken');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const staffModifyLeave = async (req, res) => {
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
  // action can be changeStartDate changeEndDate cancelLeave
  let { startDate, endDate } = req.body;
  let { comment } = req.body;
  if (comment == null) {
    comment = '';
  }
  try {
    // set timezone to kampala
    const CurrentDate = moment()
      .tz('Africa/Kampala')
      .format();
    endDate = new Date(endDate);
    startDate = new Date(startDate);
    // check if user exists
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist'
      });
    }
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      return res.status(400).json({
        message: 'HR is not Registered in system'
      });
    }

    // check if Supervisor exists in System
    const supervisor = await User.findOne({ email: user.supervisorEmail });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor is not Registered in system'
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
    const subject = 'Uganda Operations Leaves';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // set old leave values
    const oldStartDate = leave.startDate;
    const oldEndDate = leave.endDate;
    const oldComment = leave.comment;

    // if leave is taken by staff notify the HR and Supervisor.
    // handle leave here
    if (leave.status === 'Approved') {
      if (action === 'changeLeave') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          return res.status(400).json({
            message:
              'Start Date cannot be changed to a date that already passed',
            CurrentDate,
            startDate
          });
        }
        if (moment(CurrentDate).isSame(startDate)) {
          return res.status(400).json({
            message:
              'Start Date cannot be changed to a date that already started',
            CurrentDate,
            startDate
          });
        }
        if (moment(startDate).isBefore(oldStartDate)) {
          return res.status(400).json({
            message:
              'New startDate is before the approved time please cancel and reapply',
            startDate,
            oldStartDate
          });
        }
        if (moment(startDate).isAfter(oldEndDate)) {
          return res.status(400).json({
            message: 'Leave cannot start when it has ended',
            startDate,
            oldEndDate
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate
          });
        }

        if (moment(endDate).isBefore(oldStartDate)) {
          return res.status(400).json({
            message: 'Leave cannot end before its start',
            startDate,
            oldStartDate
          });
        }
        if (moment(endDate).isAfter(oldEndDate)) {
          return res.status(400).json({
            message:
              'New Enddate is beyond the approved one please cancel and re apply',
            endDate,
            oldEndDate
          });
        }

        // chk if staff is an expat or tcn to allow cd notication
        // prettier-ignore
        if (
          (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system'
            });
          }

          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                startDate,
                endDate,
                comment,
                isModfied: true
              }
            }
          );
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        } else {
          // Leave not home
          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                startDate,
                endDate,
                comment,
                isModfied: true
              }
            }
          );
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();

          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        }
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        if (
          (user.type === 'expat' || user.type === 'tcn')
          && leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system'
            });
          }

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been Cancelled'
          });
        } else {
          // Leave not home

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);
          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been Cancelled'
          });
        }
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification'
        });
      }
    } else if (leave.status === 'Taken') {
      let msg = '';
      if (action === 'changeLeave') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          msg = `${msg}New StartDate(${startDate.toDateString()}) already passed as of (${CurrentDate.toDateString()}):::`;
        }
        if (moment(CurrentDate).isSame(startDate)) {
          msg = `${msg} leave being modified to start today: ${startDate.toDateString()}  :::`;
        }
        if (moment(startDate).isBefore(oldStartDate)) {
          msg = `${msg}New startDate(${startDate.toDateString()}) is before the approved startDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(startDate).isAfter(oldEndDate)) {
          msg = `${msg}New startDate(${startDate.toDateString()}) is after the approved EndDate(${oldEndDate.toDateString()}):::`;
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          msg = `${msg}New EndDate(${endDate.toDateString()}) already passed as of(${CurrentDate.toDateString()}):::`;
        }

        if (moment(endDate).isBefore(oldStartDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is Before the approved StartDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(endDate).isAfter(oldEndDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is after the approved endDate(${oldEndDate.toDateString()}):::`;
        }

        // chk if staff is an expat or tcn to allow cd notication
        // prettier-ignore
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

        if (leave.type === 'Paternity') {
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
        } else if (leave.typetype === 'Home') {
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
        } else if (leave.type === 'Maternity') {
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
        } else if (leave.type === 'Sick') {
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
        } else if (leave.type === 'Unpaid') {
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
        } else if (leave.type === 'Study') {
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
        } else if (leave.type === 'Annual') {
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

        if (
          // eslint-disable-next-line operator-linebreak
          (user.type === 'expat' || user.type === 'tcn') &&
          leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system'
            });
          }

          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                startDate,
                endDate,
                comment,
                isModfied: true
              }
            }
          );
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: oldStartDate,
            endDate: oldEndDate,
            comment: oldComment
          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();

          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()} Note: ${msg}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()} Note: ${msg}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()} Note: ${msg}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        } else {
          // Leave not home
          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                startDate,
                endDate,
                comment,
                isModfied: true
              }
            }
          );
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: oldStartDate,
            endDate: oldEndDate,
            comment: oldComment
          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();

          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()} Note: ${msg}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()} Note: ${msg}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        }
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        if (
          (user.type === 'expat' || user.type === 'tcn')
          && leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system'
            });
          }

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been Cancelled'
          });
        } else {
          // Leave not home

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);
          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been Cancelled'
          });
        }
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification'
        });
      }
    } else {
      return res.status(400).json({
        message: `This leave with a status: ${leave.status} cannot be not modified`
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

module.exports = staffModifyLeave;
