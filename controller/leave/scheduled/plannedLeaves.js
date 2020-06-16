const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const Leave = require('../../../model/Leave');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');

const plannedLeaves = async () => {
  try {
    const startsIn = 28;
    const startsIn2 = 21;
    const startsIn3 = 14;
    const startsIn4 = 7;
    const startsIn5 = 3;
    const logger = log4js.getLogger('Timed');
    // set timezone to kampala
    const CurrentDate = moment().tz('Africa/Kampala').format();
    const leaves = await Leave.find({ status: 'Planned' });
    // initialize emailing necessities
    const subject = 'Uganda Operations Leaves';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        const { startDate, _id } = arr[controller];
        const staffEmail = arr[controller].staff.email;

        // check if user exists
        const user = await User.findOne({
          email: staffEmail,
        });
        if (!user) {
          logger.error(`Staff not found. Email: ${staffEmail} LeaveId: ${_id}`);
          recurseProcessLeave(controller + 1, arr);
        } else {
          const today = new Date(CurrentDate);
          let leaveStart = new Date(startDate);
          if (moment(today.toDateString()).isSame(leaveStart.toDateString())) {
            // change status to Not

            // change status to taken
            await Leave.updateOne(
              {
                _id,
              },
              { $set: { status: 'Planned Ignored' } }
            );
            // sends mail to user
            // prettier-ignore
            // email to staff
            const textUser = `Hello  ${user.fName}, 
  
Your Planned leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has been Ignored.${footer}.
                                              `;
            Mailer(from, user.email, subject, textUser, '');
            recurseProcessLeave(controller + 1, arr);
          } else {
            leaveStart = moment(leaveStart);
            const diff = leaveStart.diff(CurrentDate, 'days') + 1;
            // send  in startsIn days to expiry

            if (
              // prettier-ignore
              // eslint-disable-next-line
              diff == startsIn || diff == startsIn2 || diff == startsIn3 || diff == startsIn4 || diff == startsIn5
            ) {
              // sends mail to user
              // prettier-ignore
              // email to staff
              const textUser = `Hello  ${user.fName}, 
  
Your Planned leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} will start in ${diff} days as of ${today.toDateString()}. This is remainder to apply for it.${footer}.
                                              `;
              Mailer(from, user.email, subject, textUser, '');
              recurseProcessLeave(controller + 1, arr);
            } else {
              recurseProcessLeave(controller + 1, arr);
            }
          }
        }
      }
    };

    await recurseProcessLeave(0, leaves);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
  }
};

module.exports = plannedLeaves;
