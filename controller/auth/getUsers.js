const debug = require('debug')('server');
const User = require('../../model/User');

const getUsers = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.find({});
    res.json(user);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching users' });
  }
};

module.exports = getUsers;
