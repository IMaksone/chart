import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import propTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Typography, Box, OutlinedInput } from "@material-ui/core";

import colors from "../../constants/colors.json";

import Mask from "./MaskDatepicker";
import DatapickerDrop from "./datepickerDrop/DatepickerDrop";
import {
  titleTimeFormat,
  getDates,
  getInterval,
  parseTitle,
  convertDates,
} from "./shared";

const MyOutlinedInput = withStyles((theme) => ({
  root: {
    width: 410,
    backgroundColor: colors.white,
    paddingBottom: 1,
    paddingLeft: 60,
    paddingRight: 15,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    "&:after": {
      content: "' '",
      display: "block",
      position: "absolute",
      right: 10,
      top: 11,
      width: 6,
      height: 6,
      borderBottom: `1px solid ${colors.main}`,
      borderRight: `1px solid ${colors.main}`,
      transform: "rotate(45deg)",
    },
    "& fieldset": {
      borderColor: colors.main + " !important",
    },
    "&:hover fieldset": {
      borderColor: colors.main + " !important",
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.main + " !important",
    },
    "&.Mui-error fieldset": {
      borderColor: colors.red + " !important",
    },
    "& input": {
      paddingTop: 9,
      paddingBottom: 5,
    },
  },
}))(OutlinedInput);

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  errorText: {
    position: "absolute",
    top: -17,
    left: 0,
  },
  intervalText: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: colors.lightMain,
    borderRadius: 2,
    width: 60,
    padding: ".1rem .2rem",
  },
}));

export default function Datepicker({ value, setValue, preValue, setPreValue }) {
  const classes = useStyles();

  const [isActive, setIsActive] = useState("");

  const [error, setError] = useState("");
  const [hoverValue, setHoverValue] = useState({});

  const rootRef = useRef();

  const dates = useMemo(() => getDates(value.dates), [value]);

  const viewDate = titleTimeFormat(dates).title;

  const clickEvent = (e) => {
    if (rootRef && !e.composedPath().find((el) => el === rootRef.current) && isActive) {
      setIsActive("");
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", clickEvent);
    window.addEventListener("click", clickEvent);

    return () => {
      window.removeEventListener("mousedown", clickEvent);
      window.removeEventListener("click", clickEvent);
    };
  });

  const handleChange = useCallback(
    (event) => {
      const data = parseTitle(event.target.value);
      setPreValue({
        title: event.target.value,
        dates: convertDates({ start: data.start, end: data.end }),
        interval: getInterval(data.start, data.end),
        type: "absolute",
      });
      setError(data.error);
      setIsActive("default");
    },
    [setPreValue]
  );

  const onClick = () => (isActive ? "" : setIsActive("default"));

  const inputName =
    titleTimeFormat(
      hoverValue.dates
        ? getDates(hoverValue.dates)
        : preValue.dates
        ? getDates(preValue.dates)
        : dates
    ).type === "year"
      ? "simple-datepicker-year"
      : "simple-datepicker";

  const inputValue = isActive
    ? hoverValue.title || preValue.title || value.view || viewDate
    : preValue.title || value.view || value.title || viewDate;

  const iputProps = isActive ? { inputComponent: Mask } : {};
  
  return (
    <Box ref={rootRef} className={classes.root}>
      <MyOutlinedInput
        id="simple-datepicker"
        name={inputName}
        error={error ? true : false}
        value={inputValue}
        variant="outlined"
        onClick={onClick}
        onChange={handleChange}
        {...iputProps}
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
      {isActive ? (
        <DatapickerDrop
          value={value}
          setValue={setValue}
          setPreValue={setPreValue}
          setError={setError}
          setHoverValue={setHoverValue}
          setIsActive={setIsActive}
        />
      ) : (
        ""
      )}
    </Box>
  );
}

export const DatepickerDatesType = propTypes.object;

export const DatepickerValueType = propTypes.oneOfType([
  propTypes.shape({
    start: propTypes.instanceOf(new Date()),
    end: propTypes.instanceOf(new Date()),
  }),
  propTypes.shape({
    title: propTypes.string,
    interval: propTypes.string,
    dates: DatepickerDatesType,
    type: propTypes.oneOf(["relative", "absolute", "fixed", "unix"]),
  }),
]);

Datepicker.propTypes = {
  value: DatepickerValueType,
  preValue: propTypes.oneOfType([DatepickerValueType, propTypes.object]),
  setValue: propTypes.func,
  setPreValue: propTypes.func,
};
