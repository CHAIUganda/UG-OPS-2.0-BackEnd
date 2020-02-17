// authController.js

const registerUser = require('./registerUser');
const getUsers = require('./getUsers');

// Handle new staff
exports.registerUser = registerUser;

// Handle get all users
exports.getUsers = getUsers;
