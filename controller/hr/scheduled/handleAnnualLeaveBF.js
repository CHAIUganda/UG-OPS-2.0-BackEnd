const debug = require('debug')('server');
const moment = require('moment-timezone');
const log4js = require('log4js');
const Contract = require('../../../model/Contract');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');
const getLeavesTaken = require('../../leave/getLeavesTaken');

const handleAnnualLeaveBF = async () => {
  try {
    const logger = log4js.getLogger('Timed');
    const user = await User.find({});
    // initialize emailing necessities
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
        const { _id, fName, lName, annualLeaveBF } = arr[controller];
        const contract = await Contract.findOne({
          _userId: _id,
          contractStatus: 'ACTIVE',
        });

        if (!contract) {
          logger.error(`${lName} ${fName} Has no Active Contract`);
          recurseProcessLeave(controller + 1, arr);
        } else {
          let accruedAnnualLeave;
          let CurrentDate = moment().tz('Africa/Kampala').format();
          CurrentDate = new Date(CurrentDate);
          // compute accrued days fromstart of contract
          // current date since not leave enddate provided here
          const endDateMonth = CurrentDate.getMonth();
          const leaveEndDate = moment(CurrentDate);
          const contractStartDate = moment(contract.contractStartDate);
          let monthOnContract = leaveEndDate.diff(contractStartDate, 'months');
          monthOnContract = Math.trunc(monthOnContract);
          // Computing Annual Leave
          if (monthOnContract === 0) {
            accruedAnnualLeave = 0;
          } else {
            // acrue anual leave basing calender yr if current yr diff frm contract start yr
            // eslint-disable-next-line no-lonely-if
            if (moment(CurrentDate).isAfter(contractStartDate, 'year')) {
              if (endDateMonth === 0) {
                accruedAnnualLeave = 0;
              } else {
                accruedAnnualLeave = Math.trunc(endDateMonth * 1.75);
              }
            } else {
              accruedAnnualLeave = Math.trunc(monthOnContract * 1.75);
            }
          }
          let setALBF;
          const leaveDetails = await getLeavesTaken(user);
          const { homeLeaveTaken, annualLeaveTaken } = leaveDetails;
          // prettier-ignore
          const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
          // change user BF value
          // prettier-ignore
          // eslint-disable-next-line max-len
          const annualLeaveBal = totalAcruedAnualLeavePlusAnualLeaveBF - homeLeaveTaken - annualLeaveTaken;
          // eslint-disable-next-line eqeqeq
          if (annualLeaveBal > 7 || annualLeaveBal == 7) {
            setALBF = 7;
          } else {
            setALBF = annualLeaveBal;
          }

          await User.updateOne(
            {
              _id,
            },
            { $set: { annualLeaveBF: setALBF } }
          );
          // email to staff
          const subject = 'Annual Leave Brought Forward';
          // prettier-ignore
          const textUser = `Dear  ${arr[controller].fName}, 
        
You have ${setALBF} day${setALBF === 1 ? '' : 's'} of Annual Leave that have been brought forward. ${footer}.
                                                    `;
          Mailer(from, arr[controller].email, subject, textUser, '');
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

module.exports = handleAnnualLeaveBF;
