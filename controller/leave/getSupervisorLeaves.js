const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');
const Program = require('../../model/Program');
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
    } else if (status === 'Pending') {
      // await Leave.createIndex({ status: 'text' });

      query = {
        supervisorEmail: staffEmail,
        $text: { $search: status }
      };
    } else {
      query = { supervisorEmail: staffEmail, status };
    }
    const leaves = await Leave.find(query);
    const combinedArraySupervisor = [];
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

        combinedArraySupervisor.push(leaveRemade);
        recurseProcessLeave(controller + 1, arr);
      } else {
        let combinedArray = [];
        if (user.roles.countryDirector) {
          const statusCd = 'Pending Country Director';
          const queryCd = { status: statusCd };
          const leavesCd = await Leave.find(queryCd);

          const combinedArrayCD = [];
          const recurseProcessLeaveCD = async (controllercd, arrcd) => {
            if (controllercd < arrcd.length) {
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
              } = arrcd[controllercd];

              const daysDetails = getLeaveDaysNo(
                startDate,
                endDate,
                publicHolidays
              );

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
              const Leavestatus = arrcd[controllercd].status;

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

              combinedArrayCD.push(leaveRemade);
              recurseProcessLeaveCD(controllercd + 1, arrcd);
            }
          };
          await recurseProcessLeaveCD(0, leavesCd);
          combinedArray = [...combinedArraySupervisor, ...combinedArrayCD];
          res.status(200).json(combinedArray);
        } else {
          res.status(200).json(combinedArraySupervisor);
        }
      }
    };
    await recurseProcessLeave(0, leaves);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getSupervisorLeaves;
