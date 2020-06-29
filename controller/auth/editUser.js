const { validationResult } = require('express-validator/check');
const debug = require('debug')('server');
const mongoose = require('mongoose');
const User = require('../../model/User');
const Contract = require('../../model/Contract');
const Program = require('../../model/Program');
const WorkPermit = require('../../model/WorkPermit');
const errorToString = require('../../helpers/errorToString');

const editUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }
  // eslint-disable-next-line object-curly-newline
  const { email, workPermitId } = req.body;
  let {
    fName,
    lName,
    bankAccounts,
    contractStartDate,
    contractEndDate,
    contractType,
    contractStatus,
    birthDate,
    gender,
    title,
    programId,
    type,
    level,
    team,
    supervisorEmail,
    oNames,
    hr,
    supervisor,
    admin,
    countryDirector,
    deputyCountryDirector,
    procurementAdmin,
    financeAdmin,
    workPermitStartDate,
    workPermitEndDate,
    workPermitStatus,
    active,
  } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: 'User Doesnot Exist',
      });
    }
    const contract = await Contract.findOne({
      _userId: user._id,
      contractStatus: 'ACTIVE',
    });

    if (!contract) {
      return res.status(400).json({
        message: 'User Does not have an active contract',
      });
    }
    // check for what has not been modified
    if (admin == null) {
      admin = user.roles.admin;
    }
    if (active == null) {
      if (user.active == null) {
        active = true;
      } else {
        active = user.active;
      }
    }

    if (deputyCountryDirector === true) {
      const deputyCountryDirectorrole = await User.findOne({
        'roles.deputyCountryDirector': true,
      });
      // chk if that hr already exists and it is not the same user
      if (
        // eslint-disable-next-line operator-linebreak
        deputyCountryDirectorrole &&
        !deputyCountryDirectorrole._id.equals(user._id)
      ) {
        return res.status(400).json({
          message: `${deputyCountryDirectorrole.fName} ${deputyCountryDirectorrole.lName} Already has the Deputy Country Director  role on the system. First edit that user removing the role. `,
        });
      }
    } else if (deputyCountryDirector === false) {
      deputyCountryDirector = false;
    } else {
      deputyCountryDirector = user.roles.deputyCountryDirector;
    }

    if (procurementAdmin === true) {
      const procurementAdminrole = await User.findOne({
        'roles.procurementAdmin': true,
      });
      // chk if that hr already exists and it is not the same user
      if (procurementAdminrole && !procurementAdminrole._id.equals(user._id)) {
        return res.status(400).json({
          message: `${procurementAdminrole.fName} ${procurementAdminrole.lName} Already has the Procurement Admin role on the system. First edit that user removing the role. `,
        });
      }
    } else if (procurementAdmin === false) {
      procurementAdmin = false;
    } else {
      procurementAdmin = user.roles.procurementAdmin;
    }

    if (financeAdmin === true) {
      const financeAdminrole = await User.findOne({
        'roles.financeAdmin': true,
      });
      // chk if that hr already exists and it is not the same user
      if (financeAdminrole && !financeAdminrole._id.equals(user._id)) {
        return res.status(400).json({
          message: `${financeAdminrole.fName} ${financeAdminrole.lName} Already has the Finance Admin role on the system. First edit that user removing the role. `,
        });
      }
    } else if (financeAdmin === false) {
      financeAdmin = false;
    } else {
      financeAdmin = user.roles.financeAdmin;
    }

    if (hr === true) {
      const hrrole = await User.findOne({
        'roles.hr': true,
      });
      // chk if that hr already exists and it is not the same user
      if (hrrole && !hrrole._id.equals(user._id)) {
        return res.status(400).json({
          message: `${hrrole.fName} ${hrrole.lName} Already has the HR role on the system. First edit that user removing the role from them. `,
        });
      }
    } else if (hr === false) {
      hr = false;
    } else {
      hr = user.roles.hr;
    }
    if (supervisor == null) {
      supervisor = user.roles.supervisor;
    }
    if (countryDirector === true) {
      const cdrole = await User.findOne({
        'roles.countryDirector': true,
      });
      // chk if that cd already exists and it is not the same user
      if (cdrole && !cdrole._id.equals(user._id)) {
        return res.status(400).json({
          message: `${cdrole.fName} ${cdrole.lName} Already has the Country Director role on the system. First edit that user removing the role. `,
        });
      }
    } else if (countryDirector === false) {
      countryDirector = false;
    } else {
      countryDirector = user.roles.countryDirector;
    }

    if (fName == null) {
      fName = user.fName;
    }

    if (lName == null) {
      lName = user.lName;
    }
    if (bankAccounts == null) {
      bankAccounts = user.bankAccounts;
    }
    if (birthDate == null) {
      birthDate = user.birthDate;
    }
    if (gender == null) {
      gender = user.gender;
    }
    if (title == null) {
      title = user.title;
    }
    if (programId == null) {
      programId = user.programId;
    }
    if (mongoose.Types.ObjectId.isValid(programId)) {
      const program = await Program.findOne({
        _id: programId,
      });
      if (!program) {
        programId = null;
      }
    } else {
      programId = null;
    }
    if (type == null) {
      type = user.type;
    }
    if (level == null) {
      level = user.level;
    }
    if (team == null) {
      team = user.team;
    }
    if (supervisorEmail == null) {
      supervisorEmail = user.supervisorEmail;
    }
    if (oNames == null) {
      oNames = user.oNames;
    }

    if (contractStatus == null) {
      contractStatus = contract.contractStatus;
    }
    if (contractStartDate == null) {
      contractStartDate = contract.contractStartDate;
    }
    if (contractEndDate == null) {
      contractEndDate = contract.contractEndDate;
    }
    if (contractType == null) {
      contractType = contract.contractType;
    }

    // modify user
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          fName,
          lName,
          supervisorEmail,
          gender,
          roles: {
            admin,
            hr,
            supervisor,
            countryDirector,
            deputyCountryDirector,
            procurementAdmin,
            financeAdmin,
          },
          bankAccounts,
          title,
          birthDate,
          programId,
          oNames,
          email,
          type,
          level,
          team,
          active,
        },
      }
    );
    // update contract
    await Contract.updateOne(
      {
        _id: contract._id,
      },
      {
        // eslint-disable-next-line max-len
        $set: {
          contractStartDate,
          contractEndDate,
          contractType,
          contractStatus,
        },
      }
    );

    if (
      // eslint-disable-next-line operator-linebreak
      workPermitId != null &&
      (user.type === 'expat' || user.type === 'tcn')
    ) {
      const workPermit = await WorkPermit.findOne({
        _id: workPermitId,
      });

      if (!workPermit) {
        return res.status(400).json({
          message: 'Work Permit Doesnot Exist',
        });
      }

      if (workPermitStartDate == null) {
        workPermitStartDate = workPermit.workPermitStartDate;
      }
      if (workPermitEndDate == null) {
        workPermitEndDate = workPermit.workPermitEndDate;
      }
      if (workPermitStatus == null) {
        workPermitStatus = workPermit.workPermitStatus;
      }

      await WorkPermit.updateOne(
        {
          _id: workPermitId,
        },
        {
          // eslint-disable-next-line max-len
          $set: {
            workPermitStartDate,
            workPermitEndDate,
            workPermitStatus,
          },
        }
      );
    }
    if (
      // eslint-disable-next-line operator-linebreak
      workPermitId === null &&
      (user.type === 'expat' || user.type === 'tcn')
    ) {
      // create user WP
      const workpermit = new WorkPermit({
        _userId: user._id,
        workPermitStartDate,
        workPermitEndDate,
        workPermitStatus: 'ACTIVE',
      });

      await workpermit.save();
    }

    res
      .status(201)
      .json({ message: 'User details have been Modified successfully' });
  } catch (err) {
    debug(err.message);
    console.log(err.message);
    res.status(500).json({ message: 'Error in Modifying User' });
  }
};

module.exports = editUser;
