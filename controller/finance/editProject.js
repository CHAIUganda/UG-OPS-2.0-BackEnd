const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Project = require('../../model/Project');

const editProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  // eslint-disable-next-line object-curly-newline
  const { id, pId, status, name, description } = req.body;

  try {
    const project = await Project.findOne({
      _id: id,
    });
    if (!project) {
      return res.status(400).json({
        message: 'This Project does not exist in the system',
      });
    }

    // modify Project
    await Project.updateOne(
      {
        _id: id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          pId,
          status,
          name,
          description,
        },
      }
    );

    res.status(200).json({
      message: 'Project modified successfully',
      _id: project._id,
      pId,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error modifying Project',
    });
  }
};

module.exports = editProject;
