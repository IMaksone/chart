import React from 'react';
import LineChart from './Chart';

const getData = () => {
  let arr = [];

  const today = new Date();

  for (let i = 0; i < 1000000; i++) {
    let date = new Date();
    date.setMinutes(today.getMinutes() - i * 5);
    arr.push({
      date: date,
      value: 10 + Math.random() * 100,
    });
  }

  return arr;
};

export default function ChartView({ intervalX }) {
  return (
    <LineChart
      chartData={getData()}
      startX={intervalX.start}
      endX={intervalX.end}
      fontSize={0.7}
      lineWidth={4}
    />
  );
}
