const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const storeNotification = require('../../helpers/storeNotification');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const supervisorHandleLeave = async (req, res) => {
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
    status
  } = req.body;
  let { reason } = req.body;

  try {
    if (reason == null) {
      reason = '';
    }
    const user = await User.findOne({
      email: staffEmail,
    });
    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
      });
    }
    let refType;
    let refId;

    const supervisor = await User.findOne({
      email: user.supervisorEmail,
    });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor does not Exist',
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

    const from = 'UGOperations@clintonhealthaccess.org';
    const to = user.email;
    const footer = `
  
With Regards,
  
Uganda Operations
Clinton Health Access Initiative
https://ugops.clintonhealthaccess.org
  
Disclaimer: This is an auto-generated mail, please do not reply to it.`;
    const publicHolidays = await PublicHoliday.find({});
    const daysDetails = getLeaveDaysNo(
      leave.startDate,
      leave.endDate,
      publicHolidays
    );

    // handle leave here
    if (status === 'Approved') {
      // prettier-ignore
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
        if (leave.status === 'Pending Supervisor') {
          // change progress to cd and notify
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Pending Country Director' } }
          );
          // sends mail to staff and notification about progress
          // Send the email
          const subject = 'Leave approved by supervisor';
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved your supervisor. It is now pending Country director approval.${footer}
                         `;
          Mailer(from, to, subject, text, '');
          // save notification on user obj
          const notificationTitle = 'Leave has been approved by supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved your supervisor. It is now pending Country director approval.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);
          // email to CD
          // prettier-ignore
          const textCd = `Dear  ${cd.fName}, 

${user.fName}  ${user.lName} is requesting for a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}.${footer}
                         `;
          Mailer(from, cd.email, subject, textCd, '');
          // save notification on user obj
          const cdnotificationTitle = `${user.fName}  ${user.lName} is requesting for Home Leave`;
          const cdnotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const cdnotificationMessage = `${user.fName}  ${user.lName} is requesting for a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`;
          // eslint-disable-next-line max-len
          await storeNotification(cd, cdnotificationTitle, cdnotificationMessage, cdnotificationType, refType, refId);

          res.status(200).json({
            message: 'Leave has been Approved, Pending CD approval'
          });
        } else if (leave.status === 'Pending Country Director') {
          // approve & notify that CD approved their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Approved' } }
          );
          // sends mail to staff and notification about leave approval
          // Send the email
          const subject = 'Leave approved by Country director';
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by the Country director.${footer}
                                   `;

          Mailer(from, to, subject, text, user.supervisorEmail);
          // save notification on user obj
          const notificationTitle = 'Leave has been approved by the Country director';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by the Country director.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          const supervisornotificationTitle = `${user.fName}  ${user.lName}'s Home Leave has been approved by the Country director `;
          const supervisornotificationType = '/hr/SuperviseLeave';
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by the Country director`;
          // eslint-disable-next-line max-len
          await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);


          res.status(200).json({
            message: 'Leave has been Approved'
          });
        } else if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to cd supervisor HR and notification about status
          // prettier-ignore
          // email to staff
          const subject = 'Taken leave cancellation approved by supervisor';
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 

Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}
                         `;
          Mailer(from, user.email, subject, textStaff, cd.email);
          // save notification on user obj
          const notificationTitle = 'Cancellation of Home Leave has been approved by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          const cdnotificationTitle = `${user.fName}  ${user.lName}'s Home Leave Cancellation has been approved by the Supervisor `;
          const cdnotificationType = null;
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const cdnotificationMessage = `${user.fName} ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} cancellation has been approved by the Supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(cd, cdnotificationTitle, cdnotificationMessage, cdnotificationType, refType, refId);


          res.status(200).json({
            message: 'Leave Cancellation has been Approved'
          });
        } else if (leave.status === 'Pending Change') {
          // change status to taken
          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: leave.startDate, endDate: leave.endDate, comment: leave.comment, typ: leave.type

          };
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              $set: {
                status: 'Taken',
                startDate: leave.takenPending.startDate,
                endDate: leave.takenPending.endDate,
                comment: leave.takenPending.comment,
                type: leave.takenPending.type,
                takenPending: {
                  startDate: '',
                  endDate: '',
                  comment: '',
                  type: '',
                  status: ''
                }
              }
            }
          );

          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();
          const subject = 'Taken leave modification approved by supervisor';
          // email to staff
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 

Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}
                         `;
          Mailer(from, user.email, subject, textStaff, cd.email);
          // save notification on user obj
          const notificationTitle = 'Modification of your taken Home Leave has been approved by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          const cdnotificationTitle = `${user.fName}  ${user.lName}'s Home Leave Modification has been approved by their Supervisor `;
          const cdnotificationType = null;
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const cdnotificationMessage = `${user.fName}  ${user.lName}'s taken Home leave modification to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(cd, cdnotificationTitle, cdnotificationMessage, cdnotificationType, refType, refId);


          res.status(200).json({
            message: 'Leave Modification has been Approved'
          });
        } else if (leave.status === 'Approved') {
          res.status(400).json({
            message: 'Leave has Already been Approved'
          });
        } else {
          // respond with invalid progress
          return res.status(400).json({
            message: 'invalid Status'
          });
        }
      } else {
      // Leave not home
      // change status to approved and notify
      // approve & notify that supervisor approved their leave request

        // eslint-disable-next-line no-lonely-if
        if (leave.status === 'Pending Not Taken') {
        // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Not Taken' } }
          );
          // sends mail to supervisor and notification about status
          // email to staff
          const subject = 'Taken leave cancellation approved by supervisor';
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 
         
Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}
                                  `;
          Mailer(from, user.email, subject, textStaff, '');
          // save notification on user obj
          const notificationTitle = 'Cancellation of Leave has been approved by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);
          res.status(200).json({
            message: 'Leave Cancellation has been Approved'
          });
        } else if (leave.status === 'Pending Change') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              $set: {
                status: 'Taken',
                startDate: leave.takenPending.startDate,
                endDate: leave.takenPending.endDate,
                comment: leave.takenPending.comment,
                type: leave.takenPending.type,
                takenPending: {
                  startDate: '',
                  endDate: '',
                  comment: '',
                  type: ''
                }
              }
            }
          );

          const modLeaves = {
            // eslint-disable-next-line max-len
            startDate: leave.startDate, endDate: leave.endDate, comment: leave.comment, typ: leave.type

          };
          leave.modificationDetails.modLeaves.push(modLeaves);
          await leave.save();
          // sends mail to staff and notification about status
          const subject = 'Taken leave modification approved by supervisor';
          // email to staff
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 

