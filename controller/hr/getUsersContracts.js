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
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      console.log('HR not found in the system, Please Register the HR');
      const errorMessage = {
        code: 404,
        message: 'HR not found in the system, Please Register the HR',
      };
      throw errorMessage;
    }
    const { notifications } = hr;

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
          bankAccounts,
          team,
          annualLeaveBF,
        } = arr[controller];

        const contract = await Contract.findOne({
          _userId: _id,
          contractStatus: 'ACTIVE',
        });

        let contractStartDate;
        let contractEndDate;
        let contractType;
        let contractStatus;
        let contractId;
        let contractDismiss;
        let contractSnooze;
        if (!contract) {
          recurseProcessLeave(controller + 1, arr);
        } else {
          contractStartDate = contract.contractStartDate;
          contractEndDate = contract.contractEndDate;
          contractType = contract.contractType;
          contractStatus = contract.contractStatus;
          contractId = contract._id;
          contractDismiss = contract.contractDismiss;
          contractSnooze = contract.contractSnooze;

          const supervisor = await User.findOne({
            email: arr[controller].supervisorEmail,
          });

          let supervisorDetails;
          if (!supervisor) {
            supervisorDetails = {
              Supervisor_id: null,
              fName: null,
              lName: null,
              email: null,
            };
          } else {
            supervisorDetails = {
              _id: supervisor._id,
              fName: supervisor.fName,
              lName: supervisor.lName,
              email: supervisor.email,
            };
          }
          let staffprogram;
          let programShortForm;
          let programManagerId;
          let programManagerDetails;

          const userProgram = await Program.findOne({
            _id: programId,
          });

          if (!userProgram) {
            staffprogram = null;
            programShortForm = null;
            // eslint-disable-next-line no-else-return
          } else {
            programManagerId = userProgram.programManagerId;
            staffprogram = userProgram.name;
            programShortForm = userProgram.shortForm;
            const userPM = await User.findOne({
              _id: programManagerId,
            });
            if (!userPM) {
              programManagerDetails = {
                _id: null,
                fName: null,
                lName: null,
                email: null,
              };
            } else {
              programManagerDetails = {
                _id: userPM._id,
                fName: userPM.fName,
                lName: userPM.lName,
                email: userPM.email,
              };
            }
          }

          let endDate = contract.contractEndDate;
          // set timezone to kampala
          const CurrentDate = moment().tz('Africa/Kampala').format();

          endDate = moment(endDate);
          const diff = endDate.diff(CurrentDate, 'days') + 1;
          const daysLeftonContract = diff;

          // prettier-ignore
          // eslint-disable-next-line eqeqeq
          if ((contract.contractDismiss == false && contract.contractSnooze == false)
          // prettier-ignore
          // eslint-disable-next-line eqeqeq
          && (diff < expiryIn || diff == expiryIn)) {
            const notificationDetails = notifications.filter(
              // prettier-ignore
              (notification) => notification.refId.equals(contractId) && notification.refType === 'Contracts'
            );
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
              program: staffprogram,
              programShortForm,
              programManagerDetails,
              oNames,
              email,
              type,
              level,
              bankAccounts,
              team,
              annualLeaveBF,
              contractId,
              contractStartDate,
              contractEndDate,
              contractType,
              contractStatus,
              contractDismiss,
              contractSnooze,
              daysLeftonContract,
              notificationDetails
            };

            combinedArray.push(userRemade);

            recurseProcessLeave(controller + 1, arr);
          } else {
            recurseProcessLeave(controller + 1, arr);
          }
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
