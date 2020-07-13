// const moment = require('moment-timezone');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const { validationResult } = require('express-validator');
const Procurement = require('../../model/Procurement');
const errorToString = require('../../helpers/errorToString');

const additionSupportnDocsOnRequest = async (req, res) => {
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
      const data = [];
      const { procurementId } = req.body;
      // loop all files

      const recurseProcessLeave = async (controller, arr) => {
        if (controller < arr.length) {
          // eslint-disable-next-line object-curly-newline
          const addDoc = arr[controller];

          // move addDoc to uploads directory
          // addDoc.mv(`./uploads/supportnDocs/${addDoc.name}`);
          const nm = addDoc.name.split('.');
          const fileType = 'SupportnDoc';
          const fileex = nm[nm.length - 1];
          const fileName = `${procurementId}_${moment(CurrentDate).format(
            'YYYY-MM-DD'
          )}_${fileType}_${controller + 1}.${fileex}`;

          addDoc.mv(`${__dirname}\\uploads\\supportnDocs\\${fileName}`);
          const procurement = await Procurement.findOne({
            _id: procurementId,
          });
          if (!procurement) {
            return res.status(400).json({
              message: 'Procurement Request does not Exist',
            });
          }
          const additionalSupportnDocs = {
            // eslint-disable-next-line max-len
            name: fileName,
            desc: '',
            path: `${__dirname}\\uploads\\supportnDocs\\${fileName}`,
          };
          // additional supporting docs on a P request are stored in 1 array
          procurement.additionalSupportnDocs.push(additionalSupportnDocs);
          await procurement.save();

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
            message: 'Additional Files submitted successfully',
            data,
          });
        }
      };
      await recurseProcessLeave(0, req.files.addnDocs);
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

module.exports = additionSupportnDocsOnRequest;
