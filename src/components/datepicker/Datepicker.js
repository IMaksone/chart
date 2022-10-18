import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Typography, Box, OutlinedInput, Paper } from '@material-ui/core';
import { timeFormat } from 'd3';

import colors from '../../constants/colors.json';

import Mask from './MaskDatepicker';
import Calendar from './Calendar';

const leftBlocks = [
  {
    title: 'Relative',
    type: 'relative',
    children: [
      {
        title: '45m',
        dates: {
          delta: {
            minute: 45,
          },
        },
      },
      {
        title: '12 hours',
        dates: {
          delta: {
            hour: 12,
          },
        },
      },
      {
        title: '1 Month',
        dates: {
          delta: {
            month: 1,
          },
        },
      },
      {
        title: 'Last Year',
        dates: {
          delta: {
            year: 1,
          },
        },
      },
      {
        title: 'Last week',
        dates: {
          delta: {
            day: 7,
          },
        },
      },
    ],
  },
  {
    title: 'Fixed',
    type: 'fixed',
    children: [
      {
        title: 'Sep 1',
        dates: {
          start: {
            month: 9,
            day: 1,
          },
        },
      },
      {
        title: '9/1 - 9/2',
        dates: {
          start: {
            month: 9,
            day: 1,
          },
          end: {
            month: 9,
            day: 2,
          },
        },
      },
      {
        title: '9/2019 - 12/2020',
        dates: {
          start: {
            year: 2019,
            month: 9,
          },
          end: {
            year: 2020,
            month: 12,
          },
        },
      },
      {
        title: '2/2019',
        dates: {
          start: {
            year: 2019,
            month: 2,
          },
        },
      },
      {
        title: 'Sep',
        dates: {
          start: {
            month: 9,
          },
        },
      },
      {
        title: '2019',
        dates: {
          start: {
            year: 2019,
          },
        },
      },
      {
        title: '9/10/2020',
        dates: {
          start: {
            year: 2020,
            month: 9,
            day: 10,
          },
        },
      },
      {
        title: '9/10/2020 - 9/20/2020',
        dates: {
          start: {
            year: 2020,
            month: 9,
            day: 10,
          },
          end: {
            year: 2020,
            month: 9,
            day: 20,
          },
        },
      },
    ],
  },
  {
    title: 'Unix timestamps',
    type: 'unix',
    children: [
      {
        title: '1000000 - 10000000',
        dates: {
          unix: {
            start: 1e12,
            end: 2e12,
          },
        },
      },
      {
        title: '1000000 - today',
        dates: {
          unix: {
            start: 1e12,
          },
        },
      },
    ],
  },
];

const rightElements = [
  {
    title: 'Past 15 minuts',
    name: '15m',
    type: 'relative',
    dates: {
      delta: {
        minute: 15,
      },
    },
  },
  {
    title: 'Past 1 hour',
    name: '1h',
    type: 'relative',
    dates: {
      delta: {
        hour: 1,
      },
    },
  },
  {
    title: 'Past 4 Hours',
    name: '4h',
    type: 'relative',
    dates: {
      delta: {
        hour: 4,
      },
    },
  },
  {
    title: 'Past 1 Day',
    name: '1d',
    type: 'relative',
    dates: {
      delta: {
        day: 1,
      },
    },
  },
  {
    title: 'Past 2 Days',
    name: '2d',
    type: 'relative',
    dates: {
      delta: {
        day: 2,
      },
    },
  },
  {
    title: 'Past 7 Days',
    name: '7d',
    type: 'relative',
    dates: {
      delta: {
        day: 7,
      },
    },
  },
  {
    title: 'Past 1 Month',
    name: '1mo',
    type: 'relative',
    dates: {
      delta: {
        month: 1,
      },
    },
  },
  {
    title: 'Past 3 Months',
    name: '3mo',
    type: 'relative',
    dates: {
      delta: {
        month: 3,
      },
    },
  },
];

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

