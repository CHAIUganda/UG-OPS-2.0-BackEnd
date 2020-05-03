const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Program = require('../../model/Program');

const deleteProgram = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    id,
  } = req.body;

  try {
    const program = await Program.findOne({
      _id: id
    });
    if (!program) {
      return res.status(400).json({
        message: 'This program doesnot exist'
      });
    }
    program.remove();

    res.status(200).json({
      message: 'program Deleted successfully'
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error removing program'
    });
  }
};

module.exports = deleteProgram;
