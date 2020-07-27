const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const Leave = require('../../../model/Leave');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');
const storeNotification = require('../../../helpers/storeNotification');
const getLeaveDaysNo = require('../getLeaveDaysNo');
const PublicHoliday = require('../../../model/PublicHoliday');

const takeLeaves = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    // set timezone to kampala
    const CurrentDate = moment().tz('Africa/Kampala').format();
    const leaves = await Leave.find({ status: 'Approved' });
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      logger.error('HR not found in the system, Please Register the HR');
      console.log('HR not found in the system, Please Register the HR');
      const errorMessage = {
        code: 404,
        message: 'HR not found in the system, Please Register the HR',
      };
      throw errorMessage;
    }
    // initialize emailing necessities
    const subject = 'Leave Started';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { startDate, endDate, supervisorEmail, _id } = arr[controller];
        const staffEmail = arr[controller].staff.email;
        const publicHolidays = await PublicHoliday.find({});
        const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);

        // check if user exists
        const user = await User.findOne({
          email: staffEmail,
        });
        if (!user) {
          logger.error(`Staff not found. Email: ${staffEmail} LeaveId: ${_id}`);
          recurseProcessLeave(controller + 1, arr);
        } else {
          // check if Supervisor exists in System
          const supervisor = await User.findOne({ email: supervisorEmail });
          if (!supervisor) {
            logger.error(
              `Supervisor not found Email: ${supervisorEmail} LeaveId: ${_id} staffEmail: ${staffEmail}`
            );
            recurseProcessLeave(controller + 1, arr);
          } else {
            const today = new Date(CurrentDate);
            const leaveStart = new Date(startDate);
            if (
              moment(today.toDateString()).isSame(leaveStart.toDateString())
            ) {
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
                // email to staff
                const textUser = `Dear  ${user.fName}, 
  
You have started your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}.${footer}.
                           `;
                Mailer(from, user.email, subject, textUser, '');

                // email to HR
                const text = `Dear  ${hr.fName}, 
  
${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.${footer}
                           `;
                Mailer(from, hr.email, subject, text, '');

                // email to CD
                const textCd = `Dear  ${cd.fName}, 
  
${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.${footer}
                `;
                Mailer(from, cd.email, subject, textCd, '');

                // email to Supervisor
                const textSupervisor = `Dear  ${supervisor.fName}, 
  
${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.${footer}
                `;
                Mailer(from, supervisor.email, subject, textSupervisor, '');

                // save notification on user obj
                const notificationTitle = `${user.fName}  ${user.lName}'s Home Leave has started today`;
                const notificationType = null;
                const refType = 'Leaves';
                const refId = arr[controller]._id;
                // prettier-ignore
                // eslint-disable-next-line max-len
                const notificationMessage = `${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started.`;
                await storeNotification(
                  supervisor,
                  notificationTitle,
                  notificationMessage,
                  notificationType,
                  refType,
                  refId
                );
                await storeNotification(
                  hr,
                  notificationTitle,
                  notificationMessage,
                  notificationType,
                  refType,
                  refId
                );
                await storeNotification(
                  cd,
                  notificationTitle,
                  notificationMessage,
                  notificationType,
                  refType,
                  refId
                );
                recurseProcessLeave(controller + 1, arr);
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

                // email to staff
                const textUser = `Dear  ${user.fName}, 
  
You have started your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()}.${footer}
                           `;
                Mailer(from, user.email, subject, textUser, '');
                // email to HR
                const text = `Dear  ${hr.fName}, 
  
${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.${footer}
                           `;
                Mailer(from, hr.email, subject, text, '');

                // email to Supervisor
                const textSupervisor = `Dear  ${supervisor.fName}, 
  
${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.${footer}
                           `;
                Mailer(from, supervisor.email, subject, textSupervisor, '');
                // save notification on user obj
                const notificationTitle = `${user.fName}  ${user.lName}'s Leave has started today`;
                const notificationType = null;
                const refType = 'Leaves';
                const refId = arr[controller]._id;
                // prettier-ignore
                // eslint-disable-next-line max-len
                const notificationMessage = `${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${arr[controller].type} leave from ${arr[controller].startDate.toDateString()} to ${arr[controller].endDate.toDateString()} has started today.`;
                await storeNotification(
                  supervisor,
                  notificationTitle,
                  notificationMessage,
                  notificationType,
                  refType,
                  refId
                );
                await storeNotification(
                  hr,
                  notificationTitle,
                  notificationMessage,
                  notificationType,
                  refType,
                  refId
                );
                recurseProcessLeave(controller + 1, arr);
              }
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

module.exports = takeLeaves;
