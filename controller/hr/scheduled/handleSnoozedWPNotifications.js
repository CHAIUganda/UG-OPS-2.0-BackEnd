const debug = require('debug')('server');
const moment = require('moment-timezone');
const WorkPermit = require('../../../model/WorkPermit');
const User = require('../../../model/User');

const handleSnoozedWPNotifications = async () => {
  try {
    const expiryIn = 31;
    const user = await User.find({
      $or: [
        {
          type: 'tcn',
        },
        {
          type: 'expat',
        },
      ],
    });
    user.password = undefined;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id } = arr[controller];
        const workPermit = await WorkPermit.findOne({
          _userId: _id,
          $and: [
            {
              workPermitStatus: 'ACTIVE',
            },
            {
              wpSnooze: true,
            },
          ],
        });

        if (!workPermit) {
          recurseProcessLeave(controller + 1, arr);
        } else {
          let { snoozeDate } = workPermit;
          // set timezone to kampala
          const CurrentDate = moment().tz('Africa/Kampala').format();
          snoozeDate = moment(snoozeDate);
          const diff = snoozeDate.diff(CurrentDate, 'days') + 1;
          // chk if notifications have been snoozed for 31 days
          // eslint-disable-next-line eqeqeq
          if (diff == expiryIn) {
            // reset snooze to false

            await WorkPermit.updateOne(
              {
                _id: workPermit._id,
              },
              { $set: { wpSnooze: false, snoozeDate: undefined } }
            );
          } else {
            recurseProcessLeave(controller + 1, arr);
          }

          recurseProcessLeave(controller + 1, arr);
        }
      }
    };
    await recurseProcessLeave(0, user);
  } catch (e) {
    debug(e.message);
    console.log(e.message);
  }
};

module.exports = handleSnoozedWPNotifications;
