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
        const { _id, name, programManagerId } = arr[controller];

        const user = await User.findOne({
          _id: programManagerId
        });
        if (!user) {
          return res.status(400).json({
            message: 'Program Manager does not Exist'
          });
        }

        const programManagerDetails = {
          fName: user.fName,
          lName: user.lName
        };

        const programRemade = {
          _id,
          name,
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
