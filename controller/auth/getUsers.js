const debug = require('debug')('server');
const Contract = require('../../model/Contract');
const User = require('../../model/User');
const Program = require('../../model/Program');

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
          programId,
          oNames,
          email,
          type,
          level,
          bankDetails,
          team,
          annualLeaveBF,
          bankAccounts,
          nssfNumber,
          tinNumber
        } = arr[controller];
        let program;
        let programShortForm;
        const staffProgram = await Program.findOne({
          _id: programId
        });

        if (!staffProgram) {
          program = 'NA';
          programShortForm = 'NA';
        } else {
          program = staffProgram.name;
          programShortForm = staffProgram.shortForm;
        }
        const contract = await Contract.findOne({
          _userId: _id,
          contractStatus: 'ACTIVE'
        });

        let contractStartDate;
        let contractEndDate;
        let contractType;
        let contractStatus;
        let contractId;
        if (!contract) {
          contractStartDate = null;
          contractEndDate = null;
          contractType = null;
          contractStatus = null;
          contractId = null;
        } else {
          contractStartDate = contract.contractStartDate;
          contractEndDate = contract.contractEndDate;
          contractType = contract.contractType;
          contractStatus = contract.contractStatus;
          contractId = contract._id;
        }

        const supervisor = await User.findOne({
          email: arr[controller].supervisorEmail
        });

        let supervisorDetails;
        if (!supervisor) {
          supervisorDetails = {
            Supervisor_id: null,
            fName: null,
            lName: null,
            email: null
          };
        } else {
          supervisorDetails = {
            _id: supervisor._id,
            fName: supervisor.fName,
            lName: supervisor.lName,
            email: supervisor.email
          };
        }

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
          programShortForm,
          oNames,
          email,
          type,
          level,
          bankDetails,
          team,
          annualLeaveBF,
          bankAccounts,
          nssfNumber,
          tinNumber,
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
    res
      .status(500)
      .json({ message: `Error in Fetching users:: ${e.message}`, e });
  }
};

module.exports = getUsers;
