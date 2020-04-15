const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const getLeavesTaken = require('./getLeavesTaken');

const getStaffLeavesTaken = async (req, res) => {
  try {
    const staffEmail = req.params.email;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }
    const contract = await Contract.findOne({
      _userId: user._id,
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

    const { annualLeaveBF } = user;
    // prettier-ignore
    const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
    const maternity = 60;
    const paternity = 7;
    const sick = 42;
    const study = 4;
    const unpaid = 60;
    const leaveDetailss = await getLeavesTaken(user);

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

    res.status(200).json({ leaveDetails });
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error geting  Leaves taken',
    });
  }
};

module.exports = getStaffLeavesTaken;