const getInterval = (start, end) => {
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
    (year ? year + 'y' : '') +
    (month ? month + 'mo' : '') +
    (day && !year ? day + 'd' : '') +
    (hour && !month && !year ? hour + 'h' : '') +
    (minute && !day && !month && !year ? minute + 'm' : '') +
    (second && !hour && !day && !month && !year ? second + 's' : '')
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

const titleTimeFormat = (dates) => {
  const today = new Date();

  const type =
    today.getFullYear() !== dates.start.getFullYear() ||
    today.getFullYear() !== dates.end.getFullYear()
      ? 'year'
      : 'default';

  return {
    type,
    title:
      timeFormat(type !== 'year' ? '%b %d, %I:%M %p' : '%b %d, %Y, %I:%M %p')(
        dates.start
      ) +
      ' - ' +
      timeFormat(type !== 'year' ? '%b %d, %I:%M %p' : '%b %d, %Y, %I:%M %p')(
        dates.end
      ),
  };
};

const parseTitle = (title) => {
  let dates = [new Date(), new Date()];

  let error;

  title.split(' - ').forEach((el, i) => {
    const arr = el.split(' ');
    let ind = 0;

    const month = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ].findIndex((m) => m === arr[ind].toLowerCase());

    ind++;

    if (month >= 0) {
      dates[i].setMonth(month);
    } else {
      dates[i].setMonth(0);
      error = 'Wrong month';
    }

    const day = +(arr[ind][0] + arr[ind][1]);

    ind++;

    if (day > 0 && day < 32) {
      dates[i].setDate(day);
    } else {
      dates[i].setDate(1);
      error = 'Wrong day';
    }

    if (arr.lenght === 5) {
      const year = +arr[ind];

      dates[i].setFullYear(year);

      ind++;
    }

    const [hour, minute] = arr[ind].split(':');

    if (hour >= 0 && hour < 13) {
      dates[i].setHours(hour);
    } else {
      dates[i].setHours(0);
      error = 'Wrong hours';
    }

    if (minute >= 0 && minute < 60) {
      dates[i].setMinutes(minute);
    } else {
      dates[i].setMinutes(0);
      error = 'Wrong minutes';
    }

    ind++;

    const m = arr[ind].toLowerCase();

    if (m === 'pm' || m === 'am') {
      dates[i].setHours(
        dates[i].getHours() +
          (m === 'pm' && hour < 12
            ? 12
            : +hour === 12 && +minute === 0
            ? -12
            : 0)
      );
    } else {
      error = 'Wrong time of day';
    }
  });

  if (dates[0] > dates[1]) error = 'Wrong time of day';

  return {
    start: dates[0],
    end: dates[1],
    error,
  };
};

const MyOutlinedInput = withStyles((theme) => ({
  root: {
    width: 410,
    backgroundColor: colors.white,
    paddingBottom: 1,
    paddingLeft: 60,
    paddingRight: 15,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    '&:after': {
      content: "' '",
      display: 'block',
      position: 'absolute',
      right: 10,
      top: 11,
      width: 6,
      height: 6,
      borderBottom: `1px solid ${colors.main}`,
      borderRight: `1px solid ${colors.main}`,
      transform: 'rotate(45deg)',
    },
    '& fieldset': {
      borderColor: colors.main + ' !important',
    },
    '&:hover fieldset': {
      borderColor: colors.main + ' !important',
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.main + ' !important',
    },
    '&.Mui-error fieldset': {
      borderColor: colors.red + ' !important',
    },
    '& input': {
      paddingTop: 9,
      paddingBottom: 5,
    },
  },
}))(OutlinedInput);

