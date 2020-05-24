// Filename : procurement.js
const express = require('express');
const { check } = require('express-validator/check');

const router = express.Router();
// Import procurement controller
const procurementController = require('../controller/procurement/procurementController');

/**
 * @method - POST
 * @description - Create a procurement request
 * @param - /createProcurement
 */
router.post(
  '/createProcurement',
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
  procurementController.createProcurement
);

module.exports = router;
