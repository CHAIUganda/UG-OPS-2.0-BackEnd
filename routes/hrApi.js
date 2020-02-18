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
      .isEmpty()
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
      .isEmpty()
  ],
  hrController.removePublicHoliday
);

/**
 * @method - GET
 * @description - Get public holidays.
 * @param - /auth/getUsers
 */
router.get('/getPublicHolidays', hrController.getPublicHolidays);
module.exports = router;
