const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const moment = require('moment-timezone');
const errorToString = require('../../helpers/errorToString');
const Contract = require('../../model/Contract');

const handleContractNotifications = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const { contractId } = req.body;
  let { contractDismiss, contractSnooze } = req.body;

  try {
    const contract = await Contract.findOne({
      _id: contractId,
    });
    if (!contract) {
      return res.status(400).json({
        message: 'This contract  doesnot exist',
      });
    }
    if (contractDismiss == null) {
      contractDismiss = contract.contractDismiss;
    }
    if (contractSnooze == null) {
      contractSnooze = contract.contractSnooze;
    }
    // date to track snooze
    let today;
    if (contractSnooze === true) {
      const CurrentDate = moment().tz('Africa/Kampala').format();
      today = new Date(CurrentDate);
    }

    // modify program
    await Contract.updateOne(
      {
        _id: contractId,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          contractDismiss,
          contractSnooze,
          snoozeDate: today,
        },
      }
    );

    res.status(200).json({
      message: 'Contract expiry notification updated successfully',
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Handling notification',
    });
  }
};

module.exports = handleContractNotifications;
