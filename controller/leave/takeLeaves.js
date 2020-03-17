const Leave = require('../../model/Leave');
const User = require('../../model/User');
const Mailer = require('../../helpers/Mailer');
const debug = require('debug')('server');
const moment = require('moment-timezone');

const takeLeaves = async () => {
  try {
    // set timezone to kampala
    const CurrentDate = moment()
      .tz('Africa/Kampala')
      .format();
  } catch (e) {
    console.log(e.message);
    debug(e.message);
  }
};

module.exports = takeLeaves;
