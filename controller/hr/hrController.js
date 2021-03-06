// leaveController.js
// Import Leave model

const createPublicHoliday = require('./createPublicHoliday');
const removePublicHoliday = require('./removePublicHoliday');
const getPublicHolidays = require('./getPublicHolidays');
const createProgram = require('./createProgram');
const editProgram = require('./editProgram');
const getPrograms = require('./getPrograms');
const getUsersContracts = require('./getUsersContracts');
const getUsersWorkPermits = require('./getUsersWorkPermits');
const deleteProgram = require('./deleteProgram');
const handleContractNotifications = require('./handleContractNotifications');
const handleWPNotifications = require('./handleWPNotifications');
const addStaffNewContract = require('./addStaffNewContract');
const addStaffNewWP = require('./addStaffNewWP');

// Handle new public holiday
exports.createPublicHoliday = createPublicHoliday;

// Handle remove public holiday
exports.removePublicHoliday = removePublicHoliday;

// Handle get all Public Holidays
exports.getPublicHolidays = getPublicHolidays;

// Handle Program
exports.createProgram = createProgram;

// Handle edit Program
exports.editProgram = editProgram;

// Handle get all Programs
exports.getPrograms = getPrograms;

// Handle get staff contracts
exports.getUsersContracts = getUsersContracts;
// Handle get staff contracts
exports.getUsersWorkPermits = getUsersWorkPermits;

// Handle remove Program
exports.deleteProgram = deleteProgram;

// handle Contract Notifications
exports.handleContractNotifications = handleContractNotifications;

// handle WorkPermit Notifications
exports.handleWPNotifications = handleWPNotifications;

// handle addStaffContract
exports.addStaffNewContract = addStaffNewContract;

// handle add Staff Work Permit
exports.addStaffNewWP = addStaffNewWP;
