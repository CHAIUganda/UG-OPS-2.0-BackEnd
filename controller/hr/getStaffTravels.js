const debug = require('debug')('server');
const User = require('../../model/User');
const Program = require('../../model/Program');
const Travel = require('../../model/Travel');

const getStaffTravels = async (req, res) => {
  try {
    const staffEmail = req.params.email;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }
    const query = { _id: { $in: user.travels } };
    const travels = await Travel.find(query);
    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          employeeName,
          employeeEmail,
          travelLocation,
          typeOTrip,
          dates,
          employeeContact,
        } = arr[controller];

        let staffprogram;
        let staffprogramShortForm;
        let programId;

        const userProgram = await Program.findOne({
          _id: user.programId,
        });

        if (!userProgram) {
          staffprogram = null;
          programId = null;
          staffprogramShortForm = null;
          // eslint-disable-next-line no-else-return
        } else {
          staffprogram = userProgram.name;
          programId = userProgram._id;
          staffprogramShortForm = userProgram.shortForm;
        }

        const travelRemade = {
          _id,
          employeeName,
          employeeEmail,
          travelLocation,
          typeOTrip,
          dates,
          employeeContact,
          programId,
          program: staffprogram,
          programShortForm: staffprogramShortForm,
        };

        combinedArray.push(travelRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, travels);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching travels' });
  }
};

module.exports = getStaffTravels;
