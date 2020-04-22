const debug = require('debug')('server');
const Program = require('../../model/Program');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const WorkPermit = require('../../model/WorkPermit');
// Get LoggedIn User
const getLoggedInUser = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    // dont return pwd and id
    user.password = undefined;
    let program;
    let programShortForm;
    const { programId } = user;

    const userProgram = await Program.findOne({
      _id: programId,
    });

    if (!userProgram) {
      program = 'NA';
      programShortForm = 'NA';
      // eslint-disable-next-line no-else-return
    } else {
      program = userProgram.name;
      programShortForm = userProgram.shortForm;
    }

    const {
      _id,
      fName,
      lName,
      gender,
      roles,
      title,
      birthDate,
      oNames,
      email,
      type,
      level,
      team,
      annualLeaveBF,
      bankAccounts,
      nssfNumber,
      tinNumber,
      admin,
      leaves,
      createdAt,
      supervisorEmail,
    } = user;

    const userSupervisor = await User.findOne({
      email: supervisorEmail,
    });
    let supervisorDetails;
    if (!userSupervisor) {
      supervisorDetails = {
        Supervisor_id: 'NA',
        fName: 'NA',
        lName: 'NA',
        email: 'NA',
      };
    } else {
      supervisorDetails = {
        _id: userSupervisor._id,
        fName: userSupervisor.fName,
        lName: userSupervisor.lName,
        email: userSupervisor.email,
      };
    }
    let workPermitStartDate;
    let workPermitId;
    let workPermitEndDate;
    let workPermitStatus;

    if (type === 'expat' || type === 'tcn') {
      const workPermit = await WorkPermit.findOne({
        _userId: _id,
        workPermitStatus: 'ACTIVE',
      });

      if (!workPermit) {
        workPermitId = 'NA';
        workPermitStartDate = 'NA';
        workPermitEndDate = 'NA';
        workPermitStatus = 'NA';
      } else {
        workPermitId = workPermit._id;
        workPermitStartDate = workPermit.workPermitStartDate;
        workPermitEndDate = workPermit.workPermitEndDate;
        workPermitStatus = workPermit.workPermitStatus;
      }
    }

    const contract = await Contract.findOne({
      _userId: _id,
      contractStatus: 'ACTIVE',
    });

    let contractStartDate;
    let contractEndDate;
    let contractType;
    let contractStatus;
    let contractId;
    if (!contract) {
      contractStartDate = 'NA';
      contractEndDate = 'NA';
      contractType = 'NA';
      contractStatus = 'NA';
      contractId = 'NA';
    } else {
      contractStartDate = contract.contractStartDate;
      contractEndDate = contract.contractEndDate;
      contractType = contract.contractType;
      contractStatus = contract.contractStatus;
      contractId = contract._id;
    }

    const person = {
      admin,
      leaves,
      createdAt,
      bankAccounts,
      _id,
      fName,
      birthDate,
      lName,
      supervisorEmail,
      annualLeaveBF,
      nssfNumber,
      tinNumber,
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
      supervisorDetails,
      contractId,
      contractStartDate,
      contractEndDate,
      contractType,
      contractStatus,
      workPermitId,
      workPermitStartDate,
      workPermitEndDate,
      workPermitStatus,
    };

    res.json(person);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching user' });
  }
};
module.exports = getLoggedInUser;
