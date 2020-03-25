const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const User = require('../../model/User');
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
          program,
          oNames,
          email,
          type,
          level
        } = arr[controller];

        const { annualLeaveBF } = arr[controller];
        const leaveDetailss = await getLeavesTaken(arr[controller]);

        let CurrentDate = moment()
          .tz('Africa/Kampala')
          .format();
        CurrentDate = new Date(CurrentDate);
        const currentMonth = CurrentDate.getMonth();
        // Computing Annual Leave
        let accruedAnnualLeave;
        if (currentMonth === 0) {
          accruedAnnualLeave = 0;
        } else {
          accruedAnnualLeave = Math.trunc(currentMonth * 1.75);
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
          studyLeaveTaken
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
          studyLeaveBal: study - studyLeaveTaken
        };

        const userSupervisor = await User.findOne({
          email: supervisorEmail
        });
        if (!userSupervisor) {
          recurseProcessLeave(controller + 1, arr);
        }

        const supervisorDetails = {
          fName: userSupervisor.fName,
          lName: userSupervisor.lName
        };

        const userRemade = {
          _id,
          fName,
          lName,
          shortForm,
          supervisorEmail,
          gender,
          title,
          program,
          oNames,
          email,
          type,
          level,
          annualLeaveBF,
          supervisorDetails,
          leaveDetails
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
      message: 'Error geting  Leaves taken'
    });
  }
};

module.exports = getAllStaffLeavesTaken;
