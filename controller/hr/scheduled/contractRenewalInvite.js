const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const Contract = require('../../../model/Contract');
const Program = require('../../../model/Program');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');
const storeNotification = require('../../../helpers/storeNotification');

const contractRenewalInvite = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    const expiryIn = 90;
    const expiryIn2 = 60;
    const expiryIn3 = 30;
    const user = await User.find({});
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
    const subject = 'Contract Expiry reminder';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;
    let programManagerId;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
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
            const contract = await Contract.findOne({
              _userId: _id,
              contractStatus: 'ACTIVE',
            });

            if (!contract) {
              logger.error(`${lName} ${fName} Has no Active Contract`);
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
                let endDate = contract.contractEndDate;
                // set timezone to kampala
                const CurrentDate = moment().tz('Africa/Kampala').format();
                const today = new Date(CurrentDate);
                endDate = moment(endDate);
                const diff = endDate.diff(CurrentDate, 'days') + 1;
                // send invite in 3 2 1 months to expiry

                if (
                  // prettier-ignore
                  // eslint-disable-next-line
                  (contract.contractDismiss == false && contract.contractSnooze == false) &&
                // prettier-ignore
                // eslint-disable-next-line
                (diff == expiryIn || diff == expiryIn2 || diff == expiryIn3)
                ) {
                  // email to staff
                  // prettier-ignore
                  const textUser = `Hello  ${hr.fName}, 
        
${fName} ${lName}'s Contract will expiry in ${diff} days as of ${today.toDateString()}. This is a reminder to start  the contract renewal process.${footer}.
                                                    `;
                  const cc = `${programMngr.email},${supervisor.email}`;
                  Mailer(from, hr.email, subject, textUser, cc);
                  // save notification on user obj
                  const notificationTitle = `${fName} ${lName}'s Contract will expiry in ${diff} days`;
                  const notificationType = '/hr/ContractsExpiry';
                  const refType = 'Contracts';
                  const refId = contract._id;
                  // prettier-ignore
                  // eslint-disable-next-line max-len
                  const notificationMessage = `${fName} ${lName}'s Contract will expiry in ${diff} days as of ${today.toDateString()}. This is a reminder to start the contract renewal process.`;
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
      }
    };
    await recurseProcessLeave(0, user);
  } catch (e) {
    debug(e.message);
    console.log(e.message);
  }
};

module.exports = contractRenewalInvite;
