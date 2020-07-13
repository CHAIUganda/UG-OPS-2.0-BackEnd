const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const moment = require('moment');

const errorToString = require('../../helpers/errorToString');
const PublicHoliday = require('../../model/PublicHoliday');

const createPublicHoliday = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    name,
    date
  } = req.body;

  try {
    // prettier-ignore
    let postDate = `${new Date().getFullYear()}-
                      ${date.replace('/', '-').split('-')[1]}-${
  date.replace('/', '-').split('-')[0]
}`;

    postDate = new Date(postDate);

    const holiday = await PublicHoliday.find({});
    holiday.forEach((hol) => {
      // prettier-ignore
      let dbHol = `${new Date().getFullYear()}-
                      ${hol.date.replace('/', '-').split('-')[1]}-${
  hol.date.replace('/', '-').split('-')[0]
}`;
      dbHol = new Date(dbHol);
      if (moment(postDate).isSame(dbHol)) {
        return res.status(400).json({
          message: 'This holiday already exists',
        });
      }
    });

    const holidaytoSave = new PublicHoliday({
      name,
      date,
    });

    await holidaytoSave.save();
    res.status(201).json({
      holidaytoSave,
    });
  } catch (err) {
    debug(err.message);
    console.log(err);
    res.status(500).json({
      message: 'Error Creating Public Holiday',
    });
  }
};

module.exports = createPublicHoliday;
