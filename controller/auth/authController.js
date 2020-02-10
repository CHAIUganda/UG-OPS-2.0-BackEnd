// authController.js

const registerUser = require('./registerUser');
const login = require('./login');
const getLoggedInUser = require('./getLoggedInUser');
const getUsers = require('./getUsers');
const verification = require('./verification');
const reset = require('./reset');

// Handle new staff
exports.registerUser = registerUser;

// Handle login
exports.login = login;

// Handle me "generate token"
exports.getLoggedInUser = getLoggedInUser;

// Handle get all users
exports.getUsers = getUsers;

// Handle user email verification
exports.verification = verification;

// Handle user email verification
exports.reset = reset;
