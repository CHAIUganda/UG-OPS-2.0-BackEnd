const debug = require('debug')('server');
const Contract = require('../../model/Contract');
const User = require('../../model/User');

const getUsers = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.find({});
    user.password = undefined;

    const combinedArray = [];

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          fName,
          lName,
          gender,
          roles,
          title,
          birthDate,
          program,
          oNames,
          email,
          type,
          level,
          bankDetails,
          team,
          annualLeaveBF
        } = arr[controller];

        const contract = await Contract.findOne({
          _userId: _id,
          contractStatus: 'ACTIVE'
        });
        if (!contract) {
          recurseProcessLeave(controller + 1, arr);
        }

        const supervisor = await User.findOne({
          email: arr[controller].supervisorEmail
        });
        if (!supervisor) {
          recurseProcessLeave(controller + 1, arr);
        }
        const supervisorDetails = {
          _id: supervisor._id,
          fName: supervisor.fName,
          lName: supervisor.lName,
          email: supervisor.email
        };

        const {
          contractStartDate,
          contractEndDate,
          contractType,
          contractStatus
        } = contract;

        const contractId = contract._id;

        const userRemade = {
          _id,
          fName,
          lName,
          supervisorDetails,
          gender,
          roles,
          title,
          birthDate,
          program,
          oNames,
          email,
          type,
          level,
          bankDetails,
          team,
          annualLeaveBF,
          contractId,
          contractStartDate,
          contractEndDate,
          contractType,
          contractStatus
        };

        combinedArray.push(userRemade);

        recurseProcessLeave(controller + 1, arr);
      } else {
        res.status(200).json(combinedArray);
      }
    };
    await recurseProcessLeave(0, user);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching users' });
  }
};

module.exports = getUsers;
