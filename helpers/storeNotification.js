const moment = require('moment-timezone');
const Pusher = require('pusher');
const mongoose = require('mongoose');

const storeNotification = async (
  user,
  title,
  message,
  type,
  refType,
  refId
) => {
  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.PUSHER_APP_CLUSTER,
    });
    // set timezone to kampala
    const CurrentDate = moment().tz('Africa/Kampala');
    const today = new Date(CurrentDate);

    const id = mongoose.Types.ObjectId();
    // save notification on user obj
    const notification = {
      title,
      _id: id,
      message,
      status: 'unRead',
      createDate: today,
      linkTo: type,
      refType,
      refId,
    };
    await user.notifications.push(notification);
    await user
      .save()
      .then(() => {
        pusher.trigger('notifications', user.email, {
          _id: notification._id,
          title,
          message,
          status: 'unRead',
          createDate: today,
          linkTo: type,
          refType,
          refId,
          staffEmail: user.email,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = storeNotification;
