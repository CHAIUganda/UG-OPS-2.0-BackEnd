// leaveController.js
// Import Leave model

const createPublicHoliday = require('./createPublicHoliday');
const removePublicHoliday = require('./removePublicHoliday');
const getPublicHolidays = require('./getPublicHolidays');
const createProgram = require('./createProgram');
const editProgram = require('./editProgram');
const getPrograms = require('./getPrograms');

// Handle new public holiday
exports.createPublicHoliday = createPublicHoliday;

// Handle remove public holiday
exports.removePublicHoliday = removePublicHoliday;

// Handle get all Public Holidays
exports.getPublicHolidays = getPublicHolidays;

// Handle Program
exports.createProgram = createProgram;

// Handle remove Program
exports.editProgram = editProgram;

// Handle get all Programs
exports.getPrograms = getPrograms;
