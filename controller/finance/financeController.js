// financeController.js

const createGrant = require('./createGrant');
const editGrant = require('./editGrant');
const getGrants = require('./getGrants');
const createProject = require('./createProject');
const editProject = require('./editProject');
const getProjects = require('./getProjects');
const createObjective = require('./createObjective');
const editObjective = require('./editObjective');
const getObjectives = require('./getObjectives');

// Handle creation of a Grant
exports.createGrant = createGrant;

// Handle Editing of a Grant Details
exports.editGrant = editGrant;

// Handle get Grants
exports.getGrants = getGrants;

// Handle creation of a Project
exports.createProject = createProject;

// Handle Editing of a Project Details
exports.editProject = editProject;

// Handle get Projects
exports.getProjects = getProjects;

// Handle creation of a Objective
exports.createObjective = createObjective;

// Handle Editing of a Objective Details
exports.editObjective = editObjective;

// Handle get Objectives
exports.getObjectives = getObjectives;
