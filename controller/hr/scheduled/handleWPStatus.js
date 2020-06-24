const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const WorkPermit = require('../../../model/WorkPermit');
const Program = require('../../../model/Program');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');

const handleWPStatus = async () => {
  try {
    const logger = log4js.getLogger('Timed');
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
        let workPermitStartDate;
        let workPermitEndDate;

        if (programName) {
          programManagerId = programName.programManagerId;
          // check if PM exists in System.. will be sent an email
          const programMngr = await User.findOne({ _id: programManagerId });
          if (!programMngr) {
            logger.error(
              `Program Manager not found with ID: ${programManagerId}`
            );
            recurseProcessLeave(controller + 1, arr);
          } else {
            const workPermit = await WorkPermit.findOne({
              _userId: _id,
            });

            if (!workPermit) {
              logger.error(`${lName} ${fName} Has no Active WorkPermit`);
              recurseProcessLeave(controller + 1, arr);
            } else {
              // eslint-disable-next-line no-lonely-if
              if (workPermit.workPermitStatus === 'ACTIVE') {
                workPermitStartDate = workPermit.workPermitStartDate;
                workPermitEndDate = workPermit.workPermitEndDate;
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
                  endDate = new Date(endDate);
                  workPermitStartDate = new Date(workPermitStartDate);
                  workPermitEndDate = new Date(workPermitEndDate);
                  if (
                    moment(today.toDateString()).isSame(endDate.toDateString())
                  ) {
                    // change Contract status

                    await WorkPermit.updateOne(
                      {
                        _id: workPermit._id,
                      },
                      { $set: { workPermitStatus: 'Expired' } }
                    );
                    // email to HR
                    const subject = 'Work Permit Expiry reminder';
                    // prettier-ignore
                    const textUser = `Dear  ${hr.fName}, 
        
${fName} ${lName}'s Work Permit that ran from ${workPermitStartDate.toDateString()} to  ${workPermitEndDate.toDateString()} has expired today. ${footer}.
                                                    `;
                    const cc = `${programMngr.email},${supervisor.email}`;
                    Mailer(from, supervisor.email, subject, textUser, cc);
                    recurseProcessLeave(controller + 1, arr);
                  } else {
                    recurseProcessLeave(controller + 1, arr);
                  }
                }
              } else if (workPermit.workPermitStatus === 'Pending') {
                workPermitStartDate = workPermit.workPermitStartDate;
                workPermitEndDate = workPermit.workPermitEndDate;
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
                  let startDate = workPermit.workPermitStartDate;
                  // set timezone to kampala
                  const CurrentDate = moment().tz('Africa/Kampala').format();
                  const today = new Date(CurrentDate);
                  startDate = moment(startDate);
                  startDate = new Date(startDate);
                  workPermitStartDate = new Date(workPermitStartDate);
                  workPermitEndDate = new Date(workPermitEndDate);
                  if (
                    moment(today.toDateString()).isSame(
                      startDate.toDateString()
                    )
                  ) {
                    // change Contract status

                    await WorkPermit.updateOne(
                      {
                        _id: workPermit._id,
                      },
                      { $set: { workPermitStatus: 'ACTIVE' } }
                    );
                    // email to HR
                    const subject = 'Work Permit Activated';
                    // prettier-ignore
                    const textUser = `Dear  ${hr.fName}, 
        
${fName} ${lName}'s WorkPermit that rans from ${workPermitStartDate.toDateString()} to  ${workPermitEndDate.toDateString()} has been activated today. ${footer}.
                                                    `;
                    const cc = `${programMngr.email},${supervisor.email}`;
                    Mailer(from, supervisor.email, subject, textUser, cc);
                    recurseProcessLeave(controller + 1, arr);
                  } else {
                    recurseProcessLeave(controller + 1, arr);
                  }
                }
              } else {
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

module.exports = handleWPStatus;
