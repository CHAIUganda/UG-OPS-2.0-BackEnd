// Filename : leave.js
const express = require("express");
const { check} = require("express-validator/check");
const router = express.Router();
// Import leave controller
var leaveController = require('../controller/leaveController');
const authenticator = require("../middleware/authenticator");

  /**
 * @method - POST
 * @description - Request for a leave. authenticator is a middleware will be used to 
 * verify the token.
 * @param - /leaveApi/leave
 */
router.post("/leave",
[  // valid date 2018-05-12
    //check("startDate", "Please Enter a Valid Date").matches(),

    //input validations date validation pending
    check("startDate", "Please Enter a Valid StartDate").not().isEmpty(),
    check("endDate", "Please Enter a Valid EndDate").not().isEmpty(),
    check("type", "Please Enter a Valid Leave Type").not().isEmpty(),
    check("staffEmail", "Please Enter a Valid Email").isEmail(),
    check("status", "Please enter a valid status").not().isEmpty(),
    check("progress", "Please enter a valid progress").not().isEmpty(),
], authenticator, leaveController.createLeave);

  module.exports = router;