const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const getLeavesTaken = require('./getLeavesTaken');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');
const Program = require('../../model/Program');
const Contract = require('../../model/Contract');
const storeNotification = require('../../helpers/storeNotification');

const staffModifyLeave = async (req, res) => {
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
  // action can be changeStartDate changeEndDate cancelLeave
  let { startDate, endDate } = req.body;
  let { comment, type } = req.body;
  if (comment == null) {
    comment = '';
  }

  try {
    let refType;
    let refId;
    // set timezone to kampala
    let CurrentDate = moment().tz('Africa/Kampala').format();
    CurrentDate = new Date(CurrentDate);
    endDate = new Date(endDate);
    startDate = new Date(startDate);
    // check if user exists
    const user = await User.findOne({
      email: staffEmail,
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
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
    // check if HR exists in System
    const hr = await User.findOne({ 'roles.hr': true });
    if (!hr) {
      return res.status(400).json({
        message: 'HR is not Registered in system',
      });
    }

    // check if Supervisor exists in System
    const supervisor = await User.findOne({ email: user.supervisorEmail });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor is not Registered in system',
      });
    }

    const leave = await Leave.findOne({
      _id: leaveId,
    });
    if (!leave) {
      return res.status(400).json({
        message: 'The leave doesnot exist',
      });
    }
    if (type == null) {
      type = leave.type;
    }
    const subject = 'Uganda Operations Leaves';
    const from = 'UGOperations@clintonhealthaccess.org';
    const footer = `

Regards,

Uganda Operations
Clinton Health Access Initiative

Disclaimer: This is an auto-generated mail. Please do not reply to it.`;

    // set old leave values
    const oldStartDate = leave.startDate;
    const oldEndDate = leave.endDate;
    const oldComment = leave.comment;
    const oldType = leave.type;
    const publicHolidays = await PublicHoliday.find({});
    const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);
    const leaveDetails = await getLeavesTaken(user);

    const { programId } = user;
    let program;
    let programShortForm;

    const userProgram = await Program.findOne({
      _id: programId,
    });

    if (!userProgram) {
      program = null;
      programShortForm = null;
      // eslint-disable-next-line no-else-return
    } else {
      program = userProgram.name;
      programShortForm = userProgram.shortForm;
    }

    // if leave is taken by staff notify the HR and Supervisor.
    // handle leave here
    if (moment(startDate).isAfter(endDate)) {
      return res.status(400).json({
        message: 'Start Date cannot be after End date',
        endDate,
        startDate,
      });
    }
    if (leave.status === 'Approved') {
      if (action === 'changeLeave') {
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
            message:
              'Start Date cannot be changed to a date that already started',
            CurrentDate,
            startDate,
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate,
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message:
              'End Date cannot be changed to a date that already started',
            CurrentDate,
            endDate,
          });
        }

        // work on re approval
        if (
          // eslint-disable-next-line operator-linebreak
          moment(startDate).isAfter(oldEndDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(startDate).isBefore(oldStartDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(endDate).isBefore(oldStartDate) ||
          // eslint-disable-next-line operator-linebreak
          moment(endDate).isAfter(oldEndDate)
        ) {
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
          const message = `Staff Comment:${comment}  System Comment: Leave is being modified outside of approved time`;
          const status = 'Pending Supervisor';
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
                status,
                type,
                comment: message,
                isModfied: true,
              },
            }
          );
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: oldStartDate,
            endDate: oldEndDate,
            comment: oldComment,
            typ: oldType,
          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their leave. To be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                                      `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');
          const supervisornotificationTitle = `${user.fName}  ${user.lName} is requesting to modify their leave.`;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName} is requesting to modify their leave. To be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(
            supervisor,
            supervisornotificationTitle,
            supervisornotificationMessage,
            supervisornotificationType,
            refType,
            refId
          );
          const leaveRemade = {
            _id: leave._id,
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
            status: 'Pending Supervisor',
            programId,
            program,
            programShortForm,
            leaveDays: daysDetails.leaveDays,
            daysTaken: daysDetails.totalDays,
            weekendDays: daysDetails.weekendDays,
            publicHolidays: daysDetails.holidayDays,
          };

          res.status(200).json({
            message: 'Leave Modification Request has been sent successfully.',
            leave: leaveRemade,
          });
        } else {
          // leave is still in approved time
          // chk if staff is an expat or tcn to allow cd notication
          // prettier-ignore
          // eslint-disable-next-line no-lonely-if
          if (
            (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
          ) {
          // check if CD exists in System
            const cd = await User.findOne({ 'roles.countryDirector': true });
            if (!cd) {
              return res.status(400).json({
                message: 'Country Director is not Registered in the system'
              });
            }

            // change leave details
            await Leave.updateOne(
              {
                _id: leaveId
              },
              {
              // eslint-disable-next-line max-len
                $set: {
                  startDate,
                  endDate,
                  type,
                  comment,
                  isModfied: true
                }
              }
            );
            const modLeaves = {
            // eslint-disable-next-line max-len
              startDate: oldStartDate, endDate: oldEndDate, comment: oldComment, typ: oldType

            };
            leave.modificationDetails.modLeaves.push(modLeaves);
            await leave.save();


            // sends mail to cd supervisor HR and notification about status
            // prettier-ignore
            // email to HR
            // prettier-ignore
            const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, hr.email, subject, text, '');
            // save notification on user obj
            const hrnotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave`;
            const hrnotificationType = '/hr/SuperviseLeave';
            refType = 'Leaves';
            refId = leave._id;
            // prettier-ignore
            // eslint-disable-next-line max-len
            const hrnotificationMessage = `${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
            // eslint-disable-next-line max-len
            await storeNotification(hr, hrnotificationTitle, hrnotificationMessage, hrnotificationType, refType, refId);


            // email to CD
            // prettier-ignore
            const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, cd.email, subject, textCd, '');
            // save notification on user obj
            const cdnotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave`;
            const cdnotificationType = '/hr/SuperviseLeave';
            refType = 'Leaves';
            refId = leave._id;
            // prettier-ignore
            // eslint-disable-next-line max-len
            const cdnotificationMessage = `${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
            // eslint-disable-next-line max-len
            await storeNotification(cd, cdnotificationTitle, cdnotificationMessage, cdnotificationType, refType, refId);


            // email to Supervisor
            // prettier-ignore
            const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, supervisor.email, subject, textSupervisor, '');
            // save notification on user obj
            const supervisornotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave`;
            const supervisornotificationType = '/hr/SuperviseLeave';
            refType = 'Leaves';
            refId = leave._id;
            // prettier-ignore
            // eslint-disable-next-line max-len
            const supervisornotificationMessage = `${user.fName}  ${user.lName} has modified their HomeLeave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
            // eslint-disable-next-line max-len
            await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);

            const leaveRemade = {
              _id: leave._id,
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
              status: leave.status,
              programId,
              program,
              programShortForm,
              leaveDays: daysDetails.leaveDays,
              daysTaken: daysDetails.totalDays,
              weekendDays: daysDetails.weekendDays,
              publicHolidays: daysDetails.holidayDays,
            };

            res.status(200).json({
              message: 'Leave has been Modified successfully.',
              leave: leaveRemade
            });
          } else {
          // Leave not home
          // change leave details
            await Leave.updateOne(
              {
                _id: leaveId
              },
              {
              // eslint-disable-next-line max-len
                $set: {
                  startDate,
                  endDate,
                  type,
                  comment,
                  isModfied: true
                }
              }
            );
            const modLeaves = {
              startDate: oldStartDate, endDate: oldEndDate, comment: oldComment, typ: oldType

            };
            leave.modificationDetails.modLeaves.push(modLeaves);
            await leave.save();

            // sends mail to supervisor HR and notification about status
            // email to HR
            // prettier-ignore
            const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, hr.email, subject, text, '');
            // save notification on user obj
            const hrnotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave`;
            const hrnotificationType = '/hr/SuperviseLeave';
            refType = 'Leaves';
            refId = leave._id;
            // prettier-ignore
            // eslint-disable-next-line max-len
            const hrnotificationMessage = `${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
            // eslint-disable-next-line max-len
            await storeNotification(hr, hrnotificationTitle, hrnotificationMessage, hrnotificationType, refType, refId);


            // email to Supervisor
            // prettier-ignore
            const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
            Mailer(from, supervisor.email, subject, textSupervisor, '');
            // save notification on user obj
            const supervisornotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave`;
            const supervisornotificationType = '/hr/SuperviseLeave';
            refType = 'Leaves';
            refId = leave._id;
            // prettier-ignore
            // eslint-disable-next-line max-len
            const supervisornotificationMessage = `${user.fName}  ${user.lName} has modified their Leave, now to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
            // eslint-disable-next-line max-len
            await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);

            const leaveRemade = {
              _id: leave._id,
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
              status: leave.status,
              programId,
              program,
              programShortForm,
              leaveDays: daysDetails.leaveDays,
              daysTaken: daysDetails.totalDays,
              weekendDays: daysDetails.weekendDays,
              publicHolidays: daysDetails.holidayDays,
            };

            res.status(200).json({
              message: 'Leave has been Modified successfully.',
              leave: leaveRemade
            });
          }
        }
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        if (
          (user.type === 'expat' || user.type === 'tcn')
          && leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system'
            });
          }

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken', comment } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, hr.email, subject, text, '');
          // save notification on user obj
          const hrnotificationTitle = `${user.fName}  ${user.lName} has Decided not to take their HomeLeave`;
          const hrnotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const hrnotificationMessage = `${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(hr, hrnotificationTitle, hrnotificationMessage, hrnotificationType, refType, refId);


          // email to CD
          // prettier-ignore
          const textCd = `Hello  ${cd.fName}, 

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, cd.email, subject, textCd, '');
          // save notification on user obj
          const cdnotificationTitle = `${user.fName}  ${user.lName} hasDecided not to take their HomeLeave`;
          const cdnotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const cdnotificationMessage = `${user.fName}  ${user.lName} has  Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(cd, cdnotificationTitle, cdnotificationMessage, cdnotificationType, refType, refId);


          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');
          // save notification on user obj
          const supervisornotificationTitle = `${user.fName}  ${user.lName} has Decided not to take their HomeLeave`;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName} has Decided not to take their HomeLeave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);

          const leaveRemade = {
            _id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type,
            staff: {
              email: user.email,
              fName: user.fName,
              lName: user.lName,
            },
            supervisorEmail: user.supervisorEmail,
            comment,
            status: 'Not Taken',
            programId,
            program,
            programShortForm,
            leaveDays: daysDetails.leaveDays,
            daysTaken: daysDetails.totalDays,
            weekendDays: daysDetails.weekendDays,
            publicHolidays: daysDetails.holidayDays,
          };

          res.status(200).json({
            message: 'Leave has been Cancelled',
            leave: leaveRemade
          });
        } else {
          // Leave not home

          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken', comment } }
          );
          // sends mail to supervisor  HR and notification about status
          // prettier-ignore
          // email to HR
          // pr // email to HR
          // prettier-ignore
          const text = `Hello  ${hr.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                                   `;
          Mailer(from, hr.email, subject, text, '');
          // save notification on user obj
          const hrnotificationTitle = `${user.fName}  ${user.lName} has Decided not to take their Leave`;
          const hrnotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const hrnotificationMessage = `${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(hr, hrnotificationTitle, hrnotificationMessage, hrnotificationType, refType, refId);

          // email to Supervisor
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
          Mailer(from, supervisor.email, subject, textSupervisor, '');
          // save notification on user obj
          const supervisornotificationTitle = `${user.fName}  ${user.lName} has Decided not to take their Leave`;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName} has Decided not to take their Leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);

          const leaveRemade = {
            _id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type,
            staff: {
              email: user.email,
              fName: user.fName,
              lName: user.lName,
            },
            supervisorEmail: user.supervisorEmail,
            comment,
            status: 'Not Taken',
            programId,
            program,
            programShortForm,
            leaveDays: daysDetails.leaveDays,
            daysTaken: daysDetails.totalDays,
            weekendDays: daysDetails.weekendDays,
            publicHolidays: daysDetails.holidayDays,
          };

          res.status(200).json({
            message: 'Leave has been Cancelled',
            leave: leaveRemade
          });
        }
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification',
        });
      }
    } else if (leave.status === 'Taken') {
      let msg = '';
      if (action === 'changeLeave') {
        // prettier-ignore
        if (moment(CurrentDate).isAfter(startDate)) {
          msg = `${msg}New StartDate(${startDate.toDateString()}) already passed as of (${CurrentDate.toDateString()}):::`;
        }
        if (moment(CurrentDate).isSame(startDate)) {
          msg = `${msg} leave being modified to start today: ${startDate.toDateString()}  :::`;
        }
        if (moment(startDate).isBefore(oldStartDate)) {
          msg = `${msg}New startDate(${startDate.toDateString()}) is before the Old startDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(startDate).isAfter(oldEndDate)) {
          msg = `${msg}New startDate(${startDate.toDateString()}) is after the Old EndDate(${oldEndDate.toDateString()}):::`;
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          msg = `${msg}New EndDate(${endDate.toDateString()}) already passed as of today (${CurrentDate.toDateString()}):::`;
        }

        if (moment(endDate).isBefore(oldStartDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is Before the Old StartDate(${oldStartDate.toDateString()}):::`;
        }
        if (moment(endDate).isAfter(oldEndDate)) {
          msg = `${msg}New endDate(${endDate.toDateString()}) is after the Old endDate(${oldEndDate.toDateString()}):::`;
        }

        // chk if staff is an expat or tcn to allow cd notication
        // prettier-ignore

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
        const message = `Staff Comment:${comment}  System Comment(s): ${msg}`;

        if (
          // eslint-disable-next-line operator-linebreak
          (user.type === 'expat' || user.type === 'tcn') &&
          leave.type === 'Home'
        ) {
          // check if CD exists in System
          const cd = await User.findOne({ 'roles.countryDirector': true });
          if (!cd) {
            return res.status(400).json({
              message: 'Country Director is not Registered in the system',
            });
          }

          // change leave details
          const status = 'Pending Change';
          await Leave.updateOne(
            {
              _id: leaveId,
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                isModfied: true,
                status,
                takenPending: {
                  startDate,
                  endDate,
                  type,
                  comment: message,
                  status: 'Pending',
                },
              },
            }
          );
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their Taken Home leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm. ${footer}.
                                      `;
          const cc = `${cd.email},${hr.email}`;
          Mailer(from, supervisor.email, subject, textSupervisor, cc);
          // save notification on user obj
          const supervisornotificationTitle = `${user.fName}  ${user.lName} is requesting to modify their Taken Home leave.`;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName}  is requesting to modify their Taken Home leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm.`;
          // eslint-disable-next-line max-len
          await storeNotification(
            supervisor,
            supervisornotificationTitle,
            supervisornotificationMessage,
            supervisornotificationType,
            refType,
            refId
          );
          const leaveRemade = {
            _id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type,
            staff: {
              email: user.email,
              fName: user.fName,
              lName: user.lName,
            },
            supervisorEmail: user.supervisorEmail,
            comment,
            status: 'Pending Change',
            programId,
            program,
            programShortForm,
            leaveDays: daysDetails.leaveDays,
            daysTaken: daysDetails.totalDays,
            weekendDays: daysDetails.weekendDays,
            publicHolidays: daysDetails.holidayDays,
          };

          res.status(200).json({
            message: 'Leave Modification request sent successfully.',
            leave: leaveRemade,
          });
        } else {
          // Leave not home
          // change leave details

          // change leave details
          const status = 'Pending Change';
          // re applying code
          // change leave details
          await Leave.updateOne(
            {
              _id: leaveId,
            },
            {
              // eslint-disable-next-line max-len
              $set: {
                isModfied: true,
                status,
                takenPending: {
                  startDate,
                  endDate,
                  type,
                  comment: message,
                  status: 'Pending',
                },
              },
            }
          );
          // prettier-ignore
          const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to modify their Taken leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm. ${footer}.
                                      `;
          const cc = `${hr.email}`;
          Mailer(from, supervisor.email, subject, textSupervisor, cc);
          // save notification on user obj
          const supervisornotificationTitle = `${user.fName}  ${user.lName} is requesting to modify their Taken leave.`;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName}  is requesting to modify their Taken leave. New Dates are ${startDate.toDateString()} to ${endDate.toDateString()}. Please Confirm.`;
          // eslint-disable-next-line max-len
          await storeNotification(
            supervisor,
            supervisornotificationTitle,
            supervisornotificationMessage,
            supervisornotificationType,
            refType,
            refId
          );
          const leaveRemade = {
            _id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type,
            staff: {
              email: user.email,
              fName: user.fName,
              lName: user.lName,
            },
            supervisorEmail: user.supervisorEmail,
            comment,
            status: 'Pending Change',
            programId,
            program,
            programShortForm,
            leaveDays: daysDetails.leaveDays,
            daysTaken: daysDetails.totalDays,
            weekendDays: daysDetails.weekendDays,
            publicHolidays: daysDetails.holidayDays,
          };

          res.status(200).json({
            message: 'Leave Modification request sent successfully.',
            leave: leaveRemade,
          });
        }
      } else if (action === 'cancelLeave') {
        // prettier-ignore

        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Pending Not Taken', comment } }
        );
        // sends mail to cd supervisor HR and notification about status
        // prettier-ignore
        // email to Supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} is requesting to Cancel their Taken leave Which was from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}. This is pending your approval${footer}.
                         `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');
        // save notification on user obj
        const supervisornotificationTitle = `${user.fName}  ${user.lName} is requesting to Cancel their Taken leave.`;
        const supervisornotificationType = '/hr/SuperviseLeave';
        refType = 'Leaves';
        refId = leave._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const supervisornotificationMessage = `${user.fName}  ${user.lName} is requesting to Cancel their Taken leave Which was from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}. This is pending your approval`;
        // eslint-disable-next-line max-len
        await storeNotification(
          supervisor,
          supervisornotificationTitle,
          supervisornotificationMessage,
          supervisornotificationType,
          refType,
          refId
        );

        const leaveRemade = {
          _id: leave._id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail: user.supervisorEmail,
          comment,
          status: 'Pending Not Taken',
          programId,
          program,
          programShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };
        res.status(200).json({
          message: 'Cancellation Pending Supervisor Approval',
          leave: leaveRemade,
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification',
        });
      }
    } else if (leave.status === 'Pending Supervisor') {
      if (action === 'changeLeave') {
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
            message:
              'Start Date cannot be changed to a date that already started',
            CurrentDate,
            startDate,
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate,
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message:
              'End Date cannot be changed to a date that already started',
            CurrentDate,
            endDate,
          });
        }
        // chk if staff is an expat or tcn to allow cd notication

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
              isModfied: true,
            },
          }
        );
        const modLeaves = {
          startDate: oldStartDate,
          endDate: oldEndDate,
          comment: oldComment,
          typ: oldType,
        };
        leave.modificationDetails.modLeaves.push(modLeaves);
        await leave.save();

        // prettier-ignore

        // email to Supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} has modified their Leave request, now asking to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');
        // save notification on user obj
        const supervisornotificationTitle = `${user.fName}  ${user.lName} has modified their Leave request`;
        const supervisornotificationType = '/hr/SuperviseLeave';
        refType = 'Leaves';
        refId = leave._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const supervisornotificationMessage = `${user.fName}  ${user.lName} has modified their Leave request, now asking to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
        // eslint-disable-next-line max-len
        await storeNotification(
          supervisor,
          supervisornotificationTitle,
          supervisornotificationMessage,
          supervisornotificationType,
          refType,
          refId
        );

        const leaveRemade = {
          _id: leave._id,
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
          status: leave.status,
          programId,
          program,
          programShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };

        res.status(200).json({
          message: 'Leave has been Modified successfully.',
          leave: leaveRemade,
        });
      } else if (action === 'cancelLeave') {
        // prettier-ignore

        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Cancelled', comment } }
        );
        // email to Supervisor
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 

${user.fName}  ${user.lName} Decided to cancel their Leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                         `;
        Mailer(from, supervisor.email, subject, textSupervisor, '');

        // save notification on user obj
        const supervisornotificationTitle = `${user.fName}  ${user.lName} has Decided to cancel their Leave request`;
        const supervisornotificationType = '/hr/SuperviseLeave';
        refType = 'Leaves';
        refId = leave._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const supervisornotificationMessage = `${user.fName}  ${user.lName} has Decided to cancel their Leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
        // eslint-disable-next-line max-len
        await storeNotification(
          supervisor,
          supervisornotificationTitle,
          supervisornotificationMessage,
          supervisornotificationType,
          refType,
          refId
        );

        const leaveRemade = {
          _id: leave._id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail: user.supervisorEmail,
          comment,
          status: 'Cancelled',
          programId,
          program,
          programShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };

        res.status(200).json({
          message: 'Leave has been Cancelled successfully.',
          leave: leaveRemade,
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification',
        });
      }
    } else if (leave.status === 'Pending Country Director') {
      const cd = await User.findOne({ 'roles.countryDirector': true });
      if (!cd) {
        return res.status(400).json({
          message: 'Country Director is not Registered in the system',
        });
      }
      if (action === 'changeLeave') {
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
            message:
              'Start Date cannot be changed to a date that already started',
            CurrentDate,
            startDate,
          });
        }

        if (moment(CurrentDate).isAfter(endDate)) {
          return res.status(400).json({
            message: 'End Date cannot be changed beacause it already passed',
            CurrentDate,
            endDate,
          });
        }

        if (moment(CurrentDate).isSame(endDate)) {
          return res.status(400).json({
            message:
              'End Date cannot be changed to a date that already started',
            CurrentDate,
            endDate,
          });
        }
        // chk if staff is an expat or tcn to allow cd notication

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

        await Leave.updateOne(
          {
            _id: leaveId,
          },
          {
            // eslint-disable-next-line max-len
            $set: {
              startDate,
              endDate,
              status: 'Pending Supervisor',
              type,
              comment,
              isModfied: true,
            },
          }
        );
        const modLeaves = {
          startDate: oldStartDate,
          endDate: oldEndDate,
          comment: oldComment,
          typ: oldType,
        };
        leave.modificationDetails.modLeaves.push(modLeaves);
        await leave.save();

        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 
  
  ${user.fName}  ${user.lName} has modified their Home Leave request, now asking to be off from ${startDate.toDateString()} to ${endDate.toDateString()}${footer}.
                         `;
        const cc = `${cd.email},${hr.email}`;
        Mailer(from, supervisor.email, subject, textSupervisor, cc);
        // save notification on user obj
        const supervisornotificationTitle = `${user.fName}  ${user.lName} has modified their Home Leave request`;
        const supervisornotificationType = '/hr/SuperviseLeave';
        refType = 'Leaves';
        refId = leave._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const supervisornotificationMessage = `${user.fName}  ${user.lName} has modified their Home Leave request, now asking to be off from ${startDate.toDateString()} to ${endDate.toDateString()}`;
        // eslint-disable-next-line max-len
        await storeNotification(
          supervisor,
          supervisornotificationTitle,
          supervisornotificationMessage,
          supervisornotificationType,
          refType,
          refId
        );
        const leaveRemade = {
          _id: leave._id,
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
          status: 'Pending Supervisor',
          programId,
          program,
          programShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };

        res.status(200).json({
          message: 'Leave has modified successfully.',
          leave: leaveRemade,
        });
      } else if (action === 'cancelLeave') {
        // prettier-ignore
        // change status to nottaken
        await Leave.updateOne(
          {
            _id: leaveId
          },
          { $set: { status: 'Cancelled', comment } }
        );
        // email to Supervisor cc CD
        // prettier-ignore
        const textSupervisor = `Hello  ${supervisor.fName}, 
  
  ${user.fName}  ${user.lName} Decided to cancel their Home Leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}${footer}.
                               `;
        const cc = `${cd.email},${hr.email}`;
        Mailer(from, supervisor.email, subject, textSupervisor, cc);
        // save notification on user obj
        const supervisornotificationTitle = `${user.fName}  ${user.lName} Decided to cancel their Home Leave request`;
        const supervisornotificationType = '/hr/SuperviseLeave';
        refType = 'Leaves';
        refId = leave._id;
        // prettier-ignore
        // eslint-disable-next-line max-len
        const supervisornotificationMessage = `${user.fName}  ${user.lName} has Decided to cancel their Home Leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
        // eslint-disable-next-line max-len
        await storeNotification(
          supervisor,
          supervisornotificationTitle,
          supervisornotificationMessage,
          supervisornotificationType,
          refType,
          refId
        );

        const leaveRemade = {
          _id: leave._id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          type,
          staff: {
            email: user.email,
            fName: user.fName,
            lName: user.lName,
          },
          supervisorEmail: user.supervisorEmail,
          comment,
          status: 'Cancelled',
          programId,
          program,
          programShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
        };

        res.status(200).json({
          message: 'Leave has been Cancelled successfully.',
          leave: leaveRemade,
        });
      } else {
        return res.status(400).json({
          message: 'Invalid action for staff leave modification',
        });
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status for leave modification',
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

module.exports = staffModifyLeave;