const useStyles = makeStyles((theme) => ({
  root: { 
    position: 'relative'
  },
  paper: {
    display: 'flex',
    //padding: "1rem",
    width: '700px',
    position: 'absolute',
    zIndex: 10,
    right: '0rem',
    top: '2.5rem',
  },
  leftBox: {
    width: '50%',
    padding: '.5rem 1rem',
    margin: '.5rem 0rem',
    borderRight: `1px solid ${theme.palette.grey[400]}`,
  },
  rightBox: {
    padding: '1rem 0px',
    width: '50%',
  },
  leftBut: {
    cursor: 'pointer',
    padding: '.2rem .8rem .1rem .8rem',
    borderRadius: '4px',
    backgroundColor: colors.lightmain,
    margin: '3px 6px 3px 0',
    '&:hover': {
      backgroundColor: colors.main,
      '& span': {
        color: colors.white,
      },
    },
  },
  leftButActive: {
    backgroundColor: colors.main,
    '& span': {
      color: colors.white,
    },
  },
  rightBut: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '.5rem',
    '& div': {
      padding: '.2rem 0rem',
      marginRight: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '42px',
      height: '30px',
      maxWidth: '50px',
      borderRadius: '2px',
      backgroundColor: colors.lightMain,
    },

    '&:hover': {
      backgroundColor: colors.main,
      '& > span': {
        color: colors.white,
      },
      /*"& div": {
        backgroundColor: colors.main,
        "& span": {
          color: colors.white,
        },
      },*/
    },
  },
  rightButActive: {
    backgroundColor: colors.main,
    '& > span': {
      color: colors.white,
    },
  },
  errorText: {
    position: 'absolute',
    top: -17,
    left: 0,
  },
  intervalText: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.lightMain,
    borderRadius: 2,
    width: 60,
    padding: '.1rem .2rem',
  },
}));

