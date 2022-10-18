import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Datepicker from "./Datepicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row-reverse",
  },
}));

const DatepickerBox = (props) => {
  const classes = useStyles();

  const [preValueDate, setPreValueDate] = useState({});

  return (
    <div className={classes.root}>
      <Datepicker
        value={props.valueDate}
        setValue={props.setValueDate}
        preValue={preValueDate}
        setPreValue={setPreValueDate}
      />
    </div>
  );
};

export default DatepickerBox;
