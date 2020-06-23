const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Objective = require('../../model/Objective');

const createObjective = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    objectiveCode,
    status,
    name,
    description
  } = req.body;

  try {
    const objective = await Objective.findOne({
      objectiveCode,
    });
    if (objective) {
      return res.status(400).json({
        message: 'This Objective already exists in the system',
      });
    }

    const objectivetoSave = new Objective({
      objectiveCode,
      status,
      name,
      description,
    });

    await objectivetoSave.save();

    res.status(201).json({
      message: 'Objective Created Successfully.',
      _id: objectivetoSave._id,
      objectiveCode,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Objective',
    });
  }
};

module.exports = createObjective;
