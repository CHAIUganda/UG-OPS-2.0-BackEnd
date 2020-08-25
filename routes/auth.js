// Filename : auth.js

const express = require('express');
const { check } = require('express-validator');

// Import auth controller
const authController = require('../controller/auth/authController');

const router = express.Router();
const authenticator = require('../middleware/authenticator');
// const authenticationRequired = require('../middleware/oktaAuthenticator');

/**
 * @method - POST
 * @param - /registerUser
 * @description - User registration in the system
 */
router.post(
  '/registerUser',
  [
    // input validations
    check('fName', 'Please Enter a Valid First Name').not().isEmpty(),
    check('lName', 'Please Enter a Valid Last Name').not().isEmpty(),
    check('contractStartDate', 'Please Enter a Valid Contract Start Date')
      .not()
      .isEmpty(),
    check('gender', 'Please Enter a Valid Gender').not().isEmpty(),
    check('title', 'Please Enter a Valid Staff Title').not().isEmpty(),
    check('contractEndDate', 'Please Enter a Valid Contract End Date')
      .not()
      .isEmpty(),
    check('birthDate', 'Please Enter a Valid BirthDate').not().isEmpty(),
    check('contractType', 'Please Enter a Valid Contract Type').not().isEmpty(),
    check('type', 'Please Specify the type of Staff').not().isEmpty(),
    check('team', 'Please Specify the  Staff team').not().isEmpty(),
    check('programId', 'Please Specify the staff Program Id').not().isEmpty(),
    check(
      'supervisorEmail',
      'Please supply a valid Supervisor Email'
    ).isEmail(),
    check('email', 'Please enter a valid email').isEmail(),
  ],
  authController.registerUser
);

/**
 * @method - POST
 * @param - /editUser
 * @description - User Modification
 */
router.post(
  '/editUser',
  [
    // input validations
    check('staffId', 'Please enter a valid Staff ID').not().isEmpty(),
  ],
  authenticator,
  authController.editUser
);

/**
 * @method - POST
 * @param - /handleNotifications
 * @description - User Modification
 */
router.post(
  '/handleNotifications',
  [
    // input validations
    check('staffEmail', 'Please enter a valid email').isEmail(),
    check('notificationId', 'Please Provide a notificationId').not().isEmpty(),
  ],
  authenticator,
  authController.handleNotifications
);

/**
 * @method - POST
 * @param - /login
 * @description - User authentication into the system. calls controller after checking inputs
 */
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Minimum password length is 6').isLength({
      min: 6,
    }),
  ],
  authController.login
);

/**
 * @method - POST
 * @param - /resetOnFirstLogin
 * @description - User password set on first login
 */
router.post(
  '/resetOnFirstLogin',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Minimum password length is 6').isLength({
      min: 6,
    }),
  ],
  authController.resetOnFirstLogin
);

/**
 * @method - POST
 * @param - /passwordReset
 * @description - User password   change
 */
router.post(
  '/passwordReset',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'oldPassword',
      'Enter the old password minimum  length is 6'
    ).isLength({
      min: 6,
    }),
    check('newPassword', 'Enter a new password minimum  length is 6').isLength({
      min: 6,
    }),
  ],
  authenticator,
  authController.passwordReset
);

/**
 * @method - POST
 * @param - http://localhost:8080/auth/reset/
 * @description - User password set on first login
 */
router.post(
  '/forgotPassword',
  [check('email', 'Please enter a valid email').isEmail()],
  authController.forgotPassword
);

/**
 * @method - GET
 * @description - Get LoggedIn User. authenticator is a middleware will be used to
 * verify the token, retrieve user based on the token payload.
 * calls controller after checking inputs
 * @param - /auth/me
 */
router.get('/getLoggedInUser', authenticator, authController.getLoggedInUser);

/**
 * @method - GET
 * @description - Get Users. authenticator is a middleware will be used to
 * verify the token, retrieve user based on the token payload.
 * calls controller after checking inputs
 * @param - /auth/getUsers
 */
router.get('/getUsers', authenticator, authController.getUsers);

module.exports = router;
