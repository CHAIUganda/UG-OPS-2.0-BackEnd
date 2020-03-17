const debug = require('debug')('server');
const moment = require('moment-timezone');

const log4js = require('log4js');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const takeLeaves = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    // set timezone to kampala
    const CurrentDate = moment()
      .tz('Africa/Kampala')
      .format();
    const leaves = await Leave.find({ status: 'Approved' });
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      logger.error('HR not found in the system, Please Register the HR');
      console.log('HR not found in the system, Please Register the HR');
      const errorMessage = {
        code: 403,
        message: 'HR not found in the system, Please Register the HR'
      };
      throw errorMessage;
    }
    // initialize emailing necessities
    const subject = 'Uganda Operations Leaves';
    const from = 'spaul@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        const { startDate, supervisorEmail, _id } = arr[controller];
        const staffEmail = arr[controller].staff.email;

        // check if user exists
        const user = await User.findOne({
          email: staffEmail
        });
        if (!user) {
          logger.error(`Staff not found. Email: ${staffEmail} LeaveId: ${_id}`);
          recurseProcessLeave(controller + 1, arr);
        }

        // check if Supervisor exists in System
        const supervisor = await User.findOne({ email: supervisorEmail });
        if (!supervisor) {
          logger.error(
            `Supervisor not found Email: ${supervisorEmail} LeaveId: ${_id} staffEmail: ${staffEmail}`
          );
          recurseProcessLeave(controller + 1, arr);
        }

        const today = new Date(CurrentDate);
        const leaveStart = new Date(startDate);
        if (moment(today.toDateString()).isSame(leaveStart.toDateString())) {
          // prettier-ignore
          if (
            (user.type === 'expat' || user.type === 'tcn') && arr[controller].type === 'Home'
          ) {
          // check if CD exists in System
            const cd = await User.findOne({ 'roles.countryDirector': true });
            if (!cd) {
              logger.error(
                `Country Director not found  LeaveId: ${_id} staffEmail: ${staffEmail}`
              );
              recurseProcessLeave(controller + 1, arr);
            }

            // change status to taken
            await Leave.updateOne(
              {
                _id
              },
              { $set: { status: 'Taken' } }
            );
            // sends mail to cd supervisor HR and notification about status
            // prettier-ignore
            // email to HR
            const text = `Hello  ${hr.fName}, 
  
  ${user.fName}  ${user.lName} will be off from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}${footer}.
                           `;
            Mailer(from, hr.email, subject, text);

            // email to CD
            const textCd = `Hello  ${cd.fName}, 
  
  ${user.fName}  ${user.lName} will be off from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}${footer}.
                           `;
            Mailer(from, cd.email, subject, textCd);

            // email to Supervisor
            const textSupervisor = `Hello  ${supervisor.fName}, 
  
  ${user.fName}  ${user.lName} will be off from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}${footer}.
                           `;
            Mailer(from, supervisor.email, subject, textSupervisor);
          } else {
          // Leave not home
          // change status to taken

            // change status to taken
            await Leave.updateOne(
              {
                _id
              },
              { $set: { status: 'Taken' } }
            );
            // sends mail to cd supervisor HR and notification about status
            // prettier-ignore
            // email to HR
            const text = `Hello  ${hr.fName}, 
  
  ${user.fName}  ${user.lName} will be off from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}${footer}.
                           `;
            Mailer(from, hr.email, subject, text);

            // email to Supervisor
            const textSupervisor = `Hello  ${supervisor.fName}, 
  
  ${user.fName}  ${user.lName} will be off from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}${footer}.
                           `;
            Mailer(from, supervisor.email, subject, textSupervisor);
          }
        }

        recurseProcessLeave(controller + 1, arr);
      }
    };

    await recurseProcessLeave(0, leaves);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
  }
};

module.exports = takeLeaves;
