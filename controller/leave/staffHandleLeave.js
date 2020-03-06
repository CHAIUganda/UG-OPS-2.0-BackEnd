const { validationResult } = require('express-validator/check');
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
  let { reason } = req.body;

  try {
    if (reason === null) {
      reason = '';
    }
    const user = await User.findOne({
      email: staffEmail
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exists'
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
    const to = user.email;
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // if leave is taken by staff notify the HR and Supervisor.

    // handle leave here
    if (status === 'approved') {
      // prettier-ignore
      if (
        (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
      ) {
        if (leave.progress === 'supervisor') {
          // change progress to cd and notify
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { progress: 'countryDirector' } }
          );
          // sends mail to staff and notification about progress
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave has been approved by your supervisor. It is pending Country director approvalr${footer}.
                         `;
          Mailer(from, to, subject, text, res);

          res.status(200).json({
            message: 'Leave has been Approved by your supervisor, Pending CD approval'
          });
        } else if (leave.progress === 'countryDirector') {
          // approve & notify that CD approved their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'approved' } }
          );
          // sends mail to staff and notification about leave approval
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave has been approved by the Country director${footer}.
                                   `;

          Mailer(from, to, subject, text, res);
          res.status(200).json({
            message: 'Leave has been Approved'
          });
        } else {
          // respond with invalid progress
          return res.status(400).json({
            message: 'invalid progress'
          });
        }
      } else {
      // Leave not home
      // change status to approved and notify
      // approve & notify that supervisor approved their leave request
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'approved' } }
        );
        // sends mail to staff and notification about leave approval
        // Send the email
        // prettier-ignore
        const text = `Dear ${user.fName}, 

Your Leave has been approved by your Supervisor${footer}.
                 `;
        Mailer(from, to, subject, text, res);
        res.status(200).json({
          message: 'Leave has been Approved'
        });
      }
    } else if (status === 'rejected') {
      // prettier-ignore
      if (
        (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
      ) {
        if (leave.progress === 'supervisor') {
          // change status to rejected and notify
          // notify that supervisor rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'rejected', rejectionReason: reason } }
          );
          // sends mail to staff and notification about supervisor leave rejection
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave has been rejected by your Supervisor${footer}.
                                   `;
          Mailer(from, to, subject, text, res);
          res.status(200).json({
            message: 'Leave has been Rejected by supervisor'
          });
        } else if (leave.progress === 'countryDirector') {
          // change status to rejected and notify
          // notify that CD rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'rejected', rejectionReason: reason } }
          );
          // sends mail to staff and notification about CD leave rejection
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your Leave has been rejected by the Country director.${footer}.
                                   `;
          Mailer(from, to, subject, text, res);
          res.status(200).json({
            message: 'Leave has been Rejected by CD'
          });
        } else {
          return res.status(400).json({
            message: 'invalid progress'
          });
        }
      } else { // Leave not home
        // change status to rejected
        // notify that supervisor rejected their leave request
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'rejected', rejectionReason: reason } }
        );
        // sends mail to staff and notification about supervisor leave rejection
        // Send the email
        // prettier-ignore
        const text = `Dear ${user.fName}, 

Your Leave has been rejected by your Supervisor.${footer}.
                                   `;
        Mailer(from, to, subject, text, res);
        res.status(200).json({
          message: 'Leave has been Rejected by supervisor'
        });
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

module.exports = staffHandleLeave;