Modification of your taken Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}
                         `;
          Mailer(from, user.email, subject, textStaff, '');
          // save notification on user obj
          const notificationTitle = 'Modification of your taken Home Leave has been approved by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Modification of your taken Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave modification has been Approved'
          });
        } else {
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Approved' } }
          );
          // sends mail to staff and notification about leave approval
          // Send the email
          const subject = 'Leave approved by supervisor';
          // prettier-ignore
          const text = `Dear ${user.fName}, 
 
Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.${footer}
                                    `;

          Mailer(from, to, subject, text, user.supervisorEmail);
          // save notification on user obj
          const notificationTitle = 'Leave has been approved by supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved by your supervisor.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave has been Approved'
          });
        }
      }
    } else if (status === 'Declined') {
      // prettier-ignore
      if (
        (user.type === 'expat' || user.type === 'tcn') && leave.type === 'Home'
      ) {
        const cd = await User.findOne({ 'roles.countryDirector': true });
        if (!cd) {
          return res.status(400).json({
            message: 'Country Director is not Registered in the system'
          });
        }
        if (leave.status === 'Pending Supervisor') {
          // change status to rejected and notify
          // notify that supervisor rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Supervisor Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about supervisor leave rejection
          const subject = 'Leave declined by supervisor';
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                                   `;
          Mailer(from, to, subject, text, '');
          // save notification on user obj
          const notificationTitle = 'Leave has been declined by your supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave has been Declined'
          });
        } else if (leave.status === 'Pending Country Director') {
          // change status to rejected and notify
          // notify that CD rejected their leave request
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Country Director Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about CD leave rejection
          const subject = 'Leave declined by the Country director';
          // Send the email
          // prettier-ignore
          const text = `Dear ${user.fName}, 

Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by the Country director. Reason: ${reason}.${footer}
                                   `;
          Mailer(from, to, subject, text, user.supervisorEmail);
          // save notification on user obj
          const notificationTitle = 'Leave has been declined by the Country director';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by the Country director. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          const supervisornotificationTitle = `${user.fName}  ${user.lName}'s Home Leave has been declined by the Country director.`;
          const supervisornotificationType = null;
          refType = 'Leaves';
          refId = leave._id;
          // prettier-ignore
          // eslint-disable-next-line max-len
          const supervisornotificationMessage = `${user.fName}  ${user.lName}'s ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by the Country director. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(supervisor, supervisornotificationTitle, supervisornotificationMessage, supervisornotificationType, refType, refId);

          res.status(200).json({
            message: 'Leave has been Declined'
          });
        } else if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken', rejectionReason: reason } }
          );
          // sends mail to cd supervisor HR and notification about status
          // email to staff
          const subject = 'Taken leave cancellation declined by supervisor';
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 
          
Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                                   `;
          Mailer(from, user.email, subject, textStaff, cd.email);
          // save notification on user obj
          const notificationTitle = 'Cancellation of Home Leave has been declined by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave Cancellation has been Declined'
          });
        } else if (leave.status === 'Pending Change') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              $set: {
                status: 'Taken',
                rejectionReason: reason,
                takenPending: {
                  startDate: leave.takenPending.startDate,
                  endDate: leave.takenPending.endDate,
                  type: leave.takenPending.type,
                  comment: leave.takenPending.comment,
                  status: 'Supervisor Declined'
                }
              }
            }
          );
          // sends mail to cd  and notification about status
          // sends mail to staff and notification about status
          const subject = 'Taken leave modification declined by supervisor';
          // email to staff
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 
 
Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                          `;
          Mailer(from, user.email, subject, textStaff, cd.email);
          // save notification on user obj
          const notificationTitle = 'Modification of your taken Home Leave has been declined by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave modification has been Declined'
          });
        } else {
          return res.status(400).json({
            message: 'Invalid Status'
          });
        }
      } else { // Leave not home
        // change status to rejected
        // notify that supervisor rejected their leave request
        // eslint-disable-next-line no-lonely-if
        if (leave.status === 'Pending Not Taken') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Taken', rejectionReason: reason } }
          );
          // sends mail to cd supervisor HR and notification about status
          // email to staff
          const subject = 'Taken leave cancellation declined by supervisor';
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 
           
Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                                    `;
          Mailer(from, user.email, subject, textStaff, '');
          // save notification on user obj
          const notificationTitle = 'Cancellation of Home Leave has been declined by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Cancellation of your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave Cancellation has been Declined'
          });
        } else if (leave.status === 'Pending Change') {
          // change status to nottaken
          await Leave.updateOne(
            {
              _id: leaveId
            },
            {
              $set: {
                status: 'Taken',
                rejectionReason: reason,
                takenPending: {
                  startDate: leave.takenPending.startDate,
                  endDate: leave.takenPending.endDate,
                  type: leave.takenPending.type,
                  comment: leave.takenPending.comment,
                  status: 'Supervisor Declined'
                }
              }
            }
          );
          // sends mail to staff and notification about status
          const subject = 'Taken leave modification declined by supervisor';
          // email to staff
          // prettier-ignore
          const textStaff = `Dear  ${user.fName}, 
   
Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                            `;
          Mailer(from, user.email, subject, textStaff, '');
          // save notification on user obj
          const notificationTitle = 'Modification of your taken Home Leave has been declined by your Supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Modification of your taken Home Leave to a ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave Modification has been Declined'
          });
        } else {
          await Leave.updateOne(
            {
              _id: leaveId
            },
            { $set: { status: 'Supervisor Declined', rejectionReason: reason } }
          );
          // sends mail to staff and notification about supervisor leave rejection
          // Send the email
          const subject = 'Leave declined by supervisor';
          // prettier-ignore
          const text = `Dear ${user.fName}, 
 
Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.${footer}
                                    `;
          Mailer(from, to, subject, text, '');
          // save notification on user obj
          const notificationTitle = 'Leave has been declined by supervisor';
          const notificationType = '/hr/Apply4Leave';
          refType = 'Leaves';
          refId = leave._id;
          // eslint-disable-next-line max-len
          const notificationMessage = `Your ${daysDetails.totalDays} day${daysDetails.totalDays === 1 ? '' : 's'} ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been declined by your supervisor. Reason: ${reason}.`;
          // eslint-disable-next-line max-len
          await storeNotification(user, notificationTitle, notificationMessage, notificationType, refType, refId);

          res.status(200).json({
            message: 'Leave has been Declined'
          });
        }
      }
    } else {
      return res.status(400).json({
        message: 'Invalid Leave status',
      });
    }
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling Leave',
    });
  }
};

module.exports = supervisorHandleLeave;
