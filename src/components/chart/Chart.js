import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { scaleLinear, select, scaleTime, max, min, event, zoom } from "d3";

import { getVisibleData, getSimpleData, getApproximationData } from "./shared";
import {
  renderTooltip,
  scroll,
  renderDefs,
  renderAxis,
  setTooltip,
  renderWorkspace,
} from "./chartFunctions";

import "./Chart.css";

/////////////////////////////////
//
//    Chart props:
//      chartData - Array [{date: Date, value: number}]
//      width - Svg width (number)
//      height - Svg height (number)
//      margin - Object {top: number, button: number, right: number, left: number}
//      endX - End date for X scale (Date)
//      startX - Start date for X scale (Date)
//      accuracy - Number of decimal places for tooltip and Y scale
//
/////////////////////////////////

export default function LineChart(props) {
  const rootRef = useRef(null);

  const params = useMemo(
    () => ({
      range: null,
      isDrag: false,
      approximationData: [],
      visibleData: [],
      simpleData: [],
      savedX: undefined,
      idleTimeout: undefined,
      fullWidth: undefined,
      fullHeight: undefined,
      height: undefined,
      width: undefined,
      xAxis: undefined,
      yScale: undefined,
      g: undefined,
      tooltip: undefined,
    }),
    []
  );

  const updateParams = useCallback(
    (newParams) => {
      Object.keys(newParams).forEach((el) => {
        params[el] = newParams[el];
      });
    },
    [params]
  );

  const idled = useCallback(() => {
    updateParams({ ...params, idleTimeout: null });
  }, [params, updateParams]);

  const margin = useMemo(
    () =>
      props.margin || {
        top: 30,
        right: 20,
        bottom: 55,
        left: 50,
      },
    [props.margin]
  );
  const data = props.chartData;

  data.sort((a, b) => a.date - b.date);

  const dRange = 10;

  let arrValue = [],
    arrDate = [];

  for (let i = 0; i < data.length; i++) {
    arrValue[i] = data[i].value;
    arrDate[i] = data[i].date;
  }

  const maxValue = 1.2 * max(arrValue);
  const lastDate = props.endX || max(arrDate);
  const firstDate = props.startX || min(arrDate);
  const dNice = (lastDate - firstDate) / 2e6;

  const chartRender = useCallback(
    function (oldX, X) {
      if (!rootRef.current) return "";
      const element = rootRef.current;

      const fullHeight = Math.max(
        props.height || element.parentNode.clientHeight,
        250
      );
      const fullWidth = Math.max(
        props.width || element.parentNode.clientWidth,
        250
      );

      updateParams({
        ...params,
        fullWidth,
        fullHeight,
        width: fullWidth - margin.left - margin.right,
        height: fullHeight - margin.top - margin.bottom,
      });

      if (!params.range) updateParams({ ...params, range: [0, params.width] });

      const tooltip = renderTooltip(rootRef);

      updateParams({ ...params, tooltip });

      let xScale = X
        ? X.range([-dRange, params.width + dRange])
        : scaleTime()
            .domain([firstDate, lastDate])
            .nice(dNice > 1 ? dNice : 1)
            .range([-dRange, params.width + dRange]);

      const yScale = scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([params.height, 0]);

      updateParams({ ...params, yScale });

      if (event) {
        //For zoom and drag event
        if (event.selection) {
          const extent = event.selection;
          xScale.domain([
            (oldX || xScale).invert(extent[0] - dRange),
            (oldX || xScale).invert(extent[1] + dRange),
          ]);

          updateParams({ ...params, range: [0, params.width] });
        }
      }

      const approximationData = getApproximationData({
        data,
        start: xScale.invert(0),
        end: xScale.invert(params.width),
      });

      const simpleData = getSimpleData({
        data: approximationData,
        start: xScale.invert(0),
        end: xScale.invert(params.width),
      });

      updateParams({
        ...params,
        approximationData,
        simpleData,
        visibleData: getVisibleData({
          data: simpleData,
          start: xScale.invert(0),
          end: xScale.invert(params.width),
        }),
      });

      updateParams({ ...params, savedX: xScale });

      const svg = select(element)
        .call(
          zoom()
            .on("zoom", () => {
              if (
                event.sourceEvent &&
                event.sourceEvent.type === "mousemove" &&
                params.isDrag
              ) {
                //chartRender(xScale);
                scroll({
                  props,
                  updateParams,
                  params,
                  firstDate,
                  lastDate,
                  oldX: xScale,
                  dNice,
                  dRange,
                  chartRender,
                  idled,
                });
              }
            })
            .on("start", () => {
              if (
                event.sourceEvent &&
                event.sourceEvent.path.find((el) =>
                  el.className && el.className.animVal === "x-axis"
                    ? true
                    : false
                )
              ) {
                updateParams({ ...params, isDrag: true });
                //chartRender(xScale);
                scroll({
                  props,
                  params,
                  updateParams,
                  firstDate,
                  lastDate,
                  oldX: xScale,
                  dNice,
                  dRange,
                  chartRender,
                  idled,
                });
              }
            })
            .on("end", () => updateParams({ ...params, isDrag: false }))
        )
        .attr("width", fullWidth)
        .attr("height", fullHeight);

      svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const g = svg.selectAll("g").data([margin]);
      g.enter()
        .append("g")
        .attr("transform", (m) => "translate(" + m.left + "," + m.top + ")");
      g.exit().remove();

      updateParams({ ...params, g });

      renderDefs({
        props,
        params,
        margin,
      });

      renderAxis({
        updateParams,
        params,
        xScale,
        lastDate,
        firstDate,
        maxValue,
        margin,
        props,
      });

      renderWorkspace({
        updateParams,
        params,
        props,
        xScale,
        idled,
        chartRender,
        setTooltip: (d) => setTooltip({ d, params, xScale, props }),
      });

      return svg;
    },
    [
      rootRef,
      lastDate,
      margin,
      maxValue,
      params,
      dNice,
      data,
      firstDate,
      props,
      idled,
      updateParams,
    ]
  );

  useEffect(() => {
    chartRender();
  }, [props.chartData, props.startX, props.endX, chartRender]);

  useEffect(() => {
    window.addEventListener(
      `resize`,
      () => chartRender(null, params.savedX),
      false
    );
    return () => {
      window.removeEventListener(
        `resize`,
        () => chartRender(null, params.savedX),
        false
      );
    };
  });

  return (
    <div style={{ position: "relative", display: "flex", width: "100%" }}>
      <svg ref={rootRef}></svg>
    </div>
  );
}
