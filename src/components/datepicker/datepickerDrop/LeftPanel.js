import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Box } from "@material-ui/core";

import colors from "../../../constants/colors.json";

import { titleTimeFormat, getDates, getInterval } from "../shared";

const leftBlocks = [
  {
    title: "Relative",
    type: "relative",
    children: [
      {
        title: "45m",
        dates: {
          delta: {
            minute: 45,
          },
        },
      },
      {
        title: "12 hours",
        dates: {
          delta: {
            hour: 12,
          },
        },
      },
      {
        title: "1 Month",
        dates: {
          delta: {
            month: 1,
          },
        },
      },
      {
        title: "Last Year",
        dates: {
          delta: {
            year: 1,
          },
        },
      },
      {
        title: "Last week",
        dates: {
          delta: {
            day: 7,
          },
        },
      },
    ],
  },
  {
    title: "Fixed",
    type: "fixed",
    children: [
      {
        title: "Sep 1",
        dates: {
          start: {
            month: 9,
            day: 1,
          },
        },
      },
      {
        title: "9/1 - 9/2",
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
        title: "9/2019 - 12/2020",
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
        title: "2/2019",
        dates: {
          start: {
            year: 2019,
            month: 2,
          },
        },
      },
      {
        title: "Sep",
        dates: {
          start: {
            month: 9,
          },
        },
      },
      {
        title: "2019",
        dates: {
          start: {
            year: 2019,
          },
        },
      },
      {
        title: "9/10/2020",
        dates: {
          start: {
            year: 2020,
            month: 9,
            day: 10,
          },
        },
      },
      {
        title: "9/10/2020 - 9/20/2020",
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
    title: "Unix timestamps",
    type: "unix",
    children: [
      {
        title: "1000000 - 10000000",
        dates: {
          unix: {
            start: 1e12,
            end: 2e12,
          },
        },
      },
      {
        title: "1000000 - today",
        dates: {
          unix: {
            start: 1e12,
          },
        },
      },
    ],
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "50%",
    padding: ".5rem 1rem",
    margin: ".5rem 0rem",
    borderRight: `1px solid ${theme.palette.grey[400]}`,
  },
  button: {
    cursor: "pointer",
    padding: ".2rem .8rem .1rem .8rem",
    borderRadius: "4px",
    backgroundColor: colors.lightmain,
    margin: "3px 6px 3px 0",
    "&:hover": {
      backgroundColor: colors.main,
      "& span": {
        color: colors.white,
      },
    },
  },
  buttonActive: {
    backgroundColor: colors.main,
    "& span": {
      color: colors.white,
    },
  },
}));

export default function LeftPanel({
  value,
  setValue,
  setPreValue,
  setError,
  setHoverValue,
}) {
  const classes = useStyles();

  const getClassName = (ch) =>
    classes.button +
    (titleTimeFormat(getDates(ch.dates)).title ===
    titleTimeFormat(getDates(value.dates)).title
      ? " " + classes.buttonActive
      : "");

  const onDefaultClick = (el, ch) => {
    setValue({
      type: el.type,
      dates: ch.dates,
      title: ch.title,
      interval: getDates(ch.dates).interval,
    });
    setPreValue({});
    setError("");
  };

  const onMouseEnter = (el, ch) => {
    const d = getDates(ch.dates);

    setHoverValue({
      title: titleTimeFormat(d).title,
      dates: ch.dates,
      interval: getInterval(d.start, d.end),
      type: el.type,
    });
  };

  const onMouseLeave = () => {
    setHoverValue({});
  };

  return (
    <Box className={classes.root} pr={2}>
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
                className={getClassName(ch)}
                onClick={() => onDefaultClick(el, ch)}
                onMouseEnter={() => onMouseEnter(el, ch)}
                onMouseLeave={onMouseLeave}
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
  );
}
