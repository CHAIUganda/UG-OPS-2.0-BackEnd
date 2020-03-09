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
  try {
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
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // if leave is taken by staff notify the HR and Supervisor.

    // handle leave here
    if (leave.status === 'approved') {
      if (status === 'taken') {
        // prettier-ignore
        if (
          (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
        ) {
          // change status to taken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // Send the email
          // prettier-ignore
          const text = `Hello, 

${user.fName}  ${user.lName} will be off from ${leave.startDate} to ${leave.endDate}${footer}.
                         `;
          Mailer(from, to, subject, text, res);

          res.status(200).json({
            message: 'Leave has been taken. Enjoy your leave.'
          });
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
      } else if (status === 'nottaken') {
      } else {
        return res.status(400).json({
          message: 'Invalid status for staff leave handling'
        });
      }
    } else {
      return res.status(400).json({
        message: 'This leave cannot be taken'
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
