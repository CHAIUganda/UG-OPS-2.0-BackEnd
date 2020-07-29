const { CronJob } = require('cron');
const log4js = require('log4js');
const takeLeaves = require('../controller/leave/scheduled/takeLeaves');
const plannedLeaves = require('../controller/leave/scheduled/plannedLeaves');
const birthDays = require('../controller/hr/scheduled/birthDays');
const contractRenewalInvite = require('../controller/hr/scheduled/contractRenewalInvite');
const workPermitRenewalReminder = require('../controller/hr/scheduled/workPermitRenewalReminder');
const ExpireContractStatus = require('../controller/hr/scheduled/ExpireContractStatus');
const ActivateContractStatus = require('../controller/hr/scheduled/ActivateContractStatus');
const ExpireWPStatus = require('../controller/hr/scheduled/ExpireWPStatus');
const ActivateWPStatus = require('../controller/hr/scheduled/ActivateWPStatus');
const handleSnoozedContractNotifications = require('../controller/hr/scheduled/handleSnoozedContractNotifications');
const handleSnoozedWPNotifications = require('../controller/hr/scheduled/handleSnoozedWPNotifications');

log4js.configure({
  appenders: { Timed: { type: 'file', filename: './log/logs.log' } },
  categories: { default: { appenders: ['Timed'], level: 'error' } },
});
// const logger = log4js.getLogger('Timed');

const schedule = new CronJob(
  '0 55 11 * * *',
  () => {
    console.log('Checking for birthdays and Ripe leaves');
    // contains auto scheduled jobs to be done by system
    // changes status of leaves to taken if he startdate comes
    takeLeaves();

    // changes status of planned leaves to Not Takens startdate comes and staff not applied
    // notify staff about their planned leaves
    plannedLeaves();

    // checks for contracts about to expire and sends invites to concerned personnel
    contractRenewalInvite();
    // checks for Workpermits about toexpire and sends invites to concerned personnel
    workPermitRenewalReminder();
    // sends BD wishes on people's BDS
    birthDays();
    // activates or deactivates contract when date comes
    ExpireContractStatus();
    ActivateContractStatus();
    // activates or deactivates WorkPermits when date comes
    ExpireWPStatus();
    ActivateWPStatus();

    // un snoozes snoozed contract notifications after 32 days
    handleSnoozedContractNotifications();

    // un snoozes snoozed WP notifications after 32 days
    handleSnoozedWPNotifications();

    // logger.error('Cheese is too ripe!');
    // logger.fatal('Cheese was breeding ground for listeria.');
  },
  null,
  true,
  'Africa/Kampala'
);

module.exports = schedule;
