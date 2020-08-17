const Procurement = require('../../../model/Procurement');

const updateItemStatus = async (procurementId, category, itemId, status) => {
  if (category === 'Printing') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.printingArtAndDesign._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.printingArtAndDesign.$.status': status,
        },
      }
    );
  } else if (category === 'Car Hire') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.carHire._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.carHire.$.status': status,
        },
      }
    );
  } else if (category === 'Conference Facilities') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.conferenceFacilities._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.conferenceFacilities.$.status': status,
        },
      }
    );
  } else if (category === 'Stationery') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.stationery._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.stationery.$.status': status,
        },
      }
    );
  } else if (category === 'Data Collectors') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.dataCollectors._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.dataCollectors.$.status': status,
        },
      }
    );
  } else if (category === 'Accomodation') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.accomodation._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.accomodation.$.status': status,
        },
      }
    );
  } else if (category === 'Medical Equipment') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.medicalEquipment._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.medicalEquipment.$.status': status,
        },
      }
    );
  } else if (category === 'Computers & Accessories') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.computerAndAccessories._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.computerAndAccessories.$.status': status,
        },
      }
    );
  } else if (category === 'Other') {
    await Procurement.updateOne(
      {
        _id: procurementId,
        'specifications.other._id': itemId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'specifications.other.$.status': status,
        },
      }
    );
  }
};

module.exports = updateItemStatus;
