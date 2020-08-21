const Procurement = require('../../../model/Procurement');

const storeQuotationFile = async (
  addDoc,
  procurementId,
  responseId,
  quoteNumber,
  fileName
) => {
  if (quoteNumber === 'Printing') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };
    // additional supporting docs on a P request are stored in 1 array
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.printingArtAndDesign._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.printingArtAndDesign.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (quoteNumber === 'Car Hire') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };

    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.carHire._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.carHire.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (quoteNumber === 'Conference Facilities') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };

    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.conferenceFacilities._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.conferenceFacilities.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  }
};

module.exports = storeQuotationFile;
