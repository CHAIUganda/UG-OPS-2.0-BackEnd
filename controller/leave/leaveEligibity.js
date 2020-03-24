const leaveEligibity = (
  daysDetails,
  leaveDetails,
  user,
  endDate,
  leave,
  res
) => {
  // set timezone to kampala
  // const CurrentDate = moment().tz('Africa/Kampala').format();
  const endDateMonth = endDate.getMonth();

  // Computing Annual Leave
  let accruedAnnualLeave;
  if (endDateMonth === 0) {
    accruedAnnualLeave = 0;
  } else {
    // accruedAnnualLeave = currentMonth * 1.75;
    accruedAnnualLeave = Math.trunc(endDateMonth * 1.75);
  }
  const { annualLeaveBF } = user;

  const {
    unPaidLeaveTaken,
    homeLeaveTaken,
    annualLeaveTaken,
    maternityLeaveTaken,
    paternityLeaveTaken,
    sickLeaveTaken,
    studyLeaveTaken
  } = leaveDetails;

  // prettier-ignore
  const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
  const maternity = 60;
  const paternity = 7;
  const sick = 42;
  const study = 4;
  const unpaid = 60;

  if (leave.type === 'Paternity') {
    if (user.gender === 'Female') {
      return res.status(400).json({
        message: 'Paternity leave only given to Gentlemen'
      });
    }
    const totalPaternity = paternityLeaveTaken + daysDetails.totalDays;
    if (paternity < totalPaternity) {
      return res.status(400).json({
        message: 'You Dont have enough Paternity Leave days',
        paternityLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalPaternity,
        paternity
      });
    }
  } else if (leave.typetype === 'Home') {
    if (user.type === 'local') {
      return res.status(400).json({
        message: 'Home leave only given to Expatriates and TCNs'
      });
    }
    // eslint-disable-next-line operator-linebreak
    const totalHome = homeLeaveTaken + annualLeaveTaken + daysDetails.totalDays;
    const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalHome;
    if (chk1) {
      return res.status(400).json({
        message: 'You Dont have enough Annual Leave days',
        annualLeaveTaken,
        homeLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalHome,
        totalAcruedAnualLeavePlusAnualLeaveBF
      });
    }
  } else if (leave.type === 'Maternity') {
    if (user.gender === 'Male') {
      return res.status(400).json({
        message: 'Maternity leave only given to Ladies'
      });
    }
    const totalMaternity = maternityLeaveTaken + daysDetails.totalDays;
    if (maternity < totalMaternity) {
      return res.status(400).json({
        message: 'You Dont have enough Maternity Leave days',
        maternityLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalMaternity,
        maternity
      });
    }
  } else if (leave.type === 'Sick') {
    const totalSick = sickLeaveTaken + daysDetails.totalDays;
    if (sick < totalSick) {
      return res.status(400).json({
        message: 'You Dont have enough Sick Leave days',
        sickLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalSick,
        sick
      });
    }
  } else if (leave.type === 'Unpaid') {
    const totalUnpaid = unPaidLeaveTaken + daysDetails.totalDays;
    if (unpaid < totalUnpaid) {
      return res.status(400).json({
        message: 'You Dont have enough Unpaid Leave days',
        unPaidLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalUnpaid,
        unpaid
      });
    }
  } else if (leave.type === 'Study') {
    const totalStudy = studyLeaveTaken + daysDetails.totalDays;
    if (study < totalStudy) {
      return res.status(400).json({
        message: 'You Dont have enough Study Leave days',
        studyLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalStudy,
        study
      });
    }
  } else if (leave.type === 'Annual') {
    // eslint-disable-next-line operator-linebreak
    const totalAnnual =
      annualLeaveTaken + homeLeaveTaken + daysDetails.totalDays;
    const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalAnnual;
    if (chk1) {
      return res.status(400).json({
        message: 'You Dont have enough Annual Leave days',
        annualLeaveTaken,
        homeLeaveTaken,
        daysRequested: daysDetails.totalDays,
        totalAnnual,
        totalAcruedAnualLeavePlusAnualLeaveBF
      });
    }
  } else {
    return res.status(400).json({
      message: 'Invalid Leave type selected'
    });
  }
};

module.exports = leaveEligibity;
