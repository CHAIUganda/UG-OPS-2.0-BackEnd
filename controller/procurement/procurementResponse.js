const { validationResult } = require('express-validator');
// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const Program = require('../../model/Program');
const errorToString = require('../../helpers/errorToString');
const Procurement = require('../../model/Procurement');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const storeNotification = require('../../helpers/storeNotification');

const procurementResponse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    procurementId,
    requires3Quote,
    recommendedVendor,
    recommendedVendorJustification,
    quotations,
  } = req.body;
  // Pending Procurement Response, Pending Requestor Response, Pending Procurement Response
  // LPO Pending Program Manager, LPO Pending Country Leadership, Approved

  try {
    // check if route requestor is procurementAdmin

    const chkProcurement = await Procurement.findOne({
      _id: procurementId,
    });
    if (!chkProcurement) {
      return res.status(400).json({
        message: 'Procurement Request does not Exist',
      });
    }

    const requestor = await User.findOne({
      _id: chkProcurement.staffId,
    });
    if (!requestor) {
      return res.status(400).json({
        message: 'Requesting User does not Exist',
      });
    }

    const { programId } = requestor;
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

    let status;

    if (requires3Quote === true) {
      status = 'Pending Requestor Response';
    } else {
      status = 'Pending LPO';
    }

    // change procurement details
    await Procurement.updateOne(
      {
        _id: procurementId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          status,
          response: {
            requires3Quote,
            recommendedVendor,
            recommendedVendorJustification,
            quotations,
          },
        },
      }
    );
    // mail procurement admin
    // prettier-ignore
    const textRequestor = `Hello  ${requestor.fName}, 

The procurement Team has responded to your request. Please Login into Ugopps to view its current status.${footer}.
                                      `;

    Mailer(from, requestor.email, subject, textRequestor, '');
    // save notification on user obj
    // prettier-ignore
    const notificationTitle = 'The procurement Team has responded to your request.';
    const notificationType = '/procurement';
    const refType = 'Procurements';
    const refId = procurementId;
    // prettier-ignore
    // eslint-disable-next-line max-len
    const notificationMessage = 'The procurement Team has responded to your request. Click on the notification to view its current status.';
    await storeNotification(
      requestor,
      notificationTitle,
      notificationMessage,
      notificationType,
      refType,
      refId
    );

    const {
      pId,
      gId,
      objectCode,
      staffId,
      category,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
    } = chkProcurement;

    const procurement = {
      _id: chkProcurement._id,
      pId,
      gId,
      objectCode,
      staffId,
      category,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
      response: {
        requires3Quote,
        recommendedVendor,
        recommendedVendorJustification,
        quotations,
      },
      staff: {
        email: requestor.email,
        fName: requestor.fName,
        lName: requestor.lName,
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

module.exports = procurementResponse;
