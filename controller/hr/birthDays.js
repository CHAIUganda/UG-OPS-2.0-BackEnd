const debug = require('debug')('server');
const moment = require('moment-timezone');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');

const birthDays = async () => {
  try {
    const user = await User.find({});
    user.password = undefined;

    // initialize emailing necessities
    const chaiAll = 'paulsseb@hotmail.com';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

From the entire team.`;
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { birthDate, email, fName } = arr[controller];
        const subject = `Happy Birthday ${fName}!`;
        // set timezone to kampala
        const CurrentDate = moment().tz('Africa/Kampala').format('YYYY/MM/DD');
        const today = new Date(CurrentDate);
        let staffBirthDate;
        if (birthDate) {
          staffBirthDate = moment(birthDate)
            .tz('Africa/Kampala')
            .format('YYYY/MM/DD');
        } else {
          staffBirthDate = moment(birthDate)
            .add(5, 'days')
            .format('YYYY/MM/DD');
        }

        // prettier-ignore
        let bd = `${new Date().getFullYear()}-${staffBirthDate.split('/')[1]}-${staffBirthDate.split('/')[2]}`;

        bd = new Date(bd);
        // check if bd is same as today and send bd greetings
        if (moment(today.toDateString()).isSame(bd.toDateString())) {
          // email to staff
          // prettier-ignore
          const imgDay = `bd${today.getDay() + 1}.jpg`;
          const htmlAttach = {
            // prettier-ignore
            html: `Embedded image: <img src="${today.getDay() + 1}@kreata.ee"/>`,
            attachments: [
              {
                filename: imgDay,
                path: `./hr/bd images/${imgDay}`,
                cid: `${today.getDay() + 1}@kreata.ee`,
              },
            ],
          };
          const textUser = `Hello  ${fName}, 
  
Happy BirthDay${footer}.
                                              `;
          Mailer(
            from,
            email,
            subject,
            textUser,
            chaiAll,
            undefined,
            htmlAttach
          );
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