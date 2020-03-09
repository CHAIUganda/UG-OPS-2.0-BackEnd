// Filename : leave.js
const express = require('express');
const { check } = require('express-validator/check');

const router = express.Router();
// Import leave controller
const leaveController = require('../controller/leave/leaveController');
const authenticator = require('../middleware/authenticator');

/**
 * @method - POST
 * @description - Request for a leave. authenticator is a middleware will be used to
 * verify the token.
 * @param - /leaveApi/leave
 */
router.post(
  '/leave',
  [
    // valid date 2018-05-12
    // check("startDate", "Please Enter a Valid Date").matches(),

    // input validations date validation pending
    check('startDate', 'Please Enter a Valid StartDate')
      .not()
      .isEmpty(),
    check('endDate', 'Please Enter a Valid EndDate')
      .not()
      .isEmpty(),
    check('type', 'Please Enter a Valid Leave Type')
      .not()
      .isEmpty(),
    check('staffEmail', 'Please Enter a Valid Email').isEmail(),
    check('supervisorEmail', 'Please Enter a Valid Email').isEmail(),
    check('status', 'Please enter a valid status')
      .not()
      .isEmpty(),
    check('daysTaken', 'Please enter the total number of days')
      .not()
      .isEmpty(),
    check('publicHolidays', 'Please enter the public holidays if any or "none"')
      .not()
      .isEmpty(),
    check('comment', 'Please enter comments if any or "none"')
      .not()
      .isEmpty()
  ],
  authenticator,
  leaveController.createLeave
);

/**
 * @method - GET
 * @description - Get staff Leaves. authenticator is a middleware will be used to
 * verify the token
 * @param - /getLeaves
 */
router.get(
  '/getStaffLeaves/:email/:status',
  authenticator,
  leaveController.getStaffLeaves
);

/**
 * @method - GET
 * @description - Get supervisor Leaves. authenticator is a middleware will be used to
 * verify the token
 * @param - /getLeaves
 */
router.get(
  '/getSupervisorLeaves/:email/:status',
  authenticator,
  leaveController.getSupervisorLeaves
);

/**
 * @method - POST
 * @description - Handle a leave. Involves aprroving or rejecting
 * a leave by supervisor or CD authenticator is a middleware will be used to
 * verify the token.
 * @param - /leaveApi/handleLeave
 */
router.post(
  '/supervisorHandleLeave',
  [
    check('leaveId', 'Please Enter a Valid Leave Id')
      .not()
      .isEmpty(),
    check('status', 'Please Enter a Valid Status')
      .not()
      .isEmpty(),
    check('staffEmail', 'Please Enter a Valid Staff Email').isEmail()
  ],
  authenticator,
  leaveController.supervisorHandleLeave
);

/**
 * @method - GET
 * @description - Get All staff Leaves. authenticator is a middleware will be used to
 * verify the token
 * @param - /getAllStaffLeaves
 */
router.get(
  '/getAllStaffLeaves/:program/:status',
  authenticator,
  leaveController.getAllStaffLeaves
);

module.exports = router;
