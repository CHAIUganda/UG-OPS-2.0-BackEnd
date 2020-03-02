const debug = require('debug')('server');
const Program = require('../../model/Program');

const getPrograms = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const program = await Program.find({});
    res.json(program);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching Programs' });
  }
};

module.exports = getPrograms;
