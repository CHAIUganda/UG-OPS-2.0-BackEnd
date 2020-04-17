const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const WorkPermit = require('../../model/WorkPermit');

const handleWPNotifications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const { workPermitId } = req.body;
  let { wpDismiss, wpSnooze } = req.body;

  try {
    const workPermit = await WorkPermit.findOne({
      _id: workPermitId,
    });
    if (!workPermit) {
      return res.status(400).json({
        message: 'This contract  doesnot exist',
      });
    }
    if (wpDismiss == null) {
      wpDismiss = workPermit.wpDismiss;
    }
    if (wpSnooze == null) {
      wpSnooze = workPermit.wpSnooze;
    }
    // modify program
    await WorkPermit.updateOne(
      {
        _id: workPermitId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          wpDismiss,
          wpSnooze,
        },
      }
    );

    res.status(200).json({
      message: 'Work Permit expiry notification updated successfully',
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling WP expiry notification',
    });
  }
};

module.exports = handleWPNotifications;
