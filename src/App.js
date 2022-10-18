import React, { useState } from "react";
import { getDates } from "./components/datepicker/Datepicker";
import DatepickerBox from "./components/datepicker/DatepickerBox";
import ChartBox from "./components/chart/ChartBox"

const defaultState = {
  //start: new Date("December 17, 1995 03:24:50"),
  //end: new Date("December 17, 1995 04:24:50"),
  title: "1 hour",
  interval: "1h",
  dates: {
    delta: {
      hour: 1,
    },
  },
  type: "relative",
};

function App() {
  const [valueDate, setValueDate] = useState(defaultState);

  return (
    <div className="App">
      <DatepickerBox valueDate={valueDate} setValueDate={setValueDate} />

      <ChartBox intervalX={getDates(valueDate.dates)} />
    </div>
  );
}

export default App;
