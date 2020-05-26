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
    check('pId', 'Please Enter a Project where the request belongs')
      .not()
      .isEmpty(),
    check('gId', 'Please Enter a Grant where the request belongs')
      .not()
      .isEmpty(),
    check('objectCode', 'Please Enter the ObjectCode').not().isEmpty(),
    check('staffId', 'Please Enter the staff requesting').not().isEmpty(),
    check('category', 'Please Enter the catedory of the request')
      .not()
      .isEmpty(),
    check('priceRange', 'Please Enter the proce range').not().isEmpty(),
    check('specifications', 'Please Enter the specifications of the request')
      .not()
      .isEmpty(),
  ],
  procurementController.createProcurement
);

module.exports = router;
