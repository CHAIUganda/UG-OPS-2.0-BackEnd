const { validationResult } = require('express-validator/check');
const schedule = require('node-schedule');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const staffHandleLeave = async (req, res) => {
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
    status
  } = req.body;
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
    const from = 'spaul@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // if leave is taken by staff notify the HR and Supervisor.

    // handle leave here
    if (leave.status === 'Approved') {
      if (status === 'Taken') {
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

          // change status to taken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} will be off from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} will be off from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} will be off from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken. Enjoy your leave.'
          });
        } else {
          // Leave not home
          // change status to taken

          // change status to taken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} will be off from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to Supervisor
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} will be off from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, res);

          res.status(200).json({
            message: 'Leave has been taken. Enjoy your leave.'
          });
        }
      } else if (status === 'Not Taken') {
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
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);

          // email to CD
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, res);

          // email to Supervisor
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
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, res);
          // email to Supervisor
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
          message: 'Invalid status for staff leave handling'
        });
      }
    } else {
      return res.status(400).json({
        message: 'This leave has not yet been approved'
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave'
    });
  }
};

module.exports = staffHandleLeave;
