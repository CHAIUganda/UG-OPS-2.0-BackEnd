const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Objective = require('../../model/Objective');

const editObjective = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  const { id, objectiveCode, status, name, description } = req.body;

  try {
    const objective = await Objective.findOne({
      _id: id,
    });
    if (!objective) {
      return res.status(400).json({
        message: 'This Objective does not exist in the system',
      });
    }

    // modify Objective
    await Objective.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          objectiveCode,
          status,
          name,
          description,
        },
      }
    );

    res.status(200).json({
      message: 'Objective modified successfully',
      _id: objective._id,
      objectiveCode,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying Objective',
    });
  }
};

module.exports = editObjective;
