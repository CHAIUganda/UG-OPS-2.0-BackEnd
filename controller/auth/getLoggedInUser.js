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

    if (!user) {
      return res.status(503).json({
        message: 'User doesnot exist on Ug ops',
      });
    }

    // dont return pwd and id
    let program;
    let programShortForm;
    const { programId } = user;
    if (user.active === false) {
      return res.status(400).json({
        message: 'This account is not active any more.',
      });
    }

    const userProgram = await Program.findOne({
      _id: programId,
    });
    let operationsLead = false;
    let programManager = false;

    if (!userProgram) {
      program = null;
      programShortForm = null;
      // eslint-disable-next-line no-else-return
    } else {
      program = userProgram.name;
      programShortForm = userProgram.shortForm;
      if (user._id.equals(userProgram.programManagerId)) {
        programManager = true;
      }
      if (user._id.equals(userProgram.operationsLeadId)) {
        operationsLead = true;
      }
    }

    const {
      _id,
      fName,
      lName,
      gender,
      title,
      birthDate,
      oNames,
      type,
      level,
      team,
      annualLeaveBF,
      bankAccounts,
      nssfNumber,
      tinNumber,
      leaves,
      createdAt,
      supervisorEmail,
      active,
      email,
    } = user;

    const {
      admin,
      ordinary,
      hr,
      supervisor,
      countryDirector,
      deputyCountryDirector,
      procurementAdmin,
      financeAdmin,
    } = user.roles;

    const roles = {
      admin,
      ordinary,
      hr,
      supervisor,
      countryDirector,
      deputyCountryDirector,
      procurementAdmin,
      financeAdmin,
      programManager,
      operationsLead,
    };

    const unReadNotifications = user.notifications;

    const notifications = unReadNotifications.filter(
      (notification) => notification.status === 'unRead'
    );

    const userSupervisor = await User.findOne({
      email: supervisorEmail,
    });
    let supervisorDetails;
    if (!userSupervisor) {
      supervisorDetails = {
        Supervisor_id: null,
        fName: null,
        lName: null,
        email: null,
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
        workPermitId = null;
        workPermitStartDate = null;
        workPermitEndDate = null;
        workPermitStatus = null;
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
      contractStartDate = null;
      contractEndDate = null;
      contractType = null;
      contractStatus = null;
      contractId = null;
    } else {
      contractStartDate = contract.contractStartDate;
      contractEndDate = contract.contractEndDate;
      contractType = contract.contractType;
      contractStatus = contract.contractStatus;
      contractId = contract._id;
    }

    const person = {
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
      active,
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
      notifications,
    };

    res.json(person);
  } catch (e) {
    debug(e.message);
    res.status(500).json({ message: 'Error in Fetching user' });
  }
};
module.exports = getLoggedInUser;
