// Filename : hrApi.js
const express = require('express');
const { check } = require('express-validator/check');

const router = express.Router();
// Import hr controller
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
 * @method - POst
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
    check('operationsLeadId', 'Please Enter a Valid Operations Lead Id')
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
 * @param - /getPrograms
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

/**
 * @method - POST
 * @description - dismiss or snooze contract expiry notifications
 * @param - /handleContractNotifications
 */
router.post(
  '/handleContractNotifications',
  [
    // input validations
    check('contractId', 'Please Enter a contractId').not().isEmpty(),
  ],
  hrController.handleContractNotifications
);

/**
 * @method - POST
 * @description - dismiss or snooze work permit expiry notifications
 * @param - /handleWPNotifications
 */
router.post(
  '/handleWPNotifications',
  [
    // input validations
    check('workPermitId', 'Please Enter a workPermitId').not().isEmpty(),
  ],
  hrController.handleWPNotifications
);

/**
 * @method - POST
 * @description - addStaffNewContract
 * @param - /addStaffNewContract
 */
router.post(
  '/addStaffNewContract',
  [
    // input validations
    check('staffEmail', 'Please enter a valid email').isEmail(),
    check('contractStartDate', 'Please Enter a Valid Contract Start Date')
      .not()
      .isEmpty(),
    check('contractEndDate', 'Please Enter a Valid Contract End Date')
      .not()
      .isEmpty(),
    check('contractType', 'Please Enter a Valid Contract Type').not().isEmpty(),
  ],
  hrController.addStaffNewContract
);

/**
 * @method - POST
 * @description - addStaffNewWP
 * @param - /addStaffNewWP
 */
router.post(
  '/addStaffNewWP',
  [
    // input validations
    check('staffEmail', 'Please enter a valid email').isEmail(),
    check('workPermitStartDate', 'Please Enter a Valid WorkPermit Start Date')
      .not()
      .isEmpty(),
    check('workPermitEndDate', 'Please Enter a Valid WorkPermit End Date')
      .not()
      .isEmpty(),
  ],
  hrController.addStaffNewWP
);
module.exports = router;
