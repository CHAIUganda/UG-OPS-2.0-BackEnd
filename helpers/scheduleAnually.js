const { CronJob } = require('cron');
const log4js = require('log4js');
const handleAnnualLeaveBF = require('../controller/hr/scheduled/handleAnnualLeaveBF');

log4js.configure({
  appenders: { Timed: { type: 'file', filename: './log/logs.log' } },
  categories: { default: { appenders: ['Timed'], level: 'error' } },
});
// const logger = log4js.getLogger('Timed');
// ss mm hh dd mm (sun-sat)
const scheduleAnually = new CronJob(
  '0 55 23 31 11 *',
  () => {
    console.log('Allocating Annual Leave BF');
    // contains auto scheduled jobs to be done by system
    // alloccate annual leave brought forward at end of year
    handleAnnualLeaveBF();
  },
  null,
  true,
  'Africa/Kampala'
);

module.exports = scheduleAnually;
