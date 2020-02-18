// leaveController.js
// Import Leave model

const createPublicHoliday = require('./createPublicHoliday');
const removePublicHoliday = require('./removePublicHoliday');
const getPublicHolidays = require('./getPublicHolidays');

// Handle new public holiday
exports.createPublicHoliday = createPublicHoliday;

// Handle remove public holiday
exports.removePublicHoliday = removePublicHoliday;

// Handle get all users
exports.getPublicHolidays = getPublicHolidays;
