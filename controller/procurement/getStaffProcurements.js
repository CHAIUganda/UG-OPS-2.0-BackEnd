const debug = require('debug')('server');
const User = require('../../model/User');
const Procurement = require('../../model/Procurement');
const Program = require('../../model/Program');

const getStaffProcurements = async (req, res) => {
  try {
    const staffEmail = req.params.email;
    const { status } = req.params;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }

    const userProgram = await Program.findOne({
      _id: user.programId,
    });

    if (!userProgram) {
      return res.status(400).json({
        message: `${user.fName} ${user.lName}'s Program does not exist. `,
      });
    }

    if (!user._id.equals(userProgram.operationsLeadId)) {
      return res.status(400).json({
        message: `${user.fName} ${user.lName} is not the Operations lead for the ${userProgram.shortForm} program `,
      });
    }
    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all') {
        query = { _id: { $in: user.procurements } };
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
        query = { _id: { $in: user.procurements }, status };
      } else if (status === 'Pending') {
        // await Leave.createIndex({ status: 'text' });
        query = { _id: { $in: user.procurements }, $text: { $search: status } };
      } else {
        return res.status(400).json({
          message: 'Invalid Status',
        });
      }
    }
    const { notifications } = user;
    const procurements = await Procurement.find(query);
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
          (notification) => notification.refId.equals(_id) && notification.refType === 'Leaves' && notification.linkTo === '/hr/Apply4Leave' && notification.status === 'unRead'
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
    await recurseProcessLeave(0, procurements);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching procurements' });
  }
};

module.exports = getStaffProcurements;
