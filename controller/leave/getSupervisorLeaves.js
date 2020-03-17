const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const getSupervisorLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication

    const staffEmail = req.params.email;
    const { status } = req.params;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'Supervisor does not exist'
      });
    }
    let query; // more queries to be added for leaves
    const publicHolidays = await PublicHoliday.find({});
    if (status === 'all') {
      query = { supervisorEmail: staffEmail };
    } else {
      query = { supervisorEmail: staffEmail, status };
    }
    const leaves = await Leave.find(query);
    const combinedArraySupervisor = [];
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
        lName,
        comment
      } = leave;
      const Leaveprogram = leave.program;
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
        lName,
        comment,
        status: Leavestatus,
        program: Leaveprogram,
        leaveDays: daysDetails.leaveDays,
        daysTaken: daysDetails.totalDays,
        weekendDays: daysDetails.weekendDays,
        publicHolidays: daysDetails.holidayDays
      };

      combinedArraySupervisor.push(leaveRemade);
    });

    let combinedArray = [];
    if (user.roles.countryDirector) {
      const statusCd = 'Pending Country Director';
      const queryCd = { status: statusCd };
      const leavesCd = await Leave.find(queryCd);

      const combinedArrayCD = [];
      leavesCd.forEach((leave) => {
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
          lName,
          comment
        } = leave;
        const Leaveprogram = leave.program;
        const Leavestatus = leave.status;

        const leaveRemade = {
          staff,
          modificationDetails,
          _id,
          startDate,
          endDate,
          type,
          supervisorEmail,
          lName,
          comment,
          status: Leavestatus,
          program: Leaveprogram,
          leaveDays: daysDetails.leaveDays,
          daysTaken: daysDetails.totalDays,
          weekendDays: daysDetails.weekendDays,
          publicHolidays: daysDetails.holidayDays
        };

        combinedArrayCD.push(leaveRemade);
      });

      combinedArray = [...combinedArraySupervisor, ...combinedArrayCD];
      res.status(200).json(combinedArray);
    } else {
      res.status(200).json(combinedArraySupervisor);
    }
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getSupervisorLeaves;
