const debug = require('debug')('server');
const User = require('../../model/User');
const Leave = require('../../model/Leave');

const getLeavesTaken = async (staffEmail, req, res) => {
  const user = await User.findOne({ email: staffEmail });
  if (!user) {
    return res.status(400).json({
      message: 'User does not exist'
    });
  }
  const status = 'taken';
  const query = { _id: { $in: user.leaves }, status };

  const leaves = await Leave.find(query);

  const leaveDetails = {
    annualLeaveBF:,
    unPaidLeaveTaken:,
    homeLeaveTaken:,
    annualLeaveTaken:,
    maternityLeaveTaken:,
    paternityLeaveTaken:,
    sickLeaveTaken:,
    studyLeaveTaken:
  };

  return leaveDetails;
};

module.exports = getLeavesTaken;
