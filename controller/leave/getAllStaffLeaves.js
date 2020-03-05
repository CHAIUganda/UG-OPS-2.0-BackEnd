const debug = require('debug')('server');
const Program = require('../../model/Program');
const Leave = require('../../model/Leave');

const getAllStaffLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication

    const { program } = req.params;
    const { status } = req.params;
    if (!program === 'all') {
      const programs = await Program.findOne({ name: program });
      if (!programs) {
        return res.status(400).json({
          message: 'User Program does not exist'
        });
      }
    }

    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all' && program === 'all') {
        query = {};
      } else {
        query = { program, status };
      }
    }

    const leaves = await Leave.find(query);
    res.status(200).json(leaves);
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getAllStaffLeaves;
