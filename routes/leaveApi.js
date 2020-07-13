// Filename : leaveApi.js
const express = require('express');
const { check } = require('express-validator');

const router = express.Router();
// Import leave controller
const leaveController = require('../controller/leave/leaveController');

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
    check('startDate', 'Please Enter a Valid StartDate').not().isEmpty(),
    check('endDate', 'Please Enter a Valid EndDate').not().isEmpty(),
    check('type', 'Please Enter a Valid Leave Type').not().isEmpty(),
    check('staffEmail', 'Please Enter a Valid Email').isEmail(),
    check('status', 'Please enter a valid status').not().isEmpty(),
  ],
  leaveController.createLeave
);

/**
 * @method - GET
 * @description - Get staff Leaves. authenticator is a middleware will be used to
 * verify the token
 * @param - /getLeaves
 */
router.get('/getStaffLeaves/:email/:status', leaveController.getStaffLeaves);

/**
 * @method - GET
 * @description - Get supervisor Leaves. authenticator is a middleware will be used to
 * verify the token
 * @param - /getLeaves
 */
router.get(
  '/getSupervisorLeaves/:email/:status',
  leaveController.getSupervisorLeaves
);

/**
 * @method - POST
 * @description - Supervisor Handle a leave. Involves aprroving or rejecting
 * a leave by supervisor or CD authenticator is a middleware will be used to
 * verify the token.
 * @param - /leaveApi/supervisorHandleLeave
 */
router.post(
  '/supervisorHandleLeave',
  [
    check('leaveId', 'Please Enter a Valid Leave Id').not().isEmpty(),
    check('status', 'Please Enter a Valid Status').not().isEmpty(),
    check('staffEmail', 'Please Enter a Valid Staff Email').isEmail(),
  ],
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
  leaveController.getAllStaffLeaves
);

/**
 * @method - GET
 * @description - Get Staff Leaves Taken. authenticator is a middleware will be used to
 * verify the token
 * @param - /getStaffLeavesTaken
 */
router.get('/getStaffLeavesTaken/:email', leaveController.getStaffLeavesTaken);

/**
 * @method - GET
 * @description - Get All Staff Leaves Taken. authenticator is a middleware will be used to
 * verify the token
 * @param - /getStaffLeavesTaken
 */
router.get('/getAllStaffLeavesTaken', leaveController.getAllStaffLeavesTaken);

/**
 * @method - POST
 * @description - Staff Modify leave. Involves modifying
 * a leave by staff authenticator is a middleware will be used to
 * verify the token.
 * @param - /leaveApi/staffModifyLeave
 */
router.post(
  '/staffModifyLeave',
  [
    check('startDate', 'Please Enter a Valid StartDate').not().isEmpty(),
    check('endDate', 'Please Enter a Valid EndDate').not().isEmpty(),
    check('leaveId', 'Please Enter a Valid Leave Id').not().isEmpty(),
    check('action', 'Please Enter an action').not().isEmpty(),
    check('staffEmail', 'Please Enter a Valid Staff Email').isEmail(),
  ],
  leaveController.staffModifyLeave
);

/**
 * @method - POST
 * @description - Handle planned leave. Involves applying or cancelling planned leave
 * a leave by staff authenticator is a middleware will be used to
 * verify the token.
 * @param - /leaveApi/handlelannedLeave
 */
router.post(
  '/handlePlannedLeave',
  [
    check('leaveId', 'Please Enter a Valid Leave Id').not().isEmpty(),
    check('action', 'Please Enter an action').not().isEmpty(),
    check('staffEmail', 'Please Enter a Valid Staff Email').isEmail(),
  ],
  leaveController.handlePlannedLeave
);

/**
 * @method - POST
 * @description - Remove a public holiday.
 * @param - /removePublicHoliday
 */
router.post(
  '/removeLeave',
  [
    // valid date 25/12

    // input validations date validation pending
    check('id', 'Please Enter a Valid id for the public holiday')
      .not()
      .isEmpty(),
  ],
  leaveController.removeLeave
);

module.exports = router;
