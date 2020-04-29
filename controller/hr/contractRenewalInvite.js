const debug = require('debug')('server');
const moment = require('moment-timezone');
const ics = require('ics');
const log4js = require('log4js');
const Contract = require('../../model/Contract');
const Program = require('../../model/Program');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const contractRenewalInvite = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    const expiryIn = 90;
    const expiryIn2 = 60;
    const expiryIn3 = 30;
    const user = await User.find({});
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
    const subject = 'Uganda Operations Contracts';
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
                  const textUser = `Hello  ${supervisor.fName}, 
        
${fName} ${lName}'s Contract will expiry in ${diff} days as of ${today.toDateString()}. This is an invitation to discuss their contract renewal. Please find attached the calender Invite "Add to your Calender"${footer}.
                                                    `;
                  const cc = `${programMngr.email},${hr.email}`;
                  // Create new Calendar and set optional fields

                  // create a new event
                  const meetstartDate = moment()
                    .tz('Africa/Kampala')
                    .format('YYYY-M-D-H-m')
                    .split('-');
                  const event = {
                    start: meetstartDate,
                    duration: { hours: 1, minutes: 30 },
                    title: 'Staff Contract Renewal Invite',
                    description: `${fName} ${lName}'s Contract will expiry in ${diff} days, this is an invite to initiate their contract renewal process`,
                    location: 'Lawns',
                    url: 'https://ugops.clintonhealthaccess.org',
                    geo: { lat: 0.34002, lon: 32.591718 },
                    categories: ['Chai', '8 Moyo Close', 'Kampala'],
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                    organizer: {
                      name: 'CHAI Uganda Operations',
                      email: 'UGOperations@clintonhealthaccess.org',
                    },
                    attendees: [
                      {
                        name: `${programMngr.fName} ${programMngr.lName}`,
                        email: programMngr.email,
                        rsvp: true,
                        partstat: 'ACCEPTED',
                        role: 'REQ-PARTICIPANT',
                      },
                      {
                        name: `${hr.fName} ${hr.lName}`,
                        email: hr.email,
                        role: 'REQ-PARTICIPANT',
                      },
                    ],
                  };
                  let content;
                  await ics.createEvent(event, (error, value) => {
                    if (error) {
                      console.log(error);
                      return;
                    }
                    content = value;
                  });
                  Mailer(
                    from,
                    supervisor.email,
                    subject,
                    textUser,
                    cc,
                    content
                  );
                  recurseProcessLeave(controller + 1, arr);
                } else {
                  recurseProcessLeave(controller + 1, arr);
                }

                recurseProcessLeave(controller + 1, arr);
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
