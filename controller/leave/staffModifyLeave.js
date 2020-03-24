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
const leaveEligibity = require('./leaveEligibity');

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

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message:
              'End Date cannot be changed to a date that already started',
            CurrentDate,
            endDate
          });
        }

        // work on re approval
        if (
          // eslint-disable-next-line operator-linebreak
          moment(startDate).isAfter(oldEndDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(startDate).isBefore(oldStartDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(endDate).isBefore(oldStartDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(endDate).isAfter(oldEndDate)
        ) {
          const publicHolidays = await PublicHoliday.find({});
          const daysDetails = getLeaveDaysNo(
            startDate,
            endDate,
            publicHolidays
          );
          const leaveDetails = await getLeavesTaken(user);
          leaveEligibity(daysDetails, leaveDetails, user, endDate, leave, res);
          const message = `Staff Comment:${comment}  System Comment: Leave is being modified outside of approved time`;
          const status = 'Pending Supervisor';
          // re applying code
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
                status,
                comment: message,
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
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their leave. To be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                                      `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');
        } else {
          // leave is still in approved time
          // chk if staff is an expat or tcn to allow cd notication
          // prettier-ignore
          // eslint-disable-next-line no-lonely-if
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

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, hr.email, subject, text, '');

            // email to CD
            // prettier-ignore
            const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, cd.email, subject, textCd, '');

            // email to Supervisor
            // prettier-ignore
            const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, supervisor.email, subject, textSupervisor, '');

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
            Mailer(from, hr.email, subject, text, '');

            // email to Supervisor
            // prettier-ignore
            const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, supervisor.email, subject, textSupervisor, '');

            res.status(200).json({
              message: 'Leave has been taken Modified successfully.'
            });
          }
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

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, '');

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, '');

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');

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
          // sends mail to supervisor  HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, '');
          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');

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
          msg = `${msg}New startDate(${startDate.toDateString()}) is before the Old startDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(startDate).isAfter(oldEndDate)) {
          msg = `${msg}New startDate(${startDate.toDateString()}) is after the Old EndDate(${oldEndDate.toDateString()}):::`;
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          msg = `${msg}New EndDate(${endDate.toDateString()}) already passed as of today (${CurrentDate.toDateString()}):::`;
        }

        if (moment(endDate).isBefore(oldStartDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is Before the Old StartDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(endDate).isAfter(oldEndDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is after the Old endDate(${oldEndDate.toDateString()}):::`;
        }

        // chk if staff is an expat or tcn to allow cd notication
        // prettier-ignore
        const publicHolidays = await PublicHoliday.find({});
        const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);
        const leaveDetails = await getLeavesTaken(user);
        leaveEligibity(daysDetails, leaveDetails, user, endDate, leave, res);
        const message = `Staff Comment:${comment}  System Comment(s): ${msg}`;

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
          const status = 'Pending Change';
          // re applying code
          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                isModfied: true,
                status,
                modificationDetails: {
                  takenPending: {
                    startDate,
                    endDate,
                    comment: message
                  }
                }
              }
            }
          );
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their Taken leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm. ${footer}.
                                      `;
          const cc = `${cd.lName},${hr.lName}`;
          Mailer(from, supervisor.email, subject, textSupervisor, cc);

          res.status(200).json({
            message: 'Leave Modification request sent successfully.'
          });
        } else {
          // Leave not home
          // change leave details

          // change leave details
          const status = 'Pending Change';
          // re applying code
          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                isModfied: true,
                status,
                modificationDetails: {
                  takenPending: {
                    startDate,
                    endDate,
                    comment: message
                  }
                }
              }
            }
          );
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their Taken leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm. ${footer}.
                                      `;
          const cc = `${hr.lName}`;
          Mailer(from, supervisor.email, subject, textSupervisor, cc);

          res.status(200).json({
            message: 'Leave Modification request sent successfully.'
          });
        }
      } else if (action === 'cancelLeave') {
        // prettier-ignore

        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Pending Not Taken' } }
        );
        // sends mail to cd supervisor HR and notification about status
        // prettier-ignore
        // email to Supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their Taken leave Which was from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}. This is pending your approval${footer}.
                         `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');

        res.status(200).json({
          message: 'Cancellation Pending Supervisor Approval'
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification'
        });
      }
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
