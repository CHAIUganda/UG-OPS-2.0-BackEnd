const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const Contract = require('../../model/Contract');
const Program = require('../../model/Program');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const handleContractStatus = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    const user = await User.find({});
    user.password = undefined;
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      logger.error('HR not found in the system, Please Register the HR');
      console.log('HR not found in the system, Please Register the HR');
      const errorMessage = {
        code: 403,
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
        let contractStartDate;
        let contractEndDate;

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
            const contract = await Contract.findOne({
              _userId: _id,
            });

            if (!contract) {
              logger.error(`${lName} ${fName} Has no Active Contract`);
              recurseProcessLeave(controller + 1, arr);
            } else {
              // eslint-disable-next-line no-lonely-if
              if (contract.contractStatus === 'ACTIVE') {
                contractStartDate = contract.contractStartDate;
                contractEndDate = contract.contractEndDate;
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
                  endDate = new Date(endDate);
                  contractStartDate = new Date(contractStartDate);
                  contractEndDate = new Date(contractEndDate);
                  if (
                    moment(today.toDateString()).isSame(endDate.toDateString())
                  ) {
                    // change Contract status

                    await Contract.updateOne(
                      {
                        _id: contract._id,
                      },
                      { $set: { contractStatus: 'Expired' } }
                    );
                    // email to HR
                    // prettier-ignore
                    const textUser = `Hello  ${hr.fName}, 
        
${fName} ${lName}'s Contract that ran from ${contractStartDate.toDateString()} to  ${contractEndDate.toDateString()} has expired today. ${footer}.
                                                    `;
                    const cc = `${programMngr.email},${supervisor.email}`;
                    Mailer(from, supervisor.email, subject, textUser, cc);
                    recurseProcessLeave(controller + 1, arr);
                  } else {
                    recurseProcessLeave(controller + 1, arr);
                  }

                  recurseProcessLeave(controller + 1, arr);
                }
              } else if (contract.contractStatus === 'Pending') {
                contractStartDate = contract.contractStartDate;
                contractEndDate = contract.contractEndDate;
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
                  let startDate = contract.contractStartDate;
                  // set timezone to kampala
                  const CurrentDate = moment().tz('Africa/Kampala').format();
                  const today = new Date(CurrentDate);
                  startDate = moment(startDate);
                  startDate = new Date(startDate);
                  contractStartDate = new Date(contractStartDate);
                  contractEndDate = new Date(contractEndDate);
                  if (
                    moment(today.toDateString()).isSame(
                      startDate.toDateString()
                    )
                  ) {
                    // change Contract status

                    await Contract.updateOne(
                      {
                        _id: contract._id,
                      },
                      { $set: { contractStatus: 'ACTIVE' } }
                    );
                    // email to HR
                    // prettier-ignore
                    const textUser = `Hello  ${hr.fName}, 
        
${fName} ${lName}'s Contract that rans from ${contractStartDate.toDateString()} to  ${contractEndDate.toDateString()} has been activated today. ${footer}.
                                                    `;
                    const cc = `${programMngr.email},${supervisor.email}`;
                    Mailer(from, supervisor.email, subject, textUser, cc);
                    recurseProcessLeave(controller + 1, arr);
                  } else {
                    recurseProcessLeave(controller + 1, arr);
                  }

                  recurseProcessLeave(controller + 1, arr);
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

module.exports = handleContractStatus;