export default function Datapicker({
  value,
  setValue,
  preValue,
  setPreValue,
}) {
  const classes = useStyles();

  const [isActive, setIsActive] = useState('');

  const [error, setError] = useState('');
  const [hoverValue, setHoverValue] = useState({});

  const rootRef = useRef();

  const dates = useMemo(() => getDates(value.dates), [value]);

  const viewDate = useMemo(() => titleTimeFormat(dates).title, [value]);

  const clickEvent = useCallback(
    (e) => {
      if (rootRef && !e.path.find((el) => el === rootRef.current) && isActive) {
        setIsActive('');
      }
    },
    [isActive]
  );

  useEffect(() => {
    window.addEventListener('mousedown', clickEvent);
    window.addEventListener('click', clickEvent);
    return () => {
      window.removeEventListener('mousedown', clickEvent);
      window.removeEventListener('click', clickEvent);
    };
  });

  const handleChange = useCallback((event) => {
    const data = parseTitle(event.target.value);
    setPreValue({
      title: event.target.value,
      dates: convertDates({ start: data.start, end: data.end }),
      interval: getInterval(data.start, data.end),
      type: 'absolute',
    });
    setError(data.error);
    setIsActive('default');
  }, []);

  const renderCalender = useCallback(() => {
    return (
      <Calendar
        dates={
          preValue.dates ? getDates(preValue.dates) : getDates(value.dates)
        }
        setDates={({ start, end }) => {
          const dates = convertDates({ start, end });
          setValue({
            title: titleTimeFormat(getDates(dates)).title,
            dates,
            interval: getDates(dates).interval,
            type: 'absolute',
          });
          setPreValue({});
          setError('');
        }}
      />
    );
  }, [value, preValue]);

  const renderDrop = useCallback(
    () => (
      <>
        <Box className={classes.leftBox} pr={2}>
          <Box mb={0.5}>
            <Typography variant="h6" component="span">
              Type custom times like:
            </Typography>
          </Box>
          {leftBlocks.map((el, i) => (
            <Box key={i} mt={1.5}>
              <Typography variant="subtitle1" component="span">
                {el.title}
              </Typography>
              <Box display="flex" flexWrap="wrap">
                {el.children.map((ch, ind) => (
                  <Box
                    key={ind}
                    className={
                      classes.leftBut +
                      (titleTimeFormat(getDates(ch.dates)).title ===
                      titleTimeFormat(getDates(value.dates)).title
                        ? ' ' + classes.leftButActive
                        : '')
                    }
                    onClick={() => {
                      setValue({
                        type: el.type,
                        dates: ch.dates,
                        title: ch.title,
                        interval: getDates(ch.dates).interval,
                      });
                      setPreValue({});
                      setError('');
                    }}
                    onMouseEnter={() => {
                      const d = getDates(ch.dates);
                      setHoverValue({
                        title: titleTimeFormat(d).title,
                        dates: ch.dates,
                        interval: getInterval(d.start, d.end),
                        type: el.type,
                      });
                      //setError("");
                    }}
                    onMouseLeave={() => {
                      setHoverValue({});
                    }}
                  >
                    <Typography variant="subtitle2" component="span">
                      {ch.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box className={classes.rightBox}>
          {rightElements.map((el, i) => (
            <Box
              key={i}
              {...(el.dates
                ? {
                    className:
                      classes.rightBut +
                      (titleTimeFormat(getDates(el.dates)).title ===
                      titleTimeFormat(getDates(value.dates)).title
                        ? ' ' + classes.rightButActive
                        : ''),
                    onClick: () => {
                      setValue({
                        type: el.type,
                        dates: el.dates,
                        title: el.title,
                        interval: getDates(el.dates).interval,
                      });
                      setPreValue({});
                      setError('');
                    },
                    onMouseEnter: () => {
                      const d = getDates(el.dates);
                      setHoverValue({
                        title: titleTimeFormat(d).title,
                        dates: el.dates,
                        interval: getInterval(d.start, d.end),
                        type: el.type,
                      });
                      //setError("");
                    },
                    onMouseLeave: () => {
                      setHoverValue({});
                    },
                  }
                : {
                    className: classes.rightBut,
                    onClick: () => el.onClick(setIsActive),
                  })}
            >
              <Box style={{ backgroundColor: el.backgroundColor || '' }}>
                {el.name ? (
                  <Typography variant="subtitle2" component="span">
                    {el.name}
                  </Typography>
                ) : (
                  el.icon
                )}
              </Box>
              <Typography variant="subtitle2" component="span">
                {el.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    ),
    [classes, value]
  );

  return (
    <Box ref={rootRef} className={classes.root}>
      <MyOutlinedInput
        id="simple-datepicker"
        name={
          titleTimeFormat(
            hoverValue.dates
              ? getDates(hoverValue.dates)
              : preValue.dates
              ? getDates(preValue.dates)
              : dates
          ).type === 'year'
            ? 'simple-datepicker-year'
            : 'simple-datepicker'
        }
        error={error ? true : false}
        value={
          isActive
            ? hoverValue.title || preValue.title || value.view || viewDate
            : preValue.title || value.view || value.title || viewDate
        }
        variant="outlined"
        onClick={() => (isActive ? '' : setIsActive('default'))}
        onChange={handleChange}
        {...(isActive ? { inputComponent: Mask } : {})}
      />
      <Typography color="error" variant="caption" className={classes.errorText}>
        {error}
      </Typography>
      <Typography
        variant="subtitle2"
        className={classes.intervalText}
        align="center"
      >
        {hoverValue.interval || preValue.interval || value.interval}
      </Typography>
      {/*<MyTextField
        id="simple-datapicker"
        error={error ? true : false}
        value={isActive ? preValue || viewDate : value.title || viewDate}
        variant="outlined"
        onClick={() => (isActive ? "" : setIsActive(true))}
        onChange={handleChange}
      />*/}
      {isActive ? (
        <Paper className={classes.paper} elevation={3}>
          {isActive === 'default' ? renderDrop() : renderCalender()}
        </Paper>
      ) : (
        ''
      )}
    </Box>
  );
}
