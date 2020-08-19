const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const User = require('../../model/User');
const Program = require('../../model/Program');
const Travel = require('../../model/Travel');
const Mailer = require('../../helpers/Mailer');
const storeNotification = require('../../helpers/storeNotification');

const submitTravel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    employeeName,
    employeeEmail,
    travelLocation,
    typeOTrip,
    dates,
    employeeContact,
  } = req.body;

  try {
    const user = await User.findOne({
      email: employeeEmail,
    });
    if (!user) {
      return res.status(400).json({
        message: 'Staff Email does does not Exist',
      });
    }

    const securityTeam = await User.find({ 'roles.securityTeam': true });
    if (!securityTeam) {
      return res.status(400).json({
        message: 'No one is registered as part of the Security Team',
      });
    }
    const { programId } = user;
    let program;
    let programShortForm;

    const userProgram = await Program.findOne({
      _id: programId,
    });

    if (!userProgram) {
      program = null;
      programShortForm = null;
      // eslint-disable-next-line no-else-return
    } else {
      program = userProgram.name;
      programShortForm = userProgram.shortForm;
    }
    const subject = `${user.fName}  ${user.lName} has submited a travel tracker response`;
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;

    const travelRemade = new Travel({
      employeeName,
      employeeEmail,
      travelLocation,
      typeOTrip,
      dates,
      employeeContact,
    });
    const travelDate = new Date(dates.travelDate);
    const returnDate = new Date(dates.returnDate);
    // leave id saved on staff collection after it has been planned, it the status that is updated
    await User.updateOne(
      {
        email: employeeEmail,
      },
      { $push: { travels: travelRemade._id } }
    );
    await travelRemade.save();
    // mail security Team
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { fName, email } = arr[controller];

        // email security team member
        // prettier-ignore
        const textSecurityTeamMember = `Dear  ${fName}, 

${user.fName}  ${user.lName} will be going on a ${typeOTrip} trip to ${travelLocation} from ${travelDate.toDateString()} to ${returnDate.toDateString()}. Contact information while on travel is ${employeeContact}. ${footer}
                                          `;
        Mailer(from, email, subject, textSecurityTeamMember, '');
        // save notification on user obj
        const notificationTitle = `${user.fName}  ${user.lName} will be going on a ${typeOTrip} trip`;
        const notificationType = '/hr/allTravelTracker';
        const refType = 'TravelTracker';
        const refId = travelRemade._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const notificationMessage = `${user.fName}  ${user.lName} will be going on a ${typeOTrip} trip to ${travelLocation} from ${travelDate.toDateString()} to ${returnDate.toDateString()}. Contact information while on travel is ${employeeContact}.`;

        if (arr[controller].roles.hr === true) {
          await storeNotification(
            arr[controller],
            notificationTitle,
            notificationMessage,
            notificationType,
            refType,
            refId
          );
        } else {
          await storeNotification(
            arr[controller],
            notificationTitle,
            notificationMessage,
            null,
            refType,
            refId
          );
        }

        recurseProcessLeave(controller + 1, arr);
      } else {
        const travel = {
          _id: travelRemade._id,
          employeeName,
          employeeEmail,
          travelLocation,
          typeOTrip,
          dates,
          employeeContact,
          programId,
          program,
          programShortForm,
        };

        // send email notification to supervisor if leave is is pending
        res.status(201).json({
          message: 'Travel Response Created successfully',
          travel,
        });
      }
    };
    await recurseProcessLeave(0, securityTeam);
  } catch (err) {
    debug(err.message);
    // eslint-disable-next-line no-console
    console.log(err.message);
    res.status(500).json({
      message: 'Error Creating Travel response',
    });
  }
};

module.exports = submitTravel;
