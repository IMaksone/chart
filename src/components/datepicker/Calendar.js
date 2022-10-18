import React, { useRef, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import { makeStyles } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

import colors from '../../constants/colors.json';

const useStyles = makeStyles((theme) => ({
  root: {
    "& button": {
      backgroundColor: colors.white,
      border: 0,
      cursor: "pointer",
    },

    "& .react-calendar__month-view__days": {
      padding: "4px",
    },
    "& .react-calendar__month-view__days button": {
      //border: `2px solid rgba(0,0,0,0)`,
      padding: "16px 6px",
      margin: "4px 0px",
      fontSize: theme.typography.subtitle2.fontSize,
      fontWeight: theme.typography.subtitle2.fontWeight,
    },
    "& .react-calendar__month-view__days button.react-calendar__tile--range": {
      backgroundColor: colors.main,
      //color: colors.white,
    },
    "& .react-calendar__month-view__days button.react-calendar__tile--rangeStart, button.react-calendar__tile--rangeEnd": {
      backgroundColor: `${colors.main} !important`,
      color: `${colors.white} !important`,
      margin: "2px 0px",
      borderRadius: 3,
      border: `2px solid ${colors.main} !important`,
    },
    "& .react-calendar__month-view__days button:hover": {
      border: `2px solid ${colors.main}`,
      borderRadius: 3,
      margin: "2px 0px",
    },
    "& .react-calendar__month-view__days button:disabled": {
      color: theme.palette.grey[300],
      border: 0,
    },
    "& .react-calendar__month-view__days button.react-calendar__month-view__days__day--neighboringMonth ": {
      color: theme.palette.grey[500],
    },

    "& .react-calendar__month-view__weekdays__weekday": {
      textAlign: "center",
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
    },
    "& .react-calendar__month-view__weekdays__weekday abbr": {
      textDecoration: "none !important",
    },

    "& .react-calendar__navigation": {
      padding: "1rem .5rem",
      alignItems: "center",
    },
    "& .react-calendar__navigation .react-calendar__navigation__label__labelText": {
      flexGrow: 1,
      textAlign: "center",
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      pointerEvents: "none",
    },
    "& .react-calendar__navigation button:disabled": {
      opacity: 0,
    },
  },
}));

const getEnd = (end) => {
  end.setSeconds(59);
  return end;
};

export default function SimpleCalendar({ dates, setDates }) {
  const classes = useStyles();

  const rootRef = useRef();

  const value = useMemo(
    () =>
      dates.interval === "1d" &&
      dates.start.getHours() === 0 &&
      dates.start.getMinutes() === 0 &&
      dates.start.getSeconds() === 0
        ? dates.start
        : dates.start.getHours() === 0 &&
          dates.start.getMinutes() === 0 &&
          dates.start.getSeconds() === 0 &&
          dates.end.getHours() === 23 &&
          dates.end.getMinutes() === 59 &&
          dates.end.getSeconds() === 59
        ? [dates.start, dates.end]
        : undefined,
    [dates]
  );

  useEffect(() => {
    const idTitle = "calendar-title-" + Math.random();
    const idSpan = "calendar-title-span-" + Math.random();

    rootRef.current.children[0].children[0].children[1].firstChild.id = idSpan;
    rootRef.current.children[0].children[0].children[1].id = idTitle;

    rootRef.current.children[0].children[0].replaceChild(
      document.getElementById(idSpan),
      document.getElementById(idTitle)
    );
  }, []);

  return (
    <div className="simple-calendar" ref={rootRef}>
      <Calendar
        className={classes.root}
        //defaultValue={defaultValue}
        value={value}
        onChange={(value) => {
          //setValue(value);
          setDates({
            start: value[0],
            end: value[1] ? getEnd(value[1]) : undefined,
          });
        }}
        selectRange={true}
        allowPartialRange={true}
        maxDate={new Date()}
        next2Label={null}
        prev2Label={null}
        calendarType="US"
        locale="en-EN"
        view="month"
        prevLabel={<ChevronLeftIcon fontSize="large" color="action" />}
        nextLabel={<ChevronRightIcon fontSize="large" color="action" />}
        onViewChange={(e) => {
          console.log(e);
        }}
      />
    </div>
  );
}
