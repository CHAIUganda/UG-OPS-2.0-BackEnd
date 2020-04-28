const moment = require('moment-timezone');
const Leave = require('../../model/Leave');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const getLeavesTaken = async (user) => {
  let CurrentDate = moment().tz('Africa/Kampala').format();
  CurrentDate = new Date(CurrentDate);
  const currentYear = CurrentDate.getFullYear();
  // const status = 'Taken';
  const query = {
    _id: { $in: user.leaves },
    $or: [
      {
        status: 'Taken',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Pending Supervisor',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Pending Country Director',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Planned',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Approved',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Pending Change',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
      {
        status: 'Pending Not Taken',
        $expr: { $eq: [{ $year: '$startDate' }, currentYear] },
      },
    ],
  };
  const leaves = await Leave.find(query);
  const publicHolidays = await PublicHoliday.find({});

  const leaveDetails = {
    unPaidLeaveTaken: 0,
    unPaidLeavePlanned: 0,
    homeLeaveTaken: 0,
    homeLeavePlanned: 0,
    annualLeaveTaken: 0,
    annualLeavePlanned: 0,
    maternityLeaveTaken: 0,
    maternityLeavePlanned: 0,
    paternityLeaveTaken: 0,
    paternityLeavePlanned: 0,
    sickLeaveTaken: 0,
    sickLeavePlanned: 0,
    studyLeaveTaken: 0,
    studyLeavePlanned: 0,
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
  // get taken and planned leave for eact type and intialise leaves details obj
  const homeLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Home' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, homeLeavesTaken, 'homeLeaveTaken');

  const homeLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Home' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, homeLeavesPlanned, 'homeLeavePlanned');

  const annualLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Annual' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, annualLeavesTaken, 'annualLeaveTaken');

  const annualLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Annual' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, annualLeavesPlanned, 'annualLeavePlanned');

  const studyLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Study' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, studyLeavesTaken, 'studyLeaveTaken');

  const studyLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Study' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, studyLeavesPlanned, 'studyLeavePlanned');

  const paternityLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Paternity' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, paternityLeavesTaken, 'paternityLeaveTaken');

  const paternityLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Paternity' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, paternityLeavesPlanned, 'paternityLeavePlanned');

  const maternityLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Maternity' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, maternityLeavesTaken, 'maternityLeaveTaken');

  const maternityLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Maternity' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, maternityLeavesPlanned, 'maternityLeavePlanned');

  const sickLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Sick' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, sickLeavesTaken, 'sickLeaveTaken');

  const sickLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Sick' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, sickLeavesPlanned, 'sickLeavePlanned');

  const unPaidLeavesTaken = leaves.filter(
    (leave) => leave.type === 'Unpaid' && leave.status !== 'Planned'
  );
  await recurseProcessLeave(0, unPaidLeavesTaken, 'unPaidLeaveTaken');

  const unPaidLeavesPlanned = leaves.filter(
    (leave) => leave.type === 'Unpaid' && leave.status === 'Planned'
  );
  await recurseProcessLeave(0, unPaidLeavesPlanned, 'unPaidLeavePlanned');

  return leaveDetails;
};

module.exports = getLeavesTaken;
