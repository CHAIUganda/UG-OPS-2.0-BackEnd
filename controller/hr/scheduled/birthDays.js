const debug = require('debug')('server');
const log4js = require('log4js');
const moment = require('moment-timezone');
const User = require('../../../model/User');
const Mailer = require('../../../helpers/Mailer');

const birthDays = async () => {
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
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { birthDate, fName, lName } = arr[controller];
        const subject = `Today is ${fName} ${lName}'s Birthday`;
        // set timezone to kampala
        const CurrentDate = moment().tz('Africa/Kampala').format('YYYY-MM-DD');
        const today = new Date(CurrentDate);
        let staffBirthDate;
        if (birthDate) {
          staffBirthDate = moment(birthDate)
            .tz('Africa/Kampala')
            .format('YYYY-MM-DD');
        } else {
          staffBirthDate = moment(birthDate)
            .add(5, 'days')
            .format('YYYY-MM-DD');
        }

        // prettier-ignore
        const bd = `${new Date().getFullYear()}-${staffBirthDate.split('-')[1]}-${staffBirthDate.split('-')[2]}`;
        // check if bd is same as today and send bd greetings
        if (moment(CurrentDate).isSame(bd)) {
          // email to staff
          // email to staff
          // prettier-ignore
          const textUser = `Hello  ${hr.fName}, 
        
Today: ${today.toDateString()} is ${fName} ${lName}'s birthday. Please wish them a happy birthday.${footer}.
                                                    `;
          // to cc 2nd person with birthday wishes role
          const cc = '';
          Mailer(from, hr.email, subject, textUser, cc);
          recurseProcessLeave(controller + 1, arr);
        } else {
          recurseProcessLeave(controller + 1, arr);
        }
      }
    };

    await recurseProcessLeave(0, user);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
  }
};

module.exports = birthDays;
