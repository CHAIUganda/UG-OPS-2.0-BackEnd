const debug = require('debug')('server');
const Grant = require('../../model/Grant');

const getGrants = async (req, res) => {
  try {
    const { status } = req.params;

    let query; // more queries to be added for grants
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

    const grants = await Grant.find(query);
    res.json(grants);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Grants' });
  }
};

module.exports = getGrants;
