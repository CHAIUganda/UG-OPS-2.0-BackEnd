// Filename : procurement.js
const express = require('express');
const { check } = require('express-validator/check');

const router = express.Router();
// Import procurement controller
const financeController = require('../controller/finance/financeController');

/**
 * @method - POST
 * @description - Create a Grant
 * @param - /createGrant
 */
router.post(
  '/createGrant',
  [
    check('gId', 'Please Enter a Valid GID for the Grant').not().isEmpty(),
    check('status', 'Please Enter a status for the Grant').not().isEmpty(),
  ],
  financeController.createGrant
);

/**
 * @method - POST
 * @description - editGrant.
 * @param - /editGrant
 */
router.post(
  '/editGrant',
  [
    // input validations
    check('id', 'Please Enter a mongoose id (_id) for the Grant')
      .not()
      .isEmpty(),
  ],
  financeController.editGrant
);

/**
 * @method - GET
 * @description - getGrants.
 * @param - /getGrants
 */
router.get('/getGrants/:status', financeController.getGrants);

/**
 * @method - POST
 * @description - Create a Project
 * @param - /createProject
 */
router.post(
  '/createProject',
  [
    check('pId', 'Please Enter a Valid PID for the project').not().isEmpty(),
    check('status', 'Please Enter a status for the Project').not().isEmpty(),
  ],
  financeController.createProject
);

/**
 * @method - POST
 * @description - editProject.
 * @param - /editProject
 */
router.post(
  '/editProject',
  [
    // input validations
    check('id', 'Please Enter a mongoose id (_id) for the Project')
      .not()
      .isEmpty(),
  ],
  financeController.editProject
);

/**
 * @method - GET
 * @description - getProject.
 * @param - /getProjects
 */
router.get('/getProjects/:status', financeController.getProjects);

/**
 * @method - POST
 * @description - Create a Objective
 * @param - /createObjective
 */
router.post(
  '/createObjective',
  [
    check('objectiveCode', 'Please Enter a Valid Objective Code')
      .not()
      .isEmpty(),
    check('status', 'Please Enter a status for the Objective').not().isEmpty(),
  ],
  financeController.createObjective
);

/**
 * @method - POST
 * @description - editObjective.
 * @param - /editObjective
 */
router.post(
  '/editObjective',
  [
    // input validations
    check('id', 'Please Enter a mongoose id (_id) for the Objective')
      .not()
      .isEmpty(),
  ],
  financeController.editObjective
);

/**
 * @method - GET
 * @description - getObjectives.
 * @param - /getObjectives
 */
router.get('/getObjectives/:status', financeController.getObjectives);

module.exports = router;
