const debug = require('debug')('server');
const moment = require('moment-timezone');
const Contract = require('../../../model/Contract');
const User = require('../../../model/User');

const handleSnoozedContractNotifications = async () => {
  try {
    const expiryIn = 31;
    const user = await User.find({});
    user.password = undefined;

    const recurseProcessLeave = async (controller, arr) => {
      if (controller < arr.length) {
        // eslint-disable-next-line object-curly-newline
        const { _id } = arr[controller];
        const contract = await Contract.findOne({
          _userId: _id,
          $and: [
            {
              contractStatus: 'ACTIVE',
            },
            {
              contractSnooze: true,
            },
          ],
        });

        if (!contract) {
          recurseProcessLeave(controller + 1, arr);
        } else {
          let { snoozeDate } = contract;
          // set timezone to kampala
          const CurrentDate = moment().tz('Africa/Kampala').format();
          snoozeDate = moment(snoozeDate);
          const diff = snoozeDate.diff(CurrentDate, 'days') + 1;
          // chk if notifications have been snoozed for 31 days
          // eslint-disable-next-line eqeqeq
          if (diff == expiryIn) {
            // reset snooze to false

            await Contract.updateOne(
              {
                _id: contract._id,
              },
              { $set: { contractSnooze: false, snoozeDate: undefined } }
            );
            recurseProcessLeave(controller + 1, arr);
          } else {
            recurseProcessLeave(controller + 1, arr);
          }
        }
      }
    };
    await recurseProcessLeave(0, user);
  } catch (e) {
    debug(e.message);
    console.log(e.message);
  }
};

module.exports = handleSnoozedContractNotifications;
