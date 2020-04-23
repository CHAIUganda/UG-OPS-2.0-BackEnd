const { CronJob } = require('cron');
const log4js = require('log4js');
const takeLeaves = require('../controller/leave/takeLeaves');
const birthDays = require('../controller/hr/birthDays');
const contractRenewalInvite = require('../controller/hr/contractRenewalInvite');
const workPermitRenewalReminder = require('../controller/hr/workPermitRenewalReminder');
const handleContractStatus = require('../controller/hr/handleContractStatus');
const handleWPStatus = require('../controller/hr/handleWPStatus');
const handleSnoozedContractNotifications = require('../controller/hr/handleSnoozedContractNotifications');
const handleSnoozedWPNotifications = require('../controller/hr/handleSnoozedWPNotifications');

log4js.configure({
  appenders: { Timed: { type: 'file', filename: './log/logs.log' } },
  categories: { default: { appenders: ['Timed'], level: 'error' } },
});
// const logger = log4js.getLogger('Timed');

const schedule = new CronJob(
  '0 59 10 * * *',
  () => {
    console.log('Checking for birthdays and Ripe leaves');
    // contains auto scheduled jobs to be done by system
    // changes status of leaves to taken if he startdate comes
    takeLeaves();
    // checks for contracts about to expire and sends invites to concerned personnel
    contractRenewalInvite();
    // checks for Workpermits about toexpire and sends invites to concerned personnel
    workPermitRenewalReminder();
    // sends BD wishes on people's BDS
    birthDays();
    // activates or deactivates contract when date comes
    handleContractStatus();
    // activates or deactivates WorkPermits when date comes
    handleWPStatus();

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
