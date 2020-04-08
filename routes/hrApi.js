// Filename : leave.js
const express = require('express');
const { check } = require('express-validator/check');

const router = express.Router();
// Import leave controller
const hrController = require('../controller/hr/hrController');

/**
 * @method - POST
 * @description - Create a public holiday
 * @param - /createPublicHoliday
 */
router.post(
  '/createPublicHoliday',
  [
    // valid date 25/12

    // input validations date validation pending
    check('name', 'Please Enter a Valid name for the public holiday')
      .not()
      .isEmpty(),
    check('date', 'Please Enter a Valid date for the public holiday')
      .not()
      .isEmpty(),
  ],
  hrController.createPublicHoliday
);

/**
 * @method - POST
 * @description - Remove a public holiday.
 * @param - /removePublicHoliday
 */
router.post(
  '/removePublicHoliday',
  [
    // valid date 25/12

    // input validations date validation pending
    check('id', 'Please Enter a Valid id for the public holiday')
      .not()
      .isEmpty(),
  ],
  hrController.removePublicHoliday
);

/**
 * @method - GET
 * @description - Get public holidays.
 * @param - /getPublicHolidays
 */
router.get('/getPublicHolidays', hrController.getPublicHolidays);

/**
 * @method - POST
 * @description - Create a Program
 * @param - /createProgram
 */
router.post(
  '/createProgram',
  [
    // input validations date validation pending
    check('name', 'Please Enter a Valid name for the Program').not().isEmpty(),
    check('shortForm', 'Please Enter a Short Form for the program')
      .not()
      .isEmpty(),
    check('programManagerId', 'Please Enter a Valid Program manager Id')
      .not()
      .isEmpty(),
  ],
  hrController.createProgram
);

/**
 * @method - POST
 * @description - Remove a program.
 * @param - /removeProgram
 */
router.post(
  '/editProgram',
  [
    // input validations
    check('id', 'Please Enter an id for the program').not().isEmpty(),
    check('shortForm', 'Please Enter a Short Form for the program')
      .not()
      .isEmpty(),
    check('name', 'Please name for the program').not().isEmpty(),
  ],
  hrController.editProgram
);

/**
 * @method - GET
 * @description - Get Programs.
 * @param - /agetPrograms
 */
router.get('/getPrograms', hrController.getPrograms);

/**
 * @method - GET
 * @description - Get all staff contracts about toexpiry basing on days supplied.
 * verify the token
 * @param - /getUsersContracts
 */
router.get('/getUsersContracts/:expiryIn', hrController.getUsersContracts);

/**
 * @method - GET
 * @description - Get all staff worpermits about toexpiry basing on days supplied.
 * verify the token
 * @param - /getUsersWorkPermits
 */
router.get('/getUsersWorkPermits/:expiryIn', hrController.getUsersWorkPermits);

/**
 * @method - POST
 * @description - Remove a program.
 * @param - /removeProgram
 */
router.post(
  '/deleteProgram',
  [
    // input validations
    check('id', 'Please Enter an id for the program').not().isEmpty(),
  ],
  hrController.deleteProgram
);

module.exports = router;
