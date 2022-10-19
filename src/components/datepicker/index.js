import React, { useState } from "react";
import propTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Datepicker, { DatepickerValueType } from "./Datepicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row-reverse",
  },
}));

const DatepickerBox = ({ valueDate, setValueDate }) => {
  const classes = useStyles();

  const [preValueDate, setPreValueDate] = useState({});

  return (
    <div className={classes.root}>
      <Datepicker
        value={valueDate}
        setValue={setValueDate}
        preValue={preValueDate}
        setPreValue={setPreValueDate}
      />
    </div>
  );
};

DatepickerBox.propTypes = {
  valueDate: DatepickerValueType,
  setValueDate: propTypes.func,
};

export default DatepickerBox;
