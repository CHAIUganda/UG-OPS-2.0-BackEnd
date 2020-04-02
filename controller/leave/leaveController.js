// leaveController.js

const createLeave = require('./createLeave');
const getStaffLeaves = require('./getStaffLeaves');
const getSupervisorLeaves = require('./getSupervisorLeaves');
const supervisorHandleLeave = require('./supervisorHandleLeave');
const getAllStaffLeaves = require('./getAllStaffLeaves');
const getStaffLeavesTaken = require('./getStaffLeavesTaken');
const getAllStaffLeavesTaken = require('./getAllStaffLeavesTaken');
const staffModifyLeave = require('./staffModifyLeave');
const handlePlannedLeave = require('./handlePlannedLeave');

const removeLeave = require('./removeLeave');

// Handle new Leave
exports.createLeave = createLeave;

// Handle get staff Leaves
exports.getStaffLeaves = getStaffLeaves;

// Handle get Supervisor Leaves
exports.getSupervisorLeaves = getSupervisorLeaves;

// Supervisor Handle Leave
exports.supervisorHandleLeave = supervisorHandleLeave;

// Handle get all staff Leaves
exports.getAllStaffLeaves = getAllStaffLeaves;

// Handle get staff Leaves Taken
exports.getStaffLeavesTaken = getStaffLeavesTaken;

// Handle get All staff Leaves Taken
exports.getAllStaffLeavesTaken = getAllStaffLeavesTaken;

// Staff Modify Leave
exports.staffModifyLeave = staffModifyLeave;

// Staff Handle planned Leave
exports.handlePlannedLeave = handlePlannedLeave;

// Staff Handle planned Leave
exports.removeLeave = removeLeave;
