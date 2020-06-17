const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const WorkPermit = require('../../../model/WorkPermit');
const Program = require('../../../model/Program');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');
const storeNotification = require('../../../helpers/storeNotification');

const workPermitRenewalReminder = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    const expiryIn = 90;
    const expiryIn2 = 60;
    const expiryIn3 = 30;
    const user = await User.find({
      $or: [
        {
          type: 'tcn',
        },
        {
          type: 'expat',
        },
      ],
    });
    user.password = undefined;
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
    const subject = 'Uganda Operations Work Permits';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;
    let programManagerId;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        // eslint-disable-next-line object-curly-newline
        const { _id, fName, lName, programId, supervisorEmail } = arr[
          controller
        ];
        const programName = await Program.findOne({
          _id: programId,
        });

        if (programName) {
          programManagerId = programName.programManagerId;
          // check if PM exists in System
          const programMngr = await User.findOne({ _id: programManagerId });
          if (!programMngr) {
            logger.error(
              `Program Manager not found with ID: ${programManagerId}`
            );
            recurseProcessLeave(controller + 1, arr);
          } else {
            const workPermit = await WorkPermit.findOne({
              _userId: _id,
              workPermitStatus: 'ACTIVE',
            });

            if (!workPermit) {
              logger.error(`${lName} ${fName} Has no Active Work Permit`);
              recurseProcessLeave(controller + 1, arr);
            } else {
              // check if Supervisor exists in System
              const supervisor = await User.findOne({
                email: supervisorEmail,
              });
              if (!supervisor) {
                logger.error(
                  `Supervisor not found with email: ${supervisorEmail}`
                );
                recurseProcessLeave(controller + 1, arr);
              } else {
                let endDate = workPermit.workPermitEndDate;
                // set timezone to kampala
                const CurrentDate = moment().tz('Africa/Kampala').format();
                const today = new Date(CurrentDate);
                endDate = moment(endDate);
                const diff = endDate.diff(CurrentDate, 'days') + 1;
                // send invite in 3 2 1 months to expiry

                if (
                  // prettier-ignore
                  // eslint-disable-next-line
                  (workPermit.wpDismiss == false && workPermit.wpSnooze == false) &&
                // prettier-ignore
                // eslint-disable-next-line
                (diff == expiryIn || diff == expiryIn2 || diff == expiryIn3)
                ) {
                  // email to staff
                  // prettier-ignore
                  const textUser = `Hello  ${hr.fName}, 
        
${fName} ${lName}'s Work Permit will expiry in ${diff} days as of ${today.toDateString()}. This is a reminder to start their work permit renewal process."${footer}.
                                                    `;
                  const cc = `${programMngr.email},${supervisor.email}`;
                  Mailer(from, hr.email, subject, textUser, cc);
                  // save notification on user obj
                  const notificationTitle = `${fName} ${lName}'s WorkPermit will expiry in ${diff} days`;
                  const notificationType = '/hr/WorkPermitsExpiry';
                  const refType = 'Work Permits';
                  const refId = workPermit._id;
                  // prettier-ignore
                  // eslint-disable-next-line max-len
                  const notificationMessage = `${fName} ${lName}'s Work Permit will expiry in ${diff} days, this is a notification to initiate their contract renewal process.`;
                  await storeNotification(
                    supervisor,
                    notificationTitle,
                    notificationMessage,
                    null,
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
                    programMngr,
                    notificationTitle,
                    notificationMessage,
                    null,
                    refType,
                    refId
                  );

                  recurseProcessLeave(controller + 1, arr);
                } else {
                  recurseProcessLeave(controller + 1, arr);
                }
              }
            }
          }
        } else {
          recurseProcessLeave(controller + 1, arr);
        }
      } else {
        console.log('out of loop');
      }
    };
    await recurseProcessLeave(0, user);
    console.log('finished');
  } catch (e) {
    debug(e.message);
    console.log(e.message);
  }
};

module.exports = workPermitRenewalReminder;
