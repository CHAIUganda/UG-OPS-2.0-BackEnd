const debug = require('debug')('server');
const User = require('../../model/User');
const Procurement = require('../../model/Procurement');
const Program = require('../../model/Program');

const getStaffProcurements = async (req, res) => {
  try {
    const { status, staffId } = req.params;
    const user = await User.findOne({ _id: staffId });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }

    const userProgram = await Program.findOne({
      _id: user.programId,
    });

    if (!userProgram) {
      return res.status(400).json({
        message: `${user.fName} ${user.lName}'s Program does not exist. `,
      });
    }

    if (!user._id.equals(userProgram.operationsLeadId)) {
      return res.status(400).json({
        message: `${user.fName} ${user.lName} is not the Operations lead for the ${userProgram.shortForm} program `,
      });
    }

    const procurementProgram = userProgram.name;
    const procurementProgramShortForm = userProgram.shortForm;

    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all') {
        query = {
          _id: { $in: user.procurements },
        };
      } else if (
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Procurement Response' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Requestor Response'
      ) {
        query = {
          _id: { $in: user.procurements },
          $or: [
            {
              'specifications.printingArtAndDesign.status': status,
            },
            {
              'specifications.carHire.status': status,
            },
            {
              'specifications.conferenceFacilities.status': status,
            },
            {
              'specifications.stationery.status': status,
            },
            {
              'specifications.dataCollectors.status': status,
            },
            {
              'specifications.accomodation.status': status,
            },
            {
              'specifications.medicalEquipment.status': status,
            },
            {
              'specifications.computerAndAccessories.status': status,
            },
            {
              'specifications.other.status': status,
            },
          ],
        };
      } else {
        return res.status(400).json({
          message: 'Invalid Status',
        });
      }
    }
    const { notifications } = user;
    const procurements = await Procurement.find(query);
    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          pId,
          gId,
          objectCode,
          category,
          descOfOther,
          priceRange,
          keyObjAsPerWp,
          keyActivitiesAsPerWp,
          specifications,
          response,
          localPurchaseOrder,
          goodsReceivedNote,
        } = arr[controller];

        const notificationDetails = notifications.filter(
          // prettier-ignore
          (notification) => notification.refId.equals(_id) && notification.refType === 'Procurements' && notification.linkTo === '/procurement' && notification.status === 'unRead'
        );

        const leaveRemade = {
          _id,
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
          response,
          localPurchaseOrder,
          goodsReceivedNote,
          programId: userProgram._id,
          program: procurementProgram,
          programShortForm: procurementProgramShortForm,
          notificationDetails,
        };

        combinedArray.push(leaveRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, procurements);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching procurements' });
  }
};

module.exports = getStaffProcurements;
