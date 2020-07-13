const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Account = require('../../model/Account');

const createAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    accountCode,
    financialGrouping,
    description,
    useDecsription,
    status,
  } = req.body;

  let { costedWorkPlans, quickBooks, usedInCountry } = req.body;

  try {
    const account = await Account.findOne({
      accountCode,
    });
    if (account) {
      return res.status(400).json({
        message: 'This Account already exists in the system',
      });
    }
    if (!costedWorkPlans === false) {
      costedWorkPlans = true;
    }
    if (!quickBooks === false) {
      quickBooks = true;
    }
    if (!usedInCountry === false) {
      usedInCountry = true;
    }

    const accounttoSave = new Account({
      accountCode,
      financialGrouping,
      description,
      useDecsription,
      includeOn: { costedWorkPlans, quickBooks },
      usedInCountry,
      status,
    });

    await accounttoSave.save();

    res.status(201).json({
      message: 'Account Created Successfully.',
      _id: accounttoSave._id,
      accountCode,
      financialGrouping,
      description,
      useDecsription,
      includeOn: { costedWorkPlans, quickBooks },
      usedInCountry,
      status,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Account',
    });
  }
};

module.exports = createAccount;
