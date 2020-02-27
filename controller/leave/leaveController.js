// leaveController.js

const createLeave = require('./createLeave');
const getStaffLeaves = require('./getStaffLeaves');
const getSupervisorLeaves = require('./getSupervisorLeaves');

// Handle new Leave
exports.createLeave = createLeave;

// Handle get staff Leaves
exports.getStaffLeaves = getStaffLeaves;

// Handle get Supervisor Leaves
exports.getSupervisorLeaves = getSupervisorLeaves;
