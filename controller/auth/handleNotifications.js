const { validationResult } = require('express-validator');
const debug = require('debug')('server');
const User = require('../../model/User');
const errorToString = require('../../helpers/errorToString');

const handleNotifications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }
  const { notificationId, staffEmail } = req.body;

  try {
    const user = await User.findOne({
      email: staffEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: 'User Doesnot Exist',
      });
    }

    // modify user
    await User.updateOne(
      {
        email: staffEmail,
        'notifications._id': notificationId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          'notifications.$.status': 'read',
        },
      }
    );

    res.status(201).json({ message: 'notification modified successfully' });
  } catch (err) {
    debug(err.message);
    res.status(500).json({ message: 'Error in Modifying notification' });
  }
};

module.exports = handleNotifications;
