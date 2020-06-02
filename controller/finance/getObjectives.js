const debug = require('debug')('server');
const Objective = require('../../model/Objective');

const getObjectives = async (req, res) => {
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

    const objectives = await Objective.find(query);
    res.json(objectives);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Objectives' });
  }
};

module.exports = getObjectives;
