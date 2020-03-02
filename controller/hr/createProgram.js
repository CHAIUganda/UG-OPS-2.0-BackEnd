const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Program = require('../../model/Program');

const createProgram = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array())
    });
  }

  // prettier-ignore
  const {
    name,
    programManagerEmail
  } = req.body;

  try {
    const program = await Program.findOne({
      name
    });
    if (program) {
      return res.status(400).json({
        message: 'This Program already exists'
      });
    }

    const programtoSave = new Program({
      name,
      programManagerEmail
    });

    await programtoSave.save();
    res.status(201).json({
      programtoSave
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Program'
    });
  }
};

module.exports = createProgram;
