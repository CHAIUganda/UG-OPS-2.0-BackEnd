const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');
const Contract = require('../../model/Contract');
const Program = require('../../model/Program');
const getLeavesTaken = require('./getLeavesTaken');

const handlePlannedLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    leaveId,
    staffEmail,
    action
  } = req.body;

  let { startDate, endDate } = req.body;
  let { comment, type } = req.body;

  // action applyForLeave, cancelLeave

  try {
    // check if user exists
    const user = await User.findOne({
      email: staffEmail,
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
      });
    }

    // check if Supervisor exists in System
    const supervisor = await User.findOne({ email: user.supervisorEmail });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor is not Registered in system',
      });
    }

    const leaveToTake = await Leave.findOne({
      _id: leaveId,
    });
    if (!leaveToTake) {
      return res.status(400).json({
        message: 'The leave doesnot exist',
      });
    }

    if (startDate == null) {
      startDate = leaveToTake.startDate;
    }
    if (endDate == null) {
      endDate = leaveToTake.startDate;
    }
    if (type == null) {
      type = leaveToTake.type;
    }
    if (comment == null) {
      comment = leaveToTake.comment;
    }
    // set timezone to kampala
    let CurrentDate = moment().tz('Africa/Kampala').format();
    CurrentDate = new Date(CurrentDate);
    endDate = new Date(endDate);
    startDate = new Date(startDate);
    const subject = 'Uganda Operations Leaves';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // handle leave here
    if (moment(startDate).isAfter(endDate)) {
      return res.status(400).json({
        message: 'Start Date cannot be after End date',
        endDate,
        startDate,
      });
    }
    // eslint-disable-next-line object-curly-newline
    const { programId } = leaveToTake;
    const publicHolidays = await PublicHoliday.find({});
    const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);
    const { supervisorEmail } = user;
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
      Leaveprogram = userProgram.program;
      LeaveprogramShortForm = userProgram.shortForm;
    }

    if (leaveToTake.status === 'Planned') {
      if (action === 'applyForLeave') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          return res.status(400).json({
            message:
              'This leave already passed',
            CurrentDate,
            startDate
          });
        }
        if (moment(CurrentDate).isSame(startDate)) {
          return res.status(400).json({
            message: 'This leave already passed',
            CurrentDate,
            startDate,
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'This Leave already passed',
            CurrentDate,
            endDate,
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message: 'This leave already passed',
            CurrentDate,
            endDate,
          });
        }
        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId,
          },
          { $set: { status: 'Pending Supervisor' } }
        );
        // mail supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 
  
