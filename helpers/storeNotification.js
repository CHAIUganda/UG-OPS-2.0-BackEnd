const moment = require('moment-timezone');

const storeNotification = async (
  user,
  title,
  message,
  type,
  refType,
  refId
) => {
  try {
    // set timezone to kampala
    const CurrentDate = moment().tz('Africa/Kampala');
    const today = new Date(CurrentDate);
    // save notification on user obj
    const notification = {
      title,
      message,
      status: 'unRead',
      createDate: today,
      linkTo: type,
      refType,
      refId,
    };
    user.notifications.push(notification);
    await user.save();
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = storeNotification;
