// authController.js

const registerUser = require('./registerUser');
const login = require('./login');
const generateToken = require('./generateToken');
const getUsers = require('./getUsers');

// Handle new staff
exports.registerUser = registerUser;

// Handle login
exports.login = login;

// Handle me "generate token"
exports.generateToken = generateToken;

// Handle get all users
exports.getUsers = getUsers;
