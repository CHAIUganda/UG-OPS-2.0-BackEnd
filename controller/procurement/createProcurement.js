const { validationResult } = require('express-validator');
// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const Program = require('../../model/Program');
const errorToString = require('../../helpers/errorToString');
const Procurement = require('../../model/Procurement');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const storeNotification = require('../../helpers/storeNotification');

const createProcurement = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    pId,
    gId,
    objectiveId,
    staffId,
    category,
    descOfOther,
    priceRange,
    keyObjAsPerWp,
    keyActivitiesAsPerWp,
    specifications,
  } = req.body;
  // Pending Procurement Response, Pending Requestor Response, Pending LPO
  // LPO Pending Program Manager, LPO Pending Country Leadership, Approved
  const status = 'Pending Procurement Response';
  // set timezone to kampala
  let CurrentDate = moment().tz('Africa/Kampala').format();
  CurrentDate = new Date(CurrentDate);

  try {
    const user = await User.findOne({
      _id: staffId,
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
      });
    }

    // check if procurement Admin exists in System
    const procurementAdmin = await User.findOne({
      'roles.procurementAdmin': true,
    });
    if (!procurementAdmin) {
      return res.status(400).json({
        message: 'Procurement Admin is not Registered in the system',
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

    const subject = 'Uganda Operations Procurements';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `
  
Regards,
  
Uganda Operations
Clinton Health Access Initiative
  
Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    const procurementRemade = new Procurement({
      pId,
      gId,
      objectiveId,
      staffId,
      category,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
      status,
      createDate: CurrentDate,
    });
    // procurement id saved on staff collection
    await User.updateOne(
      {
        _id: staffId,
      },
      { $push: { procurements: procurementRemade._id } }
    );
    await procurementRemade.save();
    // mail procurement admin
    // prettier-ignore
    const textProcurementAdmin = `Hello  ${procurementAdmin.fName}, 

${user.fName}  ${user.lName} has sent in a Procurement Request. Please Login into Ugopps to respond to the request.${footer}.
                                      `;

    Mailer(from, procurementAdmin.email, subject, textProcurementAdmin, '');
    // save notification on user obj
    const notificationTitle = `${user.fName}  ${user.lName} has sent in a Procurement Request.`;
    const notificationType = '/procurement';
    const refType = 'Procurements';
    const refId = procurementRemade._id;
    // prettier-ignore
    // eslint-disable-next-line max-len
    const notificationMessage = `${user.fName}  ${user.lName} has sent in a Procurement Request.`;
    await storeNotification(
      procurementAdmin,
      notificationTitle,
      notificationMessage,
      notificationType,
      refType,
      refId
    );

    const procurement = {
      _id: procurementRemade._id,
      pId,
      gId,
      objectiveId,
      staffId,
      category,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
      staff: {
        email: user.email,
        fName: user.fName,
        lName: user.lName,
      },
      status,
      programId,
      program,
      programShortForm,
    };

    // send email notification to supervisor if leave is is pending
    res.status(201).json({
      message: 'Procurement Request has been sent successfully',
      procurement,
    });
  } catch (err) {
    debug(err.message);
    // eslint-disable-next-line no-console
    console.log(err.message);
    res.status(500).json({
      message: 'Error Creating Procurement Request',
    });
  }
};

module.exports = createProcurement;
