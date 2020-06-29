const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Grant = require('../../model/Grant');

const createGrant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    gId,
    status,
    name,
    description
  } = req.body;

  try {
    const grant = await Grant.findOne({
      gId,
    });
    if (grant) {
      return res.status(400).json({
        message: 'This Grant already exists in the system',
      });
    }

    const granttoSave = new Grant({
      gId,
      status,
      name,
      description,
    });

    await granttoSave.save();

    res.status(201).json({
      message: 'Grant Created Successfully.',
      _id: granttoSave._id,
      gId,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Grant',
    });
  }
};

module.exports = createGrant;
