const Leave = require('../../model/Leave');

const getLeavesTaken = async (user) => {
  const status = 'taken';
  const query = { _id: { $in: user.leaves }, status };
  const leaves = await Leave.find(query);
  // filtering taken leaves of the different types findind totaltaken
  const annualLeaves = leaves.filter((leave) => leave.type === 'Annual');
  let sumOfAnnual = 0;
  annualLeaves.forEach((annualLeave) => {
    sumOfAnnual += annualLeave.daysTaken;
  });

  const unPaidLeaves = leaves.filter((leave) => leave.type === 'Paternity');
  let sumOfunPaid = 0;
  unPaidLeaves.forEach((unPaidLeave) => {
    sumOfunPaid += unPaidLeave.daysTaken;
  });

  const homeLeaves = leaves.filter((leave) => leave.type === 'Home');
  let sumOfhome = 0;
  homeLeaves.forEach((homeLeave) => {
    sumOfhome += homeLeave.daysTaken;
  });

  const sickLeaves = leaves.filter((leave) => leave.type === 'Sick');
  let sumOfsick = 0;
  sickLeaves.forEach((sickLeave) => {
    sumOfsick += sickLeave.daysTaken;
  });
  const maternityLeaves = leaves.filter((leave) => leave.type === 'Maternity');
  let sumOfmaternity = 0;
  maternityLeaves.forEach((maternityLeave) => {
    sumOfmaternity += maternityLeave.daysTaken;
  });
  const paternityLeaves = leaves.filter((leave) => leave.type === 'Paternity');
  let sumOfpaternity = 0;
  paternityLeaves.forEach((paternityLeave) => {
    sumOfpaternity += paternityLeave.daysTaken;
  });
  const studyLeaves = leaves.filter((leave) => leave.type === 'Study');
  let sumOfstudy = 0;
  studyLeaves.forEach((studyLeave) => {
    sumOfstudy += studyLeave.daysTaken;
  });

  const leaveDetails = {
    unPaidLeaveTaken: sumOfunPaid,
    homeLeaveTaken: sumOfhome,
    annualLeaveTaken: sumOfAnnual,
    maternityLeaveTaken: sumOfmaternity,
    paternityLeaveTaken: sumOfpaternity,
    sickLeaveTaken: sumOfsick,
    studyLeaveTaken: sumOfstudy
  };
  return leaveDetails;
};

module.exports = getLeavesTaken;
