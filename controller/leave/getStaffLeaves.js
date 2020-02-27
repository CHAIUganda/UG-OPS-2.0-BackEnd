const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');

const getStaffLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication

    const staffEmail = req.params.email;
    const { status } = req.params;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist'
      });
    }
    let query; // more queries to be added for leaves
    if (status) {
      if (status === 'all') {
        query = { _id: { $in: user.leaves } };
      } else {
        query = { _id: { $in: user.leaves }, status };
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

module.exports = getStaffLeaves;
