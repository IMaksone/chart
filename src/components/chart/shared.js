import { min, timeFormat } from "d3";

export const getTimeFormatX = (xScale, width, date) => {
  let delta = (xScale.invert(width) - xScale.invert(0)) / 1000;

  const year = delta / 3.154e7;
  const month = delta / 2.628e6;
  const day = delta / 86400;
  const hour = delta / 3600;
  const minute = delta / 60;

  return timeFormat(
    year > 1
      ? "%Y %b"
      : month > 0.3
      ? "%b %d"
      : day > 1
      ? "%a %H h"
      : hour > 1.5
      ? "%H:%M"
      : minute > 1.5
      ? "%H:%M"
      : "%H:%M:%S"
  )(date);
};

export const getTimeFormatTooltip = (xScale, width, date) => {
  let delta = (xScale.invert(width) - xScale.invert(0)) / 1000;

  const year = delta / 3.154e7;
  const month = delta / 2.628e6;
  const day = delta / 86400;
  const hour = delta / 3600;
  const minute = delta / 60;

  return timeFormat(
    year > 1
      ? "%Y %b %d %H:%M"
      : month > 0.3
      ? "%b %d %H:%M"
      : day > 1
      ? "%a %H:%M"
      : hour > 1.5
      ? "%H:%M"
      : minute > 1.5
      ? "%H:%M"
      : "%H:%M:%S"
  )(date);
};

export const findRangeArr = ({ data, end, start }) => {
  const count = data.length;

  let first, last;

  if (start > data[count - 1].date || end < data[0].date) {
    return [];
  }

  if (start < data[0].date) {
    first = 0;
  } else {
    let a = 0;
    let b = count - 1;
    let mid = Math.floor(count / 2);
    for (let i = 0; i <= Math.sqrt(count); i++) {
      if (start < data[mid].date) {
        b = mid;
      } else if (start > data[mid].date) {
        a = mid;
      } else if (start === data[mid].date) {
        first = mid;
        break;
      }

      mid = Math.floor((b + a) / 2);
      first = mid;
    }
  }

  if (end > data[count - 1].date) {
    last = count - 1;
  } else {
    let a = 0;
    let b = count - 1;
    let mid = Math.floor(count / 2);
    for (let i = 0; i <= Math.sqrt(count); i++) {
      if (end < data[mid].date) {
        b = mid;
      } else if (end > data[mid].date) {
        a = mid;
      } else if (end === data[mid].date) {
        last = mid;
        break;
      }

      mid = Math.floor((b + a) / 2);
      last = mid;
    }
  }

  let newArr = [];

  for (let i = first; i <= last; i++) {
    newArr[i - first] = {
      date: data[i].date,
      value: data[i].value,
      ind: i,
    };
  }

  return newArr;
};

export const getVisibleData = ({ data, end, start }) => {
  let visible = findRangeArr({ data, end, start });

  if (!visible.length) {
    const delta = end - start;

    let mid = new Date();
    mid.setTime(start.getTime() + delta / 2);

    const minimum = min(data.map((d) => Math.abs(d.date - mid)));

    let ind = data.findIndex(
      (el) => el.date.getTime() === mid.getTime() + minimum
    );

    if (ind < 0)
      ind = data.findIndex(
        (el) => el.date.getTime() === mid.getTime() - minimum
      );

    visible = [{ ...data[ind], ind }];
  }

  if (visible[0].ind > 0)
    visible = [
      { ...data[visible[0].ind - 1], ind: visible[0].ind - 1 },
      ...visible,
    ];
  if (visible[visible.length - 1].ind < data.length - 1)
    visible = [
      ...visible,
      {
        ...data[visible[visible.length - 1].ind + 1],
        ind: visible[visible.length - 1].ind + 1,
      },
    ];

  return visible;
};

export const getApproximationData = ({ data, end, start }) => {
  //const visible = data.filter((el) => el.date >= start && el.date <= end);

  const visible = findRangeArr({ data, end, start });

  if (visible.length > 2000) {
    const k = Math.floor(visible.length / 1000);
    return data.filter((el, i) => i % k === 0);
  } else {
    return data;
  }
};

export const getSimpleData = ({ data, end, start, scatter = 2 }) => {
  const delta = end - start;

  let simpleStart = new Date();
  let simpleEnd = new Date();

  simpleStart.setTime(start.getTime() - scatter * delta);
  simpleEnd.setTime(end.getTime() + scatter * delta);

  return findRangeArr({ data, end: simpleEnd, start: simpleStart });

  /*return data
      .map((el, i) => ({ ...el, ind: i }))
      .filter((el) => el.date >= simpleStart && el.date <= simpleEnd);*/
};
