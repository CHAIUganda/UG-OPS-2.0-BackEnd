const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const PublicHoliday = require('../../model/PublicHoliday');

const removePublicHoliday = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    id
  } = req.body;

  try {
    const holiday = await PublicHoliday.findOne({
      _id: id
    });
    if (!holiday) {
      return res.status(400).json({
        message: 'This holiday doesnot exist'
      });
    }
    // delete holiday
    holiday.remove();
    res.status(200).json({
      message: 'Holiday removed successfully'
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error removing Public Holiday'
    });
  }
};

module.exports = removePublicHoliday;
