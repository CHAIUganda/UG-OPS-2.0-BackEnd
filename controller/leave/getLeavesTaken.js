const Leave = require('../../model/Leave');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const getLeavesTaken = async (user) => {
  const status = 'Taken';
  const query = { _id: { $in: user.leaves }, status };
  const leaves = await Leave.find(query);
  const publicHolidays = await PublicHoliday.find({});

  const leaveDetails = {
    unPaidLeaveTaken: 0,
    homeLeaveTaken: 0,
    annualLeaveTaken: 0,
    maternityLeaveTaken: 0,
    paternityLeaveTaken: 0,
    sickLeaveTaken: 0,
    studyLeaveTaken: 0
  };

  let sum = 0;
  const recurseProcessLeave = async (controller, arr, objParam) => {
    if (controller < arr.length) {
      const daysDetails = getLeaveDaysNo(
        arr[controller].startDate,
        arr[controller].endDate,
        publicHolidays
      );
      sum += daysDetails.totalDays;
      recurseProcessLeave(controller + 1, arr, objParam);
    } else {
      leaveDetails[objParam] = sum;
      sum = 0;
    }
  };

  const homeLeaves = leaves.filter((leave) => leave.type === 'Home');
  await recurseProcessLeave(0, homeLeaves, 'homeLeaveTaken');

  const annualLeaves = leaves.filter((leave) => leave.type === 'Annual');
  await recurseProcessLeave(0, annualLeaves, 'annualLeaveTaken');

  const studyLeaves = leaves.filter((leave) => leave.type === 'Study');
  await recurseProcessLeave(0, studyLeaves, 'studyLeaveTaken');

  const paternityLeaves = leaves.filter((leave) => leave.type === 'Paternity');
  await recurseProcessLeave(0, paternityLeaves, 'paternityLeaveTaken');

  const maternityLeaves = leaves.filter((leave) => leave.type === 'Maternity');
  await recurseProcessLeave(0, maternityLeaves, 'maternityLeaveTaken');

  const sickLeaves = leaves.filter((leave) => leave.type === 'Sick');
  await recurseProcessLeave(0, sickLeaves, 'sickLeaveTaken');

  const unPaidLeaves = leaves.filter((leave) => leave.type === 'Unpaid');
  await recurseProcessLeave(0, unPaidLeaves, 'unPaidLeaveTaken');
  return leaveDetails;
};

module.exports = getLeavesTaken;
