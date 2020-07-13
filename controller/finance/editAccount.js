const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Account = require('../../model/Account');

const editAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // eslint-disable-next-line object-curly-newline
  const { id } = req.body;

  let {
    costedWorkPlans,
    quickBooks,
    usedInCountry,
    accountCode,
    financialGrouping,
    description,
    useDecsription,
    status,
  } = req.body;

  try {
    const account = await Account.findOne({
      _id: id,
    });
    if (!account) {
      return res.status(400).json({
        message: 'This Account does not exist in the system',
      });
    }
    // set old values if a value aint sent
    if (costedWorkPlans == null) {
      costedWorkPlans = account.costedWorkPlans;
    }
    if (quickBooks == null) {
      quickBooks = account.quickBooks;
    }
    if (usedInCountry == null) {
      usedInCountry = account.usedInCountry;
    }
    if (accountCode == null) {
      accountCode = account.accountCode;
    }
    if (financialGrouping == null) {
      financialGrouping = account.financialGrouping;
    }
    if (description == null) {
      description = account.description;
    }
    if (useDecsription == null) {
      useDecsription = account.useDecsription;
    }
    if (status == null) {
      status = account.status;
    }
    // modify Account
    await Account.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          accountCode,
          financialGrouping,
          description,
          useDecsription,
          includeOn: { costedWorkPlans, quickBooks },
          usedInCountry,
          status,
        },
      }
    );

    res.status(200).json({
      message: 'Account modified successfully',
      _id: account._id,
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
      message: 'Error modifying Account',
    });
  }
};

module.exports = editAccount;
