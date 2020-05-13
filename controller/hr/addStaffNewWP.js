const { validationResult } = require('express-validator/check');
const debug = require('debug')('server');
const log4js = require('log4js');
const User = require('../../model/User');
const WorkPermit = require('../../model/WorkPermit');
const errorToString = require('../../helpers/errorToString');

const addStaffNewWP = async (req, res) => {
  const errors = validationResult(req);
  const logger = log4js.getLogger('Timed');
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errorToString(errors.array()),
    });
  }

  const { workPermitStartDate, workPermitEndDate, staffEmail } = req.body;

  let workPermitStatus = 'ACTIVE';

  try {
    const user = await User.findOne({
      email: staffEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: 'User does not Exist',
      });
    }

    if (!user.type === 'expat' || !user.type === 'tcn') {
      return res.status(400).json({
        message: `This User cannot have a WorkPermit. Their type is ${user.type}`,
      });
    }

    const activeWP = await WorkPermit.findOne({
      _userId: user._id,
      workPermitStatus: 'ACTIVE',
    });
    if (activeWP) {
      const PendingWP = await WorkPermit.findOne({
        _userId: user._id,
        workPermitStatus: 'Pending',
      });

      if (PendingWP) {
        return res.status(400).json({
          message: `${user.fName} ${user.lName} Already has a Pending WorkPermit about to start`,
        });
      }

      workPermitStatus = 'Pending';
    }

    // create user WP
    const workpermit = new WorkPermit({
      _userId: user._id,
      workPermitStartDate,
      workPermitEndDate,
      workPermitStatus,
    });

    await workpermit.save();
    res.status(201).json({
      message: `${user.fName} ${user.lName}'s New Work Permit Added successfully`,
    });
  } catch (err) {
    debug(err.message);
    logger.error(`Error saving new WorkPermit ${err.message}`);
    console.log(`Error saving new WorkPermit ${err.message}`);
    res.status(500).json({ message: 'Error in Saving' });
  }
};

module.exports = addStaffNewWP;
