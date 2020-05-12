const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');
const Program = require('../../model/Program');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const getStaffLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication

    const staffEmail = req.params.email;
    const { status } = req.params;
    const user = await User.findOne({ email: staffEmail });
    const publicHolidays = await PublicHoliday.find({});
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }
    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all') {
        query = { _id: { $in: user.leaves } };
      } else if (
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Supervisor' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Country Director' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Supervisor Declined' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Country Director Declined' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Planned' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Taken' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Change' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Not Taken' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Pending Not Taken'
      ) {
        query = { _id: { $in: user.leaves }, status };
      } else if (status === 'Pending') {
        // await Leave.createIndex({ status: 'text' });
        query = { _id: { $in: user.leaves }, $text: { $search: status } };
      } else {
        return res.status(400).json({
          message: 'Invalid Status',
        });
      }
    }
    const { notifications } = user;
    const leaves = await Leave.find(query);
    const combinedArray = [];
    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const {
          staff,
          modificationDetails,
          _id,
          startDate,
          endDate,
          type,
          programId,
          supervisorEmail,
          comment,
          rejectionReason,
        } = arr[controller];

        const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);

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
          Leaveprogram = userProgram.name;
          LeaveprogramShortForm = userProgram.shortForm;
        }
        const Leavestatus = arr[controller].status;
        const notificationDetails = notifications.filter(
          // prettier-ignore
          (notification) => notification.refId.equals(_id) && notification.refType === 'Leaves' && notification.linkTo === '/hr/Apply4Leave'
        );

        const leaveRemade = {
          staff,
          modificationDetails,
          _id,
          startDate,
          endDate,
          type,
          supervisorEmail,
          comment,
          rejectionReason,
          status: Leavestatus,
          programId,
          program: Leaveprogram,
          programShortForm: LeaveprogramShortForm,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays,
          notificationDetails,
        };

        combinedArray.push(leaveRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        res.json(combinedArray);
      }
    };
    await recurseProcessLeave(0, leaves);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getStaffLeaves;
