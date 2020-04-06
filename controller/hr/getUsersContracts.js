const debug = require('debug')('server');
const moment = require('moment-timezone');
const Program = require('../../model/Program');
const Contract = require('../../model/Contract');
const User = require('../../model/User');

const getUsersContracts = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const { expiryIn } = req.params;
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
          oNames,
          programId,
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

        let contractStartDate;
        let contractEndDate;
        let contractType;
        let contractStatus;
        let contractId;
        if (!contract) {
          recurseProcessLeave(controller + 1, arr);
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
        let program;
        let programShortForm;

        const userProgram = await Program.findOne({
          _id: programId
        });

        if (!userProgram) {
          program = 'NA';
          programShortForm = 'NA';
          // eslint-disable-next-line no-else-return
        } else {
          program = userProgram.program;
          programShortForm = userProgram.shortForm;
        }
        let endDate = contract.contractEndDate;
        // set timezone to kampala
        const CurrentDate = moment()
          .tz('Africa/Kampala')
          .format();

        endDate = moment(endDate);
        const diff = endDate.diff(CurrentDate, 'days') + 1;
        const daysLeftonContract = diff;
        // eslint-disable-next-line eqeqeq
        if (diff < expiryIn || diff == expiryIn) {
          const userRemade = {
            _id,
            fName,
            lName,
            supervisorDetails,
            gender,
            roles,
            title,
            birthDate,
            programId,
            program,
            programShortForm,
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
            contractStatus,
            daysLeftonContract
          };

          combinedArray.push(userRemade);

          recurseProcessLeave(controller + 1, arr);
        } else {
          recurseProcessLeave(controller + 1, arr);
        }
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

module.exports = getUsersContracts;
