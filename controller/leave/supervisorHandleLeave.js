const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const supervisorHandleLeave = async (req, res) => {
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
  let { reason } = req.body;

  try {
    if (reason == null) {
      reason = '';
    }
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist'
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
    const to = user.email;
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // handle leave here
    if (status === 'Approved') {
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
        if (leave.status === 'Pending Supervisor') {
          // change progress to cd and notify
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Pending Country Director' } }
          );
          // sends mail to staff and notification about progress
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved your supervisor. It is now pending Country director approval${footer}.
                         `;
          Mailer(from, to, subject, text, '');

          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} is requesting for a Home Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, '');

          res.status(200).json({
            message: 'Leave has been Approved, Pending CD approval'
          });
        } else if (leave.status === 'Pending Country Director') {
          // approve & notify that CD approved their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Approved' } }
          );
          // sends mail to staff and notification about leave approval
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Home Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by the Country director${footer}.
                                   `;

          Mailer(from, to, subject, text, user.supervisorEmail);
          res.status(200).json({
            message: 'Leave has been Approved'
          });
        } else if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to staff
          // prettier-ignore
          const textStaff = `Hello  ${user.fName}, 

Cancellation of your Home Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}.
                         `;
          Mailer(from, user.email, subject, textStaff, cd.email);
        } else if (leave.status === 'Approved') {
          res.status(400).json({
            message: 'Leave has Already been Approved'
          });
        } else {
          // respond with invalid progress
          return res.status(400).json({
            message: 'invalid Status'
          });
        }
      } else {
      // Leave not home
      // change status to approved and notify
      // approve & notify that supervisor approved their leave request

        // eslint-disable-next-line no-lonely-if
        if (leave.status === 'Pending Not Taken') {
        // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to staff
          // prettier-ignore
          const textStaff = `Hello  ${user.fName}, 

Cancellation of your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}.
                       `;
          Mailer(from, user.email, subject, textStaff, '');
        } else {
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Approved' } }
          );
          // sends mail to staff and notification about leave approval
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor${footer}.
                 `;
          Mailer(from, to, subject, text, '');
          res.status(200).json({
            message: 'Leave has been Approved'
          });
        }
      }
    } else if (status === 'Declined') {
      // prettier-ignore
      if (
        (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
      ) {
        if (leave.status === 'Pending Supervisor') {
          // change status to rejected and notify
          // notify that supervisor rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Supervisor Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about supervisor leave rejection
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor${footer}.
                                   `;
          Mailer(from, to, subject, text, '');
          res.status(200).json({
            message: 'Leave has been Declined by supervisor'
          });
        } else if (leave.status === 'Pending Country Director') {
          // change status to rejected and notify
          // notify that CD rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Country Director Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about CD leave rejection
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by the Country director.${footer}.
                                   `;
          Mailer(from, to, subject, text, user.supervisorEmail);
          res.status(200).json({
            message: 'Leave has been Declined'
          });
        } else if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to staff
          // prettier-ignore
          const textStaff = `Hello  ${user.fName}, 

Cancellation of your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor.${footer}.
                         `;
          Mailer(from, user.email, subject, textStaff, '');
        } else {
          return res.status(400).json({
            message: 'Invalid Status'
          });
        }
      } else { // Leave not home
        // change status to rejected
        // notify that supervisor rejected their leave request
        // eslint-disable-next-line no-lonely-if
        if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to staff
          // prettier-ignore
          const textStaff = `Hello  ${user.fName}, 
  
  Cancellation of your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor.${footer}.
                         `;
          Mailer(from, user.email, subject, textStaff, '');
        } else {
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Supervisor Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about supervisor leave rejection
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 
    
    Your Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor.${footer}.
                                       `;
          Mailer(from, to, subject, text, '');
          res.status(200).json({
            message: 'Leave has been Declined'
          });
        }
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status'
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave'
    });
  }
};

module.exports = supervisorHandleLeave;
