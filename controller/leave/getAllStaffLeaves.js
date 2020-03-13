const debug = require('debug')('server');
const Program = require('../../model/Program');
const Leave = require('../../model/Leave');
const getLeaveDaysNo = require('./getLeaveDaysNo');
const PublicHoliday = require('../../model/PublicHoliday');

const getAllStaffLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const publicHolidays = await PublicHoliday.find({});
    const { program } = req.params;
    const { status } = req.params;
    if (!program === 'all') {
      const programs = await Program.findOne({ name: program });
      if (!programs) {
        return res.status(400).json({
          message: 'User Program does not exist'
        });
      }
    }

    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all' && program === 'all') {
        query = {};
      } else if (status === 'all' && program !== 'all') {
        query = { program };
      } else {
        query = { program, status };
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

      combinedArray.push(leaveRemade);
    });

    res.status(200).json(combinedArray);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getAllStaffLeaves;
