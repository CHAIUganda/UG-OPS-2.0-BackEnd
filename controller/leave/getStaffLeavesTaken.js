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
