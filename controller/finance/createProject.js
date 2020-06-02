const { validationResult } = require('express-validator/check');
const debug = require('debug')('leave-controller');
const errorToString = require('../../helpers/errorToString');
const Project = require('../../model/Project');

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  // prettier-ignore
  const {
    pId,
    status,
    name,
    description
  } = req.body;

  try {
    const project = await Project.findOne({
      pId,
    });
    if (project) {
      return res.status(400).json({
        message: 'This Project already exists in the system',
      });
    }

    const projecttoSave = new Project({
      pId,
      status,
      name,
      description,
    });

    await projecttoSave.save();

    res.status(201).json({
      message: 'Project Created Successfully.',
      _id: projecttoSave._id,
      pId,
      status,
      name,
      description,
    });
  } catch (err) {
    debug(err.message);
    res.status(500).json({
      message: 'Error Creating Project',
    });
  }
};

module.exports = createProject;
