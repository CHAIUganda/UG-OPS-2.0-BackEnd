const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const PublicHoliday = require('../../model/PublicHoliday');

const createPublicHoliday = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    name,
    date
  } = req.body;

  try {
    const holiday = await PublicHoliday.findOne({
      date
    });
    if (holiday) {
      return res.status(400).json({
        message: 'This holiday already exists'
      });
    }

    const holidaytoSave = new PublicHoliday({
      name,
      date
    });

    await holidaytoSave.save();
    res.status(201).json({
      holidaytoSave
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Public Holiday'
    });
  }
};

module.exports = createPublicHoliday;