${user.fName}  ${user.lName} is requesting to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                                        `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');
        // eslint-disable-next-line object-curly-newline
        const leave = {
          startDate,
          endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail,
          comment,
          status: 'Pending Supervisor',
          programId,
          program: Leaveprogram,
          programShortForm: LeaveprogramShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };
        res.status(200).json({
          message: 'Leave has been applied For',
          leave,
        });
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Cancelled' } }
        );
        const leave = {
          startDate,
          endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail,
          comment,
          status: 'Cancelled',
          program: Leaveprogram,
          programShortForm: LeaveprogramShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };
        res.status(200).json({
          message: 'Leave has been Cancelled',
          leave,
        });
      } else if (action === 'changeLeave') {
        // prettier-ignore

        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          return res.status(400).json({
            message:
              'Start Date cannot be changed to a date that already passed',
            CurrentDate,
            startDate
          });
        }
        if (moment(CurrentDate).isSame(startDate)) {
          return res.status(400).json({
            message: 'Sorry you, cannot Plan for a leave in the past',
            CurrentDate,
            startDate,
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'Sorry you, cannot Plan for a leave in the past',
            CurrentDate,
            endDate,
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message: 'Sorry you, cannot Plan for a leave in the past',
            CurrentDate,
            endDate,
          });
        }
        const leaveDetails = await getLeavesTaken(user);

        const contract = await Contract.findOne({
          _userId: user._id,
          contractStatus: 'ACTIVE',
        });

        let accruedAnnualLeave;
        if (!contract) {
          accruedAnnualLeave = 0;
        } else {
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

        const {
          unPaidLeaveTaken,
          homeLeaveTaken,
          annualLeaveTaken,
          maternityLeaveTaken,
          paternityLeaveTaken,
          sickLeaveTaken,
          studyLeaveTaken,
        } = leaveDetails;

        // prettier-ignore
        const totalAcruedAnualLeavePlusAnualLeaveBF = accruedAnnualLeave + annualLeaveBF;
        const maternity = 60;
        const paternity = 7;
        const sick = 42;
        const study = 4;
        const unpaid = 60;

        if (type === 'Paternity') {
          if (user.gender === 'Female') {
            return res.status(400).json({
              message: 'Paternity leave only given to Gentlemen',
            });
          }
          const totalPaternity = paternityLeaveTaken + daysDetails.totalDays;
          if (paternity < totalPaternity) {
            return res.status(400).json({
              message:
                'You Dont have enough Paternity Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              paternityLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalPaternity,
              paternity,
            });
          }
        } else if (type === 'Home') {
          if (user.type === 'national') {
            return res.status(400).json({
              message: 'Home leave only given to Expatriates and TCNs',
            });
          }
          // eslint-disable-next-line operator-linebreak
          const totalHome =
            homeLeaveTaken + annualLeaveTaken + daysDetails.totalDays;
          const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalHome;
          if (chk1) {
            return res.status(400).json({
              message:
                'You Dont have enough Annual Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              annualLeaveTaken,
              homeLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalHome,
              totalAcruedAnualLeavePlusAnualLeaveBF,
            });
          }
        } else if (type === 'Maternity') {
          if (user.gender === 'Male') {
            return res.status(400).json({
              message: 'Maternity leave only given to Ladies',
            });
          }
          const totalMaternity = maternityLeaveTaken + daysDetails.totalDays;
          if (maternity < totalMaternity) {
            return res.status(400).json({
              message:
                'You Dont have enough Maternity Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              maternityLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalMaternity,
              maternity,
            });
          }
        } else if (type === 'Sick') {
          const totalSick = sickLeaveTaken + daysDetails.totalDays;
          if (sick < totalSick) {
            return res.status(400).json({
              message:
                'You Dont have enough Sick Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              sickLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalSick,
              sick,
            });
          }
        } else if (type === 'Unpaid') {
          const totalUnpaid = unPaidLeaveTaken + daysDetails.totalDays;
          if (unpaid < totalUnpaid) {
            return res.status(400).json({
              message:
                'You Dont have enough Unpaid Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              unPaidLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalUnpaid,
              unpaid,
            });
          }
        } else if (type === 'Study') {
          const totalStudy = studyLeaveTaken + daysDetails.totalDays;
          if (study < totalStudy) {
            return res.status(400).json({
              message:
                'You Dont have enough Study Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              studyLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalStudy,
              study,
            });
          }
        } else if (type === 'Annual') {
          // eslint-disable-next-line operator-linebreak
          const totalAnnual =
            annualLeaveTaken + homeLeaveTaken + daysDetails.totalDays;
          const chk1 = totalAcruedAnualLeavePlusAnualLeaveBF < totalAnnual;
          if (chk1) {
            return res.status(400).json({
              message:
                'You Dont have enough Annual Leave days. Please check your Planned leaves to ensure your days are not tied up in planning.',
              annualLeaveTaken,
              homeLeaveTaken,
              daysRequested: daysDetails.totalDays,
              totalAnnual,
              totalAcruedAnualLeavePlusAnualLeaveBF,
            });
          }
        } else {
          return res.status(400).json({
            message: 'Invalid Leave type',
          });
        }
        // re applying code
        // change leave details
        await Leave.updateOne(
          {
            _id: leaveId,
          },
          {
            // eslint-disable-next-line max-len
            $set: {
              startDate,
              endDate,
              type,
              comment,
            },
          }
        );
        const leaveRemade = {
          _id: leaveToTake._id,
          startDate,
          endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail: user.supervisorEmail,
          comment,
          status: leaveToTake.status,
          programId,
          program: Leaveprogram,
          programShortForm: LeaveprogramShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };

        res.status(200).json({
          message: 'Leave has been Modified successfully.',
          leave: leaveRemade,
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification',
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status for handling planned leave',
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave',
      msg: err.message,
      err,
    });
  }
};

module.exports = handlePlannedLeave;
