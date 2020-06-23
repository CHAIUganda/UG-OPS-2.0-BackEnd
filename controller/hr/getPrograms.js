const debug = require('debug')('server');
const Program = require('../../model/Program');
const User = require('../../model/User');

const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({});
    const combinedArray = [];

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          name,
          programManagerId,
          operationsLeadId,
          shortForm,
        } = arr[controller];

        const userOppsLd = await User.findOne({
          _id: operationsLeadId,
        });
        let operationsLeadDetails;
        if (!userOppsLd) {
          operationsLeadDetails = {
            _id: null,
            fName: null,
            lName: null,
            email: null,
          };
        } else {
          operationsLeadDetails = {
            _id: userOppsLd._id,
            fName: userOppsLd.fName,
            lName: userOppsLd.lName,
            email: userOppsLd.email,
          };
        }

        const user = await User.findOne({
          _id: programManagerId,
        });
        let programManagerDetails;
        if (!user) {
          programManagerDetails = {
            _id: null,
            fName: null,
            lName: null,
            email: null,
          };
        } else {
          programManagerDetails = {
            _id: user._id,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
          };
        }

        const programRemade = {
          _id,
          name,
          shortForm,
          programManagerId,
          programManagerDetails,
          operationsLeadDetails,
        };

        combinedArray.push(programRemade);

        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, programs);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Programs' });
  }
};

module.exports = getPrograms;
