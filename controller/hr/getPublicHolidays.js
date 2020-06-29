const debug = require('debug')('server');
const PublicHoliday = require('../../model/PublicHoliday');

const getPublicHolidays = async (req, res) => {
  try {
    const publicholiday = await PublicHoliday.find({});
    res.json(publicholiday);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Public Holidays' });
  }
};

module.exports = getPublicHolidays;
