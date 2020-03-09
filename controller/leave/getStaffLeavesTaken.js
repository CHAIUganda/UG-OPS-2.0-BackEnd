const debug = require('debug')('leave-controller');
const User = require('../../model/User');
const getLeavesTaken = require('./getLeavesTaken');

const getStaffLeavesTaken = async (req, res) => {
  try {
    const staffEmail = req.params.email;
    const user = await User.findOne({ email: staffEmail });
    if (!user) {
      return res.status(400).json({
        message: 'User does not exist'
      });
    }
    const { annualLeaveBF } = user;
    const leaveDetailss = await getLeavesTaken(user);

    const {
      unPaidLeaveTaken,
      homeLeaveTaken,
      annualLeaveTaken,
      maternityLeaveTaken,
      paternityLeaveTaken,
      sickLeaveTaken,
      studyLeaveTaken
    } = leaveDetailss;

    const leaveDetails = {
      annualLeaveBF,
      unPaidLeaveTaken,
      homeLeaveTaken,
      annualLeaveTaken,
      maternityLeaveTaken,
      paternityLeaveTaken,
      sickLeaveTaken,
      studyLeaveTaken
    };

    res.status(200).json({ leaveDetails });
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({
      message: 'Error geting  Leaves taken'
    });
  }
};

module.exports = getStaffLeavesTaken;
