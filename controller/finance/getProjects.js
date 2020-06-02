const debug = require('debug')('server');
const Project = require('../../model/Project');

const getProjects = async (req, res) => {
  try {
    const { status } = req.params;

    let query; // more queries to be added for projects
    if (status) {
      if (status === 'all') {
        query = {};
      } else if (
        // eslint-disable-next-line operator-linebreak
        status === 'Active' ||
        // eslint-disable-next-line operator-linebreak
        status === 'Archived'
      ) {
        query = { status };
      } else {
        return res.status(400).json({
          message: 'Invalid Status',
        });
      }
    }

    const projects = await Project.find(query);
    res.json(projects);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Projects' });
  }
};

module.exports = getProjects;
