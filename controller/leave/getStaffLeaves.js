const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');
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
        message: 'User does not exist'
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
      } else {
        return res.status(400).json({
          message: 'Invalid Status'
        });
      }
    }

    const leaves = await Leave.find(query);
    const combinedArray = [];
    leaves.forEach((leave) => {
      const daysDetails = getLeaveDaysNo(
        leave.startDate,
        leave.endDate,
        publicHolidays
      );

      const {
        staff,
        modificationDetails,
        _id,
        startDate,
        endDate,
        type,
        supervisorEmail,
        rejectionReason,
        comment,
        program
      } = leave;

      const Leavestatus = leave.status;

      const leaveRemade = {
        staff,
        modificationDetails,
        _id,
        startDate,
        endDate,
        type,
        supervisorEmail,
        rejectionReason,
        comment,
        status: Leavestatus,
        program,
        leaveDays: daysDetails.leaveDays,
        daysTaken: daysDetails.totalDays,
        weekendDays: daysDetails.weekendDays,
        publicHolidays: daysDetails.holidayDays
      };

      combinedArray.push(leaveRemade);
    });

    res.status(200).json(combinedArray);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getStaffLeaves;
