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
      } else if (status !== 'all' && program === 'all') {
        query = { status };
      } else {
        query = { program, status };
      }
    }

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
          rejectionReason
        } = arr[controller];

        const daysDetails = getLeaveDaysNo(startDate, endDate, publicHolidays);

        let Leaveprogram;
        let LeaveprogramShortForm;

        const userProgram = await Program.findOne({
          _id: programId
        });

        if (!userProgram) {
          Leaveprogram = 'NA';
          LeaveprogramShortForm = 'NA';
          // eslint-disable-next-line no-else-return
        } else {
          Leaveprogram = userProgram.program;
          LeaveprogramShortForm = userProgram.shortForm;
        }
        const Leavestatus = arr[controller].status;

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
          publicHolidays: daysDetails.holidayDays
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

module.exports = getAllStaffLeaves;
