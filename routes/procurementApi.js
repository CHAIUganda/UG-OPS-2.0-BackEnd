// Filename : procurement.js
const express = require('express');
const { check } = require('express-validator');

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
    check('objectiveId', 'Please Enter the objectiveCode').not().isEmpty(),
    check('staffId', 'Please Enter the staff requesting').not().isEmpty(),
    check('category', 'Please Enter the category of the request')
      .not()
      .isEmpty(),
    check('priceRange', 'Please Enter the price range').not().isEmpty(),
    check('specifications', 'Please Enter the specifications of the request')
      .not()
      .isEmpty(),
  ],
  procurementController.createProcurement
);

/**
 * @method - POST
 * @description - uploading supporting files on a procurement request
 * @param - /additionSupportnDocsOnRequest
 */

// addnDocs should be the name of the input tag sending files
router.post(
  '/additionSupportnDocsOnRequest',
  [
    // input validations date validation pending
    check(
      'procurementId',
      'Please Enter a ProcurementId where the attached files belong'
    )
      .not()
      .isEmpty(),
    check(
      'category',
      'Please Enter the category where the attached files belong'
    )
      .not()
      .isEmpty(),
    check('itemId', 'Please Enter the ItemId where the attached files belong')
      .not()
      .isEmpty(),
  ],
  procurementController.additionSupportnDocsOnRequest
);

/**
 * @method - POST
 * @description - Create a procurement response
 * @param - /procurementResponse
 */
router.post(
  '/procurementResponse',
  [
    // input validations date validation pending
    check('procurementId', 'Please enter the procurement Id').not().isEmpty(),
    check('response', 'Please enter a Response').not().isEmpty(),
  ],
  procurementController.procurementResponse
);

/**
 * @method - GET
 * @description - Get staff Procurements.
 * @param - /getStaffProcurements
 */
router.get(
  '/getStaffProcurements/:staffId/:status',
  procurementController.getStaffProcurements
);

module.exports = router;
