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
          Leaveprogram = null;
          LeaveprogramShortForm = null;
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
          // current date since not leave enddate provided here
          const endDateMonth = CurrentDate.getMonth();
          const leaveEndDate = moment(CurrentDate);
          const contractStartDate = moment(contract.contractStartDate);
          let monthOnContract = leaveEndDate.diff(contractStartDate, 'months');
          monthOnContract = Math.trunc(monthOnContract);
          // Computing Annual Leave
          if (monthOnContract === 0) {
            accruedAnnualLeave = 0;
          } else {
            // acrue anual leave basing calender yr if current yr diff frm contract start yr
            // eslint-disable-next-line no-lonely-if
            if (moment(CurrentDate).isAfter(contractStartDate, 'year')) {
              if (endDateMonth === 0) {
                accruedAnnualLeave = 0;
              } else {
                accruedAnnualLeave = endDateMonth * 1.75;
              }
            } else {
              accruedAnnualLeave = Math.trunc(monthOnContract * 1.75);
            }
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
          unPaidLeavePlanned,
          homeLeaveTaken,
          homeLeavePlanned,
          annualLeaveTaken,
          annualLeavePlanned,
          maternityLeaveTaken,
          maternityLeavePlanned,
          paternityLeaveTaken,
          paternityLeavePlanned,
          sickLeaveTaken,
          sickLeavePlanned,
          studyLeaveTaken,
          studyLeavePlanned,
        } = leaveDetailss;

        const leaveDetails = {
          annualLeaveBF,
          unPaidLeaveTaken,
          unpaidLeaveBal: unpaid - unPaidLeaveTaken - unPaidLeavePlanned,
          unPaidLeavePlanned,
          homeLeaveTaken,
          // prettier-ignore
          // eslint-disable-next-line max-len
          homeLeaveBal: totalAcruedAnualLeavePlusAnualLeaveBF - homeLeaveTaken - annualLeaveTaken - homeLeavePlanned - annualLeavePlanned,
          homeLeavePlanned,
          annualLeaveTaken,
          // prettier-ignore
          // eslint-disable-next-line max-len
          annualLeaveBal: totalAcruedAnualLeavePlusAnualLeaveBF - homeLeaveTaken - annualLeaveTaken - homeLeavePlanned - annualLeavePlanned,
          annualLeavePlanned,
          maternityLeaveTaken,
          maternityLeaveBal:
            maternity - maternityLeaveTaken - maternityLeavePlanned,
          maternityLeavePlanned,
          paternityLeaveTaken,
          paternityLeaveBal:
            paternity - paternityLeaveTaken - paternityLeavePlanned,
          paternityLeavePlanned,
          sickLeaveTaken,
          sickLeaveBal: sick - sickLeaveTaken - sickLeavePlanned,
          sickLeavePlanned,
          studyLeaveTaken,
          studyLeaveBal: study - studyLeaveTaken - studyLeavePlanned,
          studyLeavePlanned,
        };

        const userSupervisor = await User.findOne({
          email: supervisorEmail,
        });
        let supervisorDetails;
        if (!userSupervisor) {
          supervisorDetails = {
            Supervisor_id: null,
            fName: null,
            lName: null,
            email: null,
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
