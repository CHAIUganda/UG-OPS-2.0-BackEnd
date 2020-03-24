const { CronJob } = require('cron');
const log4js = require('log4js');
const takeLeaves = require('../controller/leave/takeLeaves');

log4js.configure({
  appenders: { Timed: { type: 'file', filename: './log/logs.log' } },
  categories: { default: { appenders: ['Timed'], level: 'error' } }
});
// const logger = log4js.getLogger('Timed');

const schedule = new CronJob(
  '0 17 23 * * *',
  () => {
    console.log('Checking for birthdays and Ripe leaves');
    takeLeaves();

    // logger.error('Cheese is too ripe!');
    // logger.fatal('Cheese was breeding ground for listeria.');
  },
  null,
  true,
  'Africa/Kampala'
);

module.exports = schedule;
