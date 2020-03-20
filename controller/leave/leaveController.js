// leaveController.js

const createLeave = require('./createLeave');
const getStaffLeaves = require('./getStaffLeaves');
const getSupervisorLeaves = require('./getSupervisorLeaves');
const supervisorHandleLeave = require('./supervisorHandleLeave');
const getAllStaffLeaves = require('./getAllStaffLeaves');
const getStaffLeavesTaken = require('./getStaffLeavesTaken');
const staffModifyLeave = require('./staffModifyLeave');

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

// Staff Modify Leave
exports.staffModifyLeave = staffModifyLeave;
