const debug = require('debug')('server');
const User = require('../../model/User');
// Get LoggedIn User
const getLoggedInUser = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    user.password = undefined;
    user._id = undefined;

    res.json(user);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching user' });
  }
};
module.exports = getLoggedInUser;
