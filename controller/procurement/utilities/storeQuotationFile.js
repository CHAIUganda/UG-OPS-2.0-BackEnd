const Procurement = require('../../../model/Procurement');

const storeQuotationFile = async (
  addDoc,
  procurementId,
  responseId,
  quoteNumber,
  fileName
) => {
  if (quoteNumber === 'quote1') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const quoteFile = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };
    // additional supporting docs on a P request are stored in 1 array
    await Procurement.updateOne(
      {
        _id: procurementId,
        'response._id': responseId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'response.$.quotations.quote1.quoteFile': quoteFile,
        },
      }
    );
  } else if (quoteNumber === 'quote2') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const quoteFile = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };
    // additional supporting docs on a P request are stored in 1 array
    await Procurement.updateOne(
      {
        _id: procurementId,
        'response._id': responseId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'response.$.quotations.quote2.quoteFile': quoteFile,
        },
      }
    );
  } else if (quoteNumber === 'quote3') {
    addDoc.mv(`${__dirname}\\..\\uploads\\quotations\\${fileName}`);
    const quoteFile = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `quotations\\${fileName}`,
    };
    // additional supporting docs on a P request are stored in 1 array
    await Procurement.updateOne(
      {
        _id: procurementId,
        'response._id': responseId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'response.$.quotations.quote3.quoteFile': quoteFile,
        },
      }
    );
  }
};

module.exports = storeQuotationFile;
