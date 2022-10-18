import { timeFormat } from "d3";

export const convertDates = ({ start, end }) => {
  return {
    start: {
      year: start.getFullYear(),
      month: start.getMonth() + 1,
      day: start.getDate(),
      hour: start.getHours(),
      minute: start.getMinutes(),
      second: start.getSeconds(),
    },
    end: end
      ? {
          year: end.getFullYear(),
          month: end.getMonth() + 1,
          day: end.getDate(),
          hour: end.getHours(),
          minute: end.getMinutes(),
          second: end.getSeconds(),
        }
      : undefined,
  };
};

export const getInterval = (start, end) => {
  let delta = (end - start) / 1000;

  if (delta % 10 === 9) delta += 1;

  const year = Math.floor(delta / 3.154e7);
  delta -= year * 3.154e7;
  const month = Math.floor(delta / 2.628e6);
  delta -= month * 2.628e6;
  const day = Math.floor(delta / 86400);
  delta -= day * 86400;
  const hour = Math.floor(delta / 3600);
  delta -= hour * 3600;
  const minute = Math.floor(delta / 60);
  delta -= minute * 60;
  const second = Math.floor(delta);

  return (
    (year ? year + "y" : "") +
    (month ? month + "mo" : "") +
    (day && !year ? day + "d" : "") +
    (hour && !month && !year ? hour + "h" : "") +
    (minute && !day && !month && !year ? minute + "m" : "") +
    (second && !hour && !day && !month && !year ? second + "s" : "")
  );
};

export const getDates = ({ delta, start, end, unix }) => {
  let endDate, startDate;

  endDate = new Date();
  startDate = new Date();
  if (delta) {
    startDate.setFullYear(
      endDate.getFullYear() - (delta.year || 0),
      endDate.getMonth() - (delta.month || 0),
      endDate.getDate() - (delta.day || 0)
    );
    startDate.setHours(
      endDate.getHours() - (delta.hour || 0),
      endDate.getMinutes() - (delta.minute || 0),
      endDate.getSeconds() - (delta.second || 0)
    );
  } else if (start) {
    const today = new Date();
    startDate.setFullYear(
      start.year || today.getFullYear(),
      start.month ? start.month - 1 : start.year ? 0 : today.getMonth(),
      start.day || (start.month || start.year ? 1 : today.getDate())
    );
    startDate.setHours(
      start.hour ||
        (start.day || start.month || start.year ? 0 : today.getHours()),
      start.minute ||
        (start.hour || start.day || start.month || start.year
          ? 0
          : today.getMinutes()),
      start.second ||
        (start.minute || start.hour || start.day || start.month || start.year
          ? 0
          : today.getSeconds())
    );

    if (!end) {
      endDate.setFullYear(
        start.year ? start.year + (!start.month ? 1 : 0) : today.getFullYear(),
        start.month
          ? start.month - (!start.day ? 0 : 1)
          : start.year
          ? 0
          : today.getMonth(),
        start.day
          ? start.day + (!start.hour ? 1 : 0)
          : start.month || start.year
          ? 1
          : today.getDate()
      );
      endDate.setHours(
        start.hour
          ? start.hour + (!start.minute ? 1 : 0)
          : start.day || start.month || start.year
          ? 0
          : today.getHours(),
        start.minute
          ? start.minute + (!start.second ? 1 : 0)
          : start.hour || start.day || start.month || start.year
          ? 0
          : today.getMinutes(),
        start.second
          ? start.second + 1
          : start.minute || start.hour || start.day || start.month || start.year
          ? -1
          : today.getSeconds()
      );
    } else {
      endDate.setFullYear(
        end.year ? end.year : today.getFullYear(),
        end.month ? end.month - 1 : end.year ? 0 : today.getMonth(),
        end.day ? end.day : end.month || end.year ? 1 : today.getDate()
      );
      endDate.setHours(
        end.hour
          ? end.hour
          : end.day || end.month || end.year
          ? 0
          : today.getHours(),
        end.minute
          ? end.minute
          : end.hour || end.day || end.month || end.year
          ? 0
          : today.getMinutes(),
        end.second
          ? end.second
          : end.minute || end.hour || end.day || end.month || end.year
          ? 0
          : today.getSeconds()
      );
    }
  } else if (unix) {
    startDate.setTime(unix.start);
    if (unix.end) endDate.setTime(unix.end);
  }

  return {
    start: startDate,
    end: endDate,
    interval: getInterval(startDate, endDate),
  };
};

export const titleTimeFormat = (dates) => {
  const today = new Date();

  const type =
    today.getFullYear() !== dates.start.getFullYear() ||
    today.getFullYear() !== dates.end.getFullYear()
      ? "year"
      : "default";

  return {
    type,
    title:
      timeFormat(type !== "year" ? "%b %d, %I:%M %p" : "%b %d, %Y, %I:%M %p")(
        dates.start
      ) +
      " - " +
      timeFormat(type !== "year" ? "%b %d, %I:%M %p" : "%b %d, %Y, %I:%M %p")(
        dates.end
      ),
  };
};

export const parseTitle = (title) => {
  let dates = [new Date(), new Date()];

  let error;

  title.split(" - ").forEach((el, i) => {
    const arr = el.split(" ");
    let ind = 0;

    const month = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].findIndex((m) => m === arr[ind].toLowerCase());

    ind++;

    if (month >= 0) {
      dates[i].setMonth(month);
    } else {
      dates[i].setMonth(0);
      error = "Wrong month";
    }

    const day = +(arr[ind][0] + arr[ind][1]);

    ind++;

    if (day > 0 && day < 32) {
      dates[i].setDate(day);
    } else {
      dates[i].setDate(1);
      error = "Wrong day";
    }

    if (arr.lenght === 5) {
      const year = +arr[ind];

      dates[i].setFullYear(year);

      ind++;
    }

    const [hour, minute] = arr[ind].split(":");

    if (hour >= 0 && hour < 13) {
      dates[i].setHours(hour);
    } else {
      dates[i].setHours(0);
      error = "Wrong hours";
    }

    if (minute >= 0 && minute < 60) {
      dates[i].setMinutes(minute);
    } else {
      dates[i].setMinutes(0);
      error = "Wrong minutes";
    }

    ind++;

    const m = arr[ind].toLowerCase();

    if (m === "pm" || m === "am") {
      dates[i].setHours(
        dates[i].getHours() +
          (m === "pm" && hour < 12
            ? 12
            : +hour === 12 && +minute === 0
            ? -12
            : 0)
      );
    } else {
      error = "Wrong time of day";
    }
  });

  if (dates[0] > dates[1]) error = "Wrong time of day";

  return {
    start: dates[0],
    end: dates[1],
    error,
  };
};
