import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Box } from "@material-ui/core";

import colors from "../../../constants/colors.json";

import {titleTimeFormat, getDates, getInterval} from '../shared'

const rightElements = [
  {
    title: "Past 15 minuts",
    name: "15m",
    type: "relative",
    dates: {
      delta: {
        minute: 15,
      },
    },
  },
  {
    title: "Past 1 hour",
    name: "1h",
    type: "relative",
    dates: {
      delta: {
        hour: 1,
      },
    },
  },
  {
    title: "Past 4 Hours",
    name: "4h",
    type: "relative",
    dates: {
      delta: {
        hour: 4,
      },
    },
  },
  {
    title: "Past 1 Day",
    name: "1d",
    type: "relative",
    dates: {
      delta: {
        day: 1,
      },
    },
  },
  {
    title: "Past 2 Days",
    name: "2d",
    type: "relative",
    dates: {
      delta: {
        day: 2,
      },
    },
  },
  {
    title: "Past 7 Days",
    name: "7d",
    type: "relative",
    dates: {
      delta: {
        day: 7,
      },
    },
  },
  {
    title: "Past 1 Month",
    name: "1mo",
    type: "relative",
    dates: {
      delta: {
        month: 1,
      },
    },
  },
  {
    title: "Past 3 Months",
    name: "3mo",
    type: "relative",
    dates: {
      delta: {
        month: 3,
      },
    },
  },
];

const useStyles = makeStyles((theme) => ({
  rightBox: {
    padding: "1rem 0px",
    width: "50%",
  },
  rightBut: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: ".5rem",
    "& div": {
      padding: ".2rem 0rem",
      marginRight: "1rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "42px",
      height: "30px",
      maxWidth: "50px",
      borderRadius: "2px",
      backgroundColor: colors.lightMain,
    },

    "&:hover": {
      backgroundColor: colors.main,
      "& > span": {
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
    "& > span": {
      color: colors.white,
    },
  },
}));

export default function RightPanel({ value, setValue, setPreValue, setError, setHoverValue, setIsActive }) {
  const classes = useStyles();

  const getClassName = (el) =>
    classes.rightBut +
    (titleTimeFormat(getDates(el.dates)).title ===
    titleTimeFormat(getDates(value.dates)).title
      ? " " + classes.rightButActive
      : "");

  const onDefaultClick = (el) => {
    setValue({
      type: el.type,
      dates: el.dates,
      title: el.title,
      interval: getDates(el.dates).interval,
    });
    setPreValue({});
    setError("");
  };

  const onMouseEnter = (el) => {
    const d = getDates(el.dates);
    setHoverValue({
      title: titleTimeFormat(d).title,
      dates: el.dates,
      interval: getInterval(d.start, d.end),
      type: el.type,
    });
  };

  const onMouseLeave = () => {
    setHoverValue({});
  };

  const boxParams = (el) => el.dates
    ? {
        className: getClassName(el),
        onClick: () => onDefaultClick(el),
        onMouseEnter: () => onMouseEnter(el),
        onMouseLeave: onMouseLeave,
      }
    : {
        className: classes.rightBut,
        onClick: () => el.onClick(setIsActive),
      };

  return (
    <Box className={classes.rightBox}>
      {rightElements.map((el, i) => (
        <Box key={i} {...boxParams(el)}>
          <Box style={{ backgroundColor: el.backgroundColor || "" }}>
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
  );
}
