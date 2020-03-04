// leaveController.js

const createLeave = require('./createLeave');
const getStaffLeaves = require('./getStaffLeaves');
const getSupervisorLeaves = require('./getSupervisorLeaves');
const handleLeave = require('./handleLeave');

// Handle new Leave
exports.createLeave = createLeave;

// Handle get staff Leaves
exports.getStaffLeaves = getStaffLeaves;

// Handle get Supervisor Leaves
exports.getSupervisorLeaves = getSupervisorLeaves;

// Handle Leave
exports.handleLeave = handleLeave;
