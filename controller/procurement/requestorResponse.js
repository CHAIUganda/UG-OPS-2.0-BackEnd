const { validationResult } = require('express-validator');
// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const Program = require('../../model/Program');
const errorToString = require('../../helpers/errorToString');
const Procurement = require('../../model/Procurement');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const storeNotification = require('../../helpers/storeNotification');
const updateItemStatus = require('./utilities/updateItemStatus');

const requestorResponse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    procurementId,
    responseId,
    choosenQuote,
  } = req.body;
  // Pending Procurement Response, Pending Requestor Response, Pending LPO Generation
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
    // check if procurement Admin exists in System
    const procurementAdmin = await User.findOne({
      'roles.procurementAdmin': true,
    });
    if (!procurementAdmin) {
      return res.status(400).json({
        message: 'Procurement Admin is not Registered in the system',
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

    const subject = `${requestor.fName} ${requestor.lName} has reponded to the procurement request`;
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;

    const status = 'Pending LPO Generation';
    // prettier-ignore
    // eslint-disable-next-line max-len
    const responses = chkProcurement.response.filter((chkresponse) => chkresponse._id.equals(responseId));
    if (responses.length < 1) {
      res.status(400).json({
        message: 'Response not found',
      });
    }
    const { category, itemIds } = responses[0];
    // recursively loop thru categories updating each cat item status
    const chkCategories = async (ctl, cat) => {
      if (ctl < cat.length) {
        const chkItems = async (ctlItem, itm) => {
          if (ctlItem < itm.length) {
            await updateItemStatus(
              procurementId,
              cat[ctl],
              itm[ctlItem],
              status
            );
            chkItems(ctlItem + 1, itm);
          } else {
            // success
          }
        };

        await chkItems(0, itemIds);

        chkCategories(ctl + 1, cat);
      } else {
        // success
      }
    };

    await chkCategories(0, category);

    // change procurement details
    await Procurement.updateOne(
      {
        _id: procurementId,
        'response._id': responseId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'response.$.choosenQuote': choosenQuote,
        },
      }
    );
    // mail procurement admin
    // prettier-ignore
    const textProcurementAdmin = `Hello  ${procurementAdmin.fName}, 

${requestor.fName} ${requestor.lName} has reponded to their procurement request. Please Login into Ugops to view its current status.${footer}.
                                      `;

    Mailer(from, procurementAdmin.email, subject, textProcurementAdmin, '');
    // save notification on user obj
    // prettier-ignore
    const notificationTitle = `${requestor.fName} ${requestor.lName} has reponded to the procurement request`;
    const notificationType = '/procurement';
    const refType = 'Procurements';
    const refId = procurementId;
    // prettier-ignore
    // eslint-disable-next-line max-len
    const notificationMessage = `${requestor.fName} ${requestor.lName} has reponded to their procurement request. Click on the notification to view its current status.`;
    await storeNotification(
      procurementAdmin,
      notificationTitle,
      notificationMessage,
      notificationType,
      refType,
      refId
    );
    const updatedProcurement = await Procurement.findOne({
      _id: procurementId,
    });
    const {
      pId,
      gId,
      objectCode,
      staffId,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
    } = updatedProcurement;

    const procurement = {
      _id: updatedProcurement._id,
      pId,
      gId,
      objectCode,
      staffId,
      category: updatedProcurement.category,
      descOfOther,
      priceRange,
      keyObjAsPerWp,
      keyActivitiesAsPerWp,
      specifications,
      response: updatedProcurement.response,
      staff: {
        email: requestor.email,
        fName: requestor.fName,
        lName: requestor.lName,
      },
      programId,
      program,
      programShortForm,
    };

    // send email notification to supervisor if leave is is pending
    res.status(201).json({
      message: 'Response has been sent successfully',
      procurement,
    });
  } catch (err) {
    debug(err.message);
    // eslint-disable-next-line no-console
    console.log(err.message);
    res.status(500).json({
      message: 'Error Responding to the Procurement Request',
    });
  }
};

module.exports = requestorResponse;
