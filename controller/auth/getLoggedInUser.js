const debug = require('debug')('server');
const Program = require('../../model/Program');
const User = require('../../model/User');
// Get LoggedIn User
const getLoggedInUser = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    // dont return pwd and id
    user.password = undefined;
    user._id = undefined;
    const supervisor = await User.findOne({ email: user.supervisorEmail });
    if (!supervisor) {
      return res.status(400).json({
        message: 'Supervisor does not Exist'
      });
    }
    let program;
    let programShortForm;
    const { programId } = user;

    const userProgram = await Program.findOne({
      _id: programId
    });

    if (!userProgram) {
      program = 'NA';
      programShortForm = 'NA';
      // eslint-disable-next-line no-else-return
    } else {
      program = userProgram.program;
      programShortForm = userProgram.shortForm;
    }
    const supervisorDetails = {
      _id: supervisor._id,
      fName: supervisor.fName,
      lName: supervisor.lName,
      email: supervisor.email
    };

    const {
      admin,
      bankDetails,
      leaves,
      createdAt,
      _id,
      fName,
      lName,
      supervisorEmail,
      gender,
      roles,
      title,
      oNames,
      email,
      type,
      level,
      team
    } = user;

    const person = {
      admin,
      leaves,
      createdAt,
      bankDetails,
      _id,
      fName,
      lName,
      supervisorEmail,
      roles,
      gender,
      title,
      programId,
      program,
      programShortForm,
      oNames,
      email,
      type,
      level,
      team,
      supervisorDetails
    };

    res.json(person);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching user' });
  }
};
module.exports = getLoggedInUser;
