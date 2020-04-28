const moment = require('moment-timezone');

const getLeaveDaysNo = (startDate, endDate, publicHolidays) => {
  const arrayOfDays = [];
  let leaveDays = [];
  let weekendDays = [];
  let holidayDays = [];
  let start = new Date(startDate);
  const end = new Date(endDate);

  while (moment(start.toDateString()).isBefore(end.toDateString())) {
    arrayOfDays.push(start);
    const newDate = moment(start).add(24, 'hour');
    start = new Date(newDate);
  }
  arrayOfDays.push(end);

  let check = true;
  arrayOfDays.forEach((day) => {
    check = true;
    publicHolidays.forEach((holiday) => {
      let hol = `${new Date().getFullYear()}-${
        holiday.date.replace('/', '-').split('-')[1]
      }-${holiday.date.replace('/', '-').split('-')[0]}`;

      let dDay = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;

      hol = new Date(hol);
      dDay = new Date(dDay);
      if (check && moment(hol.toDateString()).isSame(dDay.toDateString())) {
        holidayDays.push({
          day,
          name: holiday.name,
        });
        check = false;
      }
    });

    if (check && (day.getDay() === 0 || day.getDay() === 6)) {
      weekendDays.push(day);
      check = false;
    } else if (check) {
      leaveDays.push(day);
    }
  });
  let totalDays = leaveDays.length;

  const objToReturn = {
    totalDays,
    leaveDays,
    weekendDays,
    holidayDays,
  };

  totalDays = 0;
  leaveDays = [];
  weekendDays = [];
  holidayDays = [];

  return objToReturn;
};
module.exports = getLeaveDaysNo;
