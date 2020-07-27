// authController.js

const registerUser = require('./registerUser');
const editUser = require('./editUser');
const login = require('./login');
const getUsers = require('./getUsers');
const getLoggedInUser = require('./getLoggedInUser');
const handleNotifications = require('./handleNotifications');

// Handle new staff
exports.registerUser = registerUser;

// Handle edit staff
exports.editUser = editUser;

// Handle login
exports.login = login;

// Handle get all users
exports.getUsers = getUsers;

// Handle me "generate token"
exports.getLoggedInUser = getLoggedInUser;

// Handle notifications
exports.handleNotifications = handleNotifications;
