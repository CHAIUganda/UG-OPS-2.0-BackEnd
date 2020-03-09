const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');

const getSupervisorLeaves = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication

    const staffEmail = req.params.email;
    const { status } = req.params;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'Supervisor does not exist'
      });
    }
    let query; // more queries to be added for leaves

    if (status === 'all') {
      query = { supervisorEmail: staffEmail };
    } else {
      query = { supervisorEmail: staffEmail, status };
    }
    const leaves = await Leave.find(query);

    let combinedArray = [];
    if (user.roles.countryDirector) {
      const progress = 'countryDirector';
      const queryCd = { status, progress };
      const leavesCd = await Leave.find(queryCd);
      combinedArray = [...leaves, ...leavesCd];
      res.status(200).json(combinedArray);
    } else {
      res.status(200).json(leaves);
    }
  } catch (e) {
    console.log(e.message);
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching leaves' });
  }
};

module.exports = getSupervisorLeaves;
