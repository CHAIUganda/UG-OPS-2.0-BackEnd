const Procurement = require('../../../model/Procurement');

const storeItemFile = async (
  addDoc,
  procurementId,
  category,
  itemId,
  fileName
) => {
  if (category === 'Printing') {
    addDoc.mv(`${__dirname}\\..\\uploads\\supportnDocs\\Printing\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\Printing\\${fileName}`,
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
  } else if (category === 'Car Hire') {
    addDoc.mv(`${__dirname}\\..\\uploads\\supportnDocs\\CarHire\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\CarHire\\${fileName}`,
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
  } else if (category === 'Conference Facilities') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\ConferenceFacilities\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\ConferenceFacilities\\${fileName}`,
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
  } else if (category === 'Stationery') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\Stationery\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\Stationery\\${fileName}`,
    };

    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.stationery._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.stationery.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (category === 'Data Collectors') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\DataCollectors\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\DataCollectors\\${fileName}`,
    };
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.dataCollectors._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.dataCollectors.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (category === 'Accomodation') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\Accomodation\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\Accomodation\\${fileName}`,
    };
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.accomodation._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.accomodation.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (category === 'Medical Equipment') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\MedicalEquipment\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\MedicalEquipment\\${fileName}`,
    };
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.medicalEquipment._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.medicalEquipment.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (category === 'Computers & Accessories') {
    addDoc.mv(
      `${__dirname}\\..\\uploads\\supportnDocs\\ComputersAndAccessories\\${fileName}`
    );
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\ComputersAndAccessories\\${fileName}`,
    };
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.computerAndAccessories._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.computerAndAccessories.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  } else if (category === 'Other') {
    addDoc.mv(`${__dirname}\\..\\uploads\\supportnDocs\\Other\\${fileName}`);
    const additionalSupportnDocs = {
      // eslint-disable-next-line max-len
      name: fileName,
      path: `supportnDocs\\Other\\${fileName}`,
    };
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.other._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $push: {
          'specifications.other.$.additionalSupportnDocs': additionalSupportnDocs,
        },
      }
    );
  }
};

module.exports = storeItemFile;
