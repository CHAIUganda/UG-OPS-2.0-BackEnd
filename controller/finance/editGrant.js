const { validationResult } = require('express-validator');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Grant = require('../../model/Grant');

const editGrant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  const { id } = req.body;

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  let { gId, status, name, description } = req.body;

  try {
    const grant = await Grant.findOne({
      _id: id,
    });
    if (!grant) {
      return res.status(400).json({
        message: 'This Grant does not exist in the system',
      });
    }
    if (gId == null) {
      gId = grant.gId;
    }
    if (status == null) {
      status = grant.status;
    }
    if (name == null) {
      name = grant.name;
    }
    if (description == null) {
      description = grant.description;
    }

    // modify Grant
    await Grant.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          gId,
          status,
          name,
          description,
        },
      }
    );

    res.status(200).json({
      message: 'Grant modified successfully',
      _id: grant._id,
      gId,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying Grant',
    });
  }
};

module.exports = editGrant;
