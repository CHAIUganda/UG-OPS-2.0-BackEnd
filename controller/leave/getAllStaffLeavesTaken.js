const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const User = require('../../model/User');
const Program = require('../../model/Program');
const Contract = require('../../model/Contract');
const getLeavesTaken = require('./getLeavesTaken');

const getAllStaffLeavesTaken = async (req, res) => {
  try {
    // const staffEmail = req.params.email;
    // const user = await User.findOne({ email: staffEmail });
    const user = await User.find({});

    const combinedArray = [];

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          _id,
          fName,
          lName,
          shortForm,
          supervisorEmail,
          gender,
          title,
          programId,
          oNames,
          email,
          type,
          level,
        } = arr[controller];
        let Leaveprogram;
        let LeaveprogramShortForm;

        const userProgram = await Program.findOne({
          _id: programId,
        });

        if (!userProgram) {
          Leaveprogram = 'NA';
          LeaveprogramShortForm = 'NA';
          // eslint-disable-next-line no-else-return
        } else {
          Leaveprogram = userProgram.name;
          LeaveprogramShortForm = userProgram.shortForm;
        }
        const { annualLeaveBF } = arr[controller];
        const leaveDetailss = await getLeavesTaken(arr[controller]);
        const contract = await Contract.findOne({
          _userId: arr[controller]._id,
          contractStatus: 'ACTIVE',
        });

        let accruedAnnualLeave;
        if (!contract) {
          accruedAnnualLeave = 0;
        } else {
          let CurrentDate = moment().tz('Africa/Kampala').format();
          CurrentDate = new Date(CurrentDate);
          // compute accrued days fromstart of contract
          const leaveEndDate = moment(CurrentDate);
          const contractStartDate = moment(contract.contractStartDate);
          let monthOnContract = leaveEndDate.diff(contractStartDate, 'months');
          monthOnContract = Math.trunc(monthOnContract);
          // Computing Annual Leave
          if (monthOnContract === 0) {
            accruedAnnualLeave = 0;
          } else {
            // accruedAnnualLeave = currentMonth * 1.75;
            accruedAnnualLeave = Math.trunc(monthOnContract * 1.75);
          }
        }

        // prettier-ignore
        const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
        const maternity = 60;
        const paternity = 7;
        const sick = 42;
        const study = 4;
        const unpaid = 60;

        const {
          unPaidLeaveTaken,
          homeLeaveTaken,
          annualLeaveTaken,
          maternityLeaveTaken,
          paternityLeaveTaken,
          sickLeaveTaken,
          studyLeaveTaken,
        } = leaveDetailss;

        const leaveDetails = {
          annualLeaveBF,
          unPaidLeaveTaken,
          unpaidLeaveBal: unpaid - unPaidLeaveTaken,
          homeLeaveTaken,
          // prettier-ignore
          homeLeaveBal: totalAcruedAnualLeavePlusAnualLeaveBF - homeLeaveTaken - annualLeaveTaken,
          annualLeaveTaken,
          // prettier-ignore
          annualLeaveBal: totalAcruedAnualLeavePlusAnualLeaveBF - homeLeaveTaken - annualLeaveTaken,
          maternityLeaveTaken,
          maternityLeaveBal: maternity - maternityLeaveTaken,
          paternityLeaveTaken,
          paternityLeaveBal: paternity - paternityLeaveTaken,
          sickLeaveTaken,
          sickLeaveBal: sick - sickLeaveTaken,
          studyLeaveTaken,
          studyLeaveBal: study - studyLeaveTaken,
        };

        const userSupervisor = await User.findOne({
          email: supervisorEmail,
        });
        let supervisorDetails;
        if (!userSupervisor) {
          supervisorDetails = {
            Supervisor_id: 'NA',
            fName: 'NA',
            lName: 'NA',
            email: 'NA',
          };
        } else {
          supervisorDetails = {
            _id: userSupervisor._id,
            fName: userSupervisor.fName,
            lName: userSupervisor.lName,
            email: userSupervisor.email,
          };
        }

        const userRemade = {
          _id,
          fName,
          lName,
          shortForm,
          gender,
          title,
          programId,
          program: Leaveprogram,
          programShortForm: LeaveprogramShortForm,
          oNames,
          email,
          type,
          level,
          annualLeaveBF,
          supervisorDetails,
          leaveDetails,
        };

        combinedArray.push(userRemade);

        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, user);
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error geting  Leaves taken',
    });
  }
};

module.exports = getAllStaffLeavesTaken;
