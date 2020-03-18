const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

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
  if (comment === null) {
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
      if (action === 'changeStartDate') {
        if (moment(CurrentDate).isAfter(startDate)) {
          return res.status(400).json({
            message: 'Start Date cannot be changed beacause it already passed',
            CurrentDate,
            startDate
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
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
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
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        }
      } else if (action === 'changeEndDate') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate
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
                endDate,
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
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
                endDate,
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
          });
        }
      } else if (action === 'changeStartandEndDate') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate
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
                endDate,
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
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
                endDate,
                comment,
                modificationDetails: {
                  isModified: true,
                  $push: {
                    modLeaves: {
                      // eslint-disable-next-line max-len
                      startDate: oldStartDate, endDate: oldEndDate, comment: oldComment

                    }
                  }
                }
              }
            }
          );


          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken Modified successfully.'
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
