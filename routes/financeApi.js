// Filename : procurement.js
const express = require('express');
const { check } = require('express-validator');

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
    check('programId', 'Please Specify the Program Id').not().isEmpty(),
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
router.get('/getGrants/:programId/:status', financeController.getGrants);

/**
 * @method - POST
 * @description - Create a Project
 * @param - /createProject
 */
router.post(
  '/createProject',
  [
    check('pId', 'Please Enter a Valid PID for the project').not().isEmpty(),
    check('programId', 'Please Specify the Program Id').not().isEmpty(),
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
router.get('/getProjects/:programId/:status', financeController.getProjects);

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
    check('programId', 'Please Specify the Program Id').not().isEmpty(),
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
router.get(
  '/getObjectives/:programId/:status',
  financeController.getObjectives
);

/**
 * @method - POST
 * @description - Create a Account
 * @param - /createAccount
 */
router.post(
  '/createAccount',
  [
    check('accountCode', 'Please Enter a Valid AccountCode').not().isEmpty(),
    check('financialGrouping', 'Please Enter a financial group')
      .not()
      .isEmpty(),
    check('description', 'Please Enter a Description').not().isEmpty(),
    check('useDecsription', 'Please Enter the account use description')
      .not()
      .isEmpty(),
    check(
      'costedWorkPlans',
      'Please a state if the AccountCode is tobe included on CWPs'
    )
      .not()
      .isEmpty(),
    check(
      'quickBooks',
      'Please a state if the AccountCode is tobe included in Quickbooks'
    )
      .not()
      .isEmpty(),
    check(
      'usedInCountry',
      'Please a state if the AccountCode is tobe used IN COUNTRY'
    )
      .not()
      .isEmpty(),
  ],
  financeController.createAccount
);

/**
 * @method - POST
 * @description - editAccount.
 * @param - /editAccount
 */
router.post(
  '/editAccount',
  [
    // input validations
    check('id', 'Please Enter a mongoose id (_id) for the Account')
      .not()
      .isEmpty(),
  ],
  financeController.editAccount
);

/**
 * @method - GET
 * @description - getAccounts.
 * @param - /getAccounts
 */
router.get('/getAccounts/:status', financeController.getAccounts);

module.exports = router;
