// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const { validationResult } = require('express-validator');
const Procurement = require('../../model/Procurement');
const User = require('../../model/User');
const errorToString = require('../../helpers/errorToString');
const storeQuotationFile = require('./utilities/storeQuotationFile');

const attachQuoteOnResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errorToString(errors.array()),
      });
    }
    // set timezone to kampala
    let CurrentDate = moment()
      .tz('Africa/Kampala')
      .format('YYYY-MM-DD HH:mm:ss');
    CurrentDate = new Date(CurrentDate);
    if (!req.files) {
      res.status(400).json({
        message: 'No files Selected for Uploading',
      });
    } else {
      // eslint-disable-next-line no-lonely-if
      if (req.files.addnDocs.length > 1) {
        res.status(400).json({
          message: 'Please send 1 quotation at a time',
        });
      } else {
        const data = [];
        // quoteNumber can be quote1 quote2 quote3
        const { procurementId, responseId, quoteNumber } = req.body;
        const procurement = await Procurement.findOne({
          _id: procurementId,
        });
        if (!procurement) {
          return res.status(400).json({
            message: 'Procurement Request does not Exist',
          });
          // eslint-disable-next-line no-else-return
        } else {
          const user = await User.findOne({
            _id: procurement.staffId,
          });
          if (!user) {
            return res.status(400).json({
              message: 'User does not Exist',
            });
            // eslint-disable-next-line no-else-return
          } else {
            // prettier-ignore
            // eslint-disable-next-line no-lonely-if
            if (quoteNumber === 'quote1' || quoteNumber === 'quote2' || quoteNumber === 'quote3') {
              // loop all files
              const recurseProcessLeave = async (controller, arr) => {
                if (arr.length == null) {
                  // eslint-disable-next-line object-curly-newline
                  const addDoc = arr;
                  const nm = addDoc.name.split('.');
                  const fileex = nm[nm.length - 1];
                  const fileLabel = nm[nm.length - 2];
                  const requestor = `${user.fName}_${user.lName}`;
                  const lastFive = procurementId.slice(procurementId.length - 5);
                  const fileName = `${moment(CurrentDate).format(
                    'YYYY-MM-DD'
                  )}_${requestor}_${lastFive}_${fileLabel}_${quoteNumber}.${fileex}`;

                  await storeQuotationFile(
                    addDoc,
                    procurementId,
                    responseId,
                    quoteNumber,
                    fileName
                  );

                  // push file details
                  data.push({
                    name: addDoc.name,
                    mimetype: addDoc.mimetype,
                    size: addDoc.size,
                  });
                  res.status(201).json({
                    message: 'Quotation submitted successfully',
                    data,
                  });
                } else {
                  // eslint-disable-next-line no-lonely-if
                  if (controller < arr.length) {
                  // eslint-disable-next-line object-curly-newline
                    const addDoc = arr[controller];
                    const nm = addDoc.name.split('.');
                    const fileex = nm[nm.length - 1];
                    const fileLabel = nm[nm.length - 2];
                    const requestor = `${user.fName}_${user.lName}`;
                    const lastFive = procurementId.slice(procurementId.length - 5);
                    const fileName = `${moment(CurrentDate).format(
                      'YYYY-MM-DD'
                    )}_${requestor}_${lastFive}_${fileLabel}_${quoteNumber}.${fileex}`;

                    await storeQuotationFile(
                      addDoc,
                      procurementId,
                      responseId,
                      quoteNumber,
                      fileName
                    );

                    // push file details
                    data.push({
                      name: addDoc.name,
                      mimetype: addDoc.mimetype,
                      size: addDoc.size,
                    });
                    recurseProcessLeave(controller + 1, arr);
                  } else {
                  // send response
                    res.status(201).json({
                      message: 'Quotation submitted successfully',
                      data,
                    });
                  }
                }
              };
              await recurseProcessLeave(0, req.files.addnDocs);
            } else {
              return res.status(400).json({
                message: 'Invalid quote number selected',
              });
            }
          }
        }
      }
    }
  } catch (err) {
    debug(err.message);
    // eslint-disable-next-line no-console
    console.log(err.message);
    res.status(500).json({
      message: 'Error occured during files upload',
    });
  }
};

module.exports = attachQuoteOnResponse;
