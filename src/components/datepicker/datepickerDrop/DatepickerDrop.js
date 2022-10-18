import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    //padding: "1rem",
    width: "700px",
    position: "absolute",
    zIndex: 10,
    right: "0rem",
    top: "2.5rem",
  },
}));

export default function DatapickerDrop({
  value,
  setValue,
  setPreValue,
  setError,
  setHoverValue,
  setIsActive,
}) {
  const classes = useStyles();

  return (
    <>
      <Paper className={classes.paper} elevation={3}>
        <LeftPanel
          value={value}
          setValue={setValue}
          setPreValue={setPreValue}
          setError={setError}
          setHoverValue={setHoverValue}
        />

        <RightPanel
          value={value}
          setValue={setValue}
          setPreValue={setPreValue}
          setError={setError}
          setHoverValue={setHoverValue}
          setIsActive={setIsActive}
        />
      </Paper>
    </>
  );
}
