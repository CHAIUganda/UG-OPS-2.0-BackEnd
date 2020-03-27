const debug = require('debug')('server');
const Program = require('../../model/Program');
const User = require('../../model/User');

const getPrograms = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const programs = await Program.find({});
    const combinedArray = [];

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id, name, programManagerId, shortForm } = arr[controller];

        const user = await User.findOne({
          _id: programManagerId
        });
        if (!user) {
          recurseProcessLeave(controller + 1, arr);
        }

        const programManagerDetails = {
          fName: user.fName,
          lName: user.lName
        };

        const programRemade = {
          _id,
          name,
          shortForm,
          programManagerId,
          programManagerDetails
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
