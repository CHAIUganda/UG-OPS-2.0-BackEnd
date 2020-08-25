// authController.js

const registerUser = require('./registerUser');
const editUser = require('./editUser');
const login = require('./login');
const getUsers = require('./getUsers');
const getLoggedInUser = require('./getLoggedInUser');
const handleNotifications = require('./handleNotifications');
const resetOnFirstLogin = require('./resetOnFirstLogin');
const forgotPassword = require('./forgotPassword');
const passwordReset = require('./passwordReset');

// Handle new staff
exports.registerUser = registerUser;

// Handle edit staff
exports.editUser = editUser;

// Handle login
exports.login = login;

// Handle resetOnFirstLogin
exports.resetOnFirstLogin = resetOnFirstLogin;

// Handle forgotPassword
exports.forgotPassword = forgotPassword;

// Handle passwordReset
exports.passwordReset = passwordReset;

// Handle get all users
exports.getUsers = getUsers;

// Handle me "generate token"
exports.getLoggedInUser = getLoggedInUser;

// Handle notifications
exports.handleNotifications = handleNotifications;
