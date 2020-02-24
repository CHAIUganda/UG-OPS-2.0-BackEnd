// Filename : auth.js

const express = require('express');
const { check } = require('express-validator/check');

// Import auth controller
const authController = require('../controller/auth/authController');

const router = express.Router();

/**
 * @method - POST
 * @param - /registerUser
 * @description - User registration in the system
 */
router.post(
  '/registerUser',
  [
    // input validations
    check('fName', 'Please Enter a Valid First Name')
      .not()
      .isEmpty(),
    check('lName', 'Please Enter a Valid Last Name')
      .not()
      .isEmpty(),
    check('contractStartDate', 'Please Enter a Valid Contract Start Date')
      .not()
      .isEmpty(),
    check('gender', 'Please Enter a Valid Gender')
      .not()
      .isEmpty(),
    check('title', 'Please Enter a Valid Staff Title')
      .not()
      .isEmpty(),
    check('contractEndDate', 'Please Enter a Valid Contract End Date')
      .not()
      .isEmpty(),
    check('contractType', 'Please Enter a Valid Contract Type')
      .not()
      .isEmpty(),
    check('type', 'Please Specify the type of Staff')
      .not()
      .isEmpty(),
    check('level', 'Please Specify the Staff Level')
      .not()
      .isEmpty(),

    check('team', 'Please Specify the  Staff team')
      .not()
      .isEmpty(),

    check('program', 'Please Specify the staff Program')
      .not()
      .isEmpty(),
    check(
      'supervisorEmail',
      'Please supply a valid Supervisor Email'
    ).isEmail(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6
    })
  ],
  authController.registerUser
);

/**
 * @method - GET
 * @description - Get Users. authenticator is a middleware will be used to
 * verify the token, retrieve user based on the token payload.
 * calls controller after checking inputs
 * @param - /auth/getUsers
 */
router.get('/getUsers', authController.getUsers);

module.exports = router;
