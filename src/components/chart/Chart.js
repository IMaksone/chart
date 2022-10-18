import React, { useRef, useEffect, useCallback } from 'react';
import {
  scaleLinear,
  select,
  line,
  area,
  axisBottom,
  axisLeft,
  scaleTime,
  max,
  min,
  timeFormat,
  event,
  zoom,
  brushX,
} from 'd3';

import colors from '../../constants/colors'

import './Chart.css'

const color = colors.main;

const getTimeFormatX = (xScale, width, date) => {
  let delta = (xScale.invert(width) - xScale.invert(0)) / 1000;

  const year = delta / 3.154e7;
  const month = delta / 2.628e6;
  const day = delta / 86400;
  const hour = delta / 3600;
  const minute = delta / 60;

  return timeFormat(
    year > 1
      ? '%Y %b'
      : month > 0.3
      ? '%b %d'
      : day > 1
      ? '%a %H h'
      : hour > 1.5
      ? '%H:%M'
      : minute > 1.5
      ? '%H:%M'
      : '%H:%M:%S'
  )(date);
};

const getTimeFormatTooltip = (xScale, width, date) => {
  let delta = (xScale.invert(width) - xScale.invert(0)) / 1000;

  const year = delta / 3.154e7;
  const month = delta / 2.628e6;
  const day = delta / 86400;
  const hour = delta / 3600;
  const minute = delta / 60;

  return timeFormat(
    year > 1
      ? '%Y %b %d %H:%M'
      : month > 0.3
      ? '%b %d %H:%M'
      : day > 1
      ? '%a %H:%M'
      : hour > 1.5
      ? '%H:%M'
      : minute > 1.5
      ? '%H:%M'
      : '%H:%M:%S'
  )(date);
};

const findRangeArr = ({ data, end, start }) => {
  const count = data.length;

  let first, last;

  if (start > data[count - 1].date || end < data[0].date) {
    return [];
  }

  if (start < data[0].date) {
    first = 0;
  } else {
    let a = 0;
    let b = count - 1;
    let mid = Math.floor(count / 2);
    for (let i = 0; i <= Math.sqrt(count); i++) {
      if (start < data[mid].date) {
        b = mid;
      } else if (start > data[mid].date) {
        a = mid;
      } else if (start === data[mid].date) {
        first = mid;
        break;
      }

      mid = Math.floor((b + a) / 2);
      first = mid;
    }
  }

  if (end > data[count - 1].date) {
    last = count - 1;
  } else {
    let a = 0;
    let b = count - 1;
    let mid = Math.floor(count / 2);
    for (let i = 0; i <= Math.sqrt(count); i++) {
      if (end < data[mid].date) {
        b = mid;
      } else if (end > data[mid].date) {
        a = mid;
      } else if (end === data[mid].date) {
        last = mid;
        break;
      }

      mid = Math.floor((b + a) / 2);
      last = mid;
    }
  }

  let newArr = [];

  for (let i = first; i <= last; i++) {
    newArr[i - first] = {
      date: data[i].date,
      value: data[i].value,
      ind: i,
    };
  }

  return newArr;
};

const getVisibleData = ({ data, end, start }) => {
  let visible = findRangeArr({ data, end, start });

  if (!visible.length) {
    const delta = end - start;

    let mid = new Date();
    mid.setTime(start.getTime() + delta / 2);

    const minimum = min(data.map((d) => Math.abs(d.date - mid)));

    let ind = data.findIndex(
      (el) => el.date.getTime() === mid.getTime() + minimum
    );

    if (ind < 0)
      ind = data.findIndex(
        (el) => el.date.getTime() === mid.getTime() - minimum
      );

    visible = [{ ...data[ind], ind }];
  }

  if (visible[0].ind > 0)
    visible = [
      { ...data[visible[0].ind - 1], ind: visible[0].ind - 1 },
      ...visible,
    ];
  if (visible[visible.length - 1].ind < data.length - 1)
    visible = [
      ...visible,
      {
        ...data[visible[visible.length - 1].ind + 1],
        ind: visible[visible.length - 1].ind + 1,
      },
    ];

  return visible;
};

const getApproximationData = ({ data, end, start }) => {
  //const visible = data.filter((el) => el.date >= start && el.date <= end);

  const visible = findRangeArr({ data, end, start });

  if (visible.length > 2000) {
    const k = Math.floor(visible.length / 1000);
    return data.filter((el, i) => i % k === 0);
  } else {
    return data;
  }
};

const getSimpleData = ({ data, end, start, scatter = 2 }) => {
  const delta = end - start;

  let simpleStart = new Date();
  let simpleEnd = new Date();

  simpleStart.setTime(start.getTime() - scatter * delta);
  simpleEnd.setTime(end.getTime() + scatter * delta);

  return findRangeArr({ data, end: simpleEnd, start: simpleStart });

  /*return data
    .map((el, i) => ({ ...el, ind: i }))
    .filter((el) => el.date >= simpleStart && el.date <= simpleEnd);*/
};

const callX = ({ params, xScale, xAxis, props }) => {
  (xAxis || params.xAxis).call(
    axisBottom(xScale)
      .ticks(params.width < 340 ? 4 : params.width < 1300 ? 7 : 16)
      .tickFormat((d, i, p) => getTimeFormatX(xScale, params.width, d)) ///timeFormat("%H:%M")(d))
  );

  params.g
    .selectAll('g.x-axis path')
    .attr('d', `M0.5,6V0.5H${params.width}.5V0`)
    .attr('stroke', color);

  params.g.selectAll('g.x-axis g.tick line').attr('stroke', color);
  //.attr("y2", (d, i, p) => (i + 1 === p.length ? 0 : 6));

  params.g
    .selectAll('g.x-axis g.tick text')
    .attr('font-size', props.fontSize ? `${props.fontSize}rem` : '0.7rem')
    .attr('font-weight', '600');
  // .attr("transform", `translate(0, 0)`);
};

const renderAxis = ({
  params,
  updateParams,
  xScale,
  props,
  margin,
  maxValue,
}) => {
  const xAxis = params.g
    .append('g')
    .attr('class', 'x-axis')
    .attr('clip-path', 'url(#workspace-clip)')
    .attr('transform', 'translate(0,' + params.height + ')')
    .style('cursor', 'move')
    .on('mouseover', function (d, i, p) {
      select(p[0].children[0]).style('opacity', 0.05);
    })
    .on('mouseout', function (d, i, p) {
      select(p[0].children[0]).style('opacity', 0);
    });

  updateParams({ ...params, xAxis });

  xAxis
    .append('rect')
    .attr('width', params.width)
    .attr('height', margin.bottom - 20)
    //.style("fill", "none")
    //.style("filter", "url(#drop-shadow)")
    .attr('fill', color)
    .attr('opacity', 0);

  callX({
    props,
    params,
    xScale,
    xAxis,
  });

  params.g
    .append('g')
    .attr('class', 'y-axis-line-chart')
    .call(
      axisLeft(params.yScale).tickValues([
        0,
        (maxValue / 4).toFixed(props.accuracy || 0),
        ((maxValue * 2) / 4).toFixed(props.accuracy || 0),
        ((maxValue * 3) / 4).toFixed(props.accuracy || 0),
        maxValue.toFixed(props.accuracy || 0),
      ])
    );

  params.g
    .selectAll('g.y-axis-line-chart path')
    .attr('stroke', color)
    .attr('d', `M-3,${params.height}.5H0.5V-10.5H-0`);

  params.g
    .selectAll('g.y-axis-line-chart g.tick text')
    .attr('font-weight', '600')
    .attr('font-size', props.fontSize ? `${props.fontSize}rem` : '0.7rem')
    .attr('transform', 'translate(' + -4 + ', 0)')
    .style('display', (d, i) => (i === 6 ? 'none' : ''));

  params.g
    .selectAll('g.y-axis-line-chart g.tick line')
    .classed('grid-line', true)
    .attr('stroke', color)
    .attr('x1', -3)
    .attr('y1', 0)
    .attr('x2', params.width)
    .attr('y2', 0);
};

const renderDefs = ({ params, margin, props }) => {
  const defs = params.g.append('g').append('defs');

  const areaGradient = defs
    .append('linearGradient')
    .attr('id', 'areaGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  areaGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.15);
  areaGradient
    .append('stop')
    .attr('offset', '90%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.02);
  areaGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'white')
    .attr('stop-opacity', 0);

  defs
    .append('g:clipPath')
    .attr('id', 'workspace-clip')
    .append('g:rect')
    .attr('width', params.width)
    .attr('height', params.height)
    .attr('x', 0)
    .attr('y', 0);

  defs
    .append('g:clipPath')
    .attr('id', 'x-axis-clip')
    .append('g:rect')
    .attr('width', params.width)
    .attr('height', margin.bottom)
    .attr('x', 0)
    .attr('y', 0);

  const filter = defs
    .append('filter')
    .attr('height', '125%')
    .attr('id', 'drop-shadow');

  filter
    .append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 0.5)
    .attr('result', 'castBlur');

  filter
    .append('feOffset')
    .attr('in', 'castBlur')
    .attr('dx', 0)
    .attr('dy', props.lineWidth ? props.lineWidth + 1 : 5)
    .attr('result', 'offsetBlur');

  filter
    .append('feComponentTransfer')
    .append('feFuncA')
    .attr('type', 'linear')
    .attr('slope', 0.07);

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
};

const renderWorkspace = ({
  params,
  updateParams,
  props,
  xScale,
  setTooltip,
  chartRender,
  idled,
}) => {
  const l = line()
    .x((d) => xScale(d.date))
    .y((d) => params.yScale(d.value));

  const ar = area()
    .x((d) => xScale(d.date))
    .y0(params.height)
    .y1((d) => params.yScale(d.value));

  const workspaceG = params.g
    .append('g')
    .attr('class', 'workspace-g')
    .attr('clip-path', 'url(#workspace-clip)');

  const brush = brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [params.width, params.height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on('end', () => {
      if (event.selection) {
        return chartRender(xScale);
      } else {
        if (!params.idleTimeout) {
          return updateParams({
            ...params,
            idleTimeout: setTimeout(idled, 350),
          });
        } else {
          updateParams({ ...params, range: [0, params.width] });
          return chartRender();
        }
      }
    })
    .on('start', null)
    .on('brush', null);

  workspaceG.append('g').attr('class', 'brush').call(brush);

  const workspace = workspaceG.append('g').attr('class', 'workspace');

  workspace
    .append('g')
    .attr('id', 'g-area-gradien')
    .append('path')
    .attr('id', 'path-area-gradien')
    //.datum(data)
    .style('fill', 'url(#areaGradient)')
    .style('pointer-events', 'none')
    .attr('stroke', 'none')
    .attr('d', ar(params.visibleData));

  // add path
  workspace
    .append('g')
    .append('path')
    .attr('id', 'path-line')
    .attr('d', (d) => l(params.visibleData))
    .style('stroke', color)
    .style('fill', 'none')
    .style('pointer-events', 'none')
    .style('filter', 'url(#drop-shadow)')
    .style('stroke-width', props.lineWidth || 4);

  workspace
    .append('g')
    .attr('id', 'dots')
    .selectAll('.dot')
    .data((d) => params.visibleData)
    .enter()
    .append('circle')
    .attr('id', (d) => `dot-i${d.ind}-d${d.date}-v${d.value}`)
    .attr('class', 'dot')
    .attr('cx', (d) => xScale(d.date))
    .attr('cy', (d) => params.yScale(d.value))
    .attr('fill', (d) => color)
    .style('opacity', 0)
    .attr('r', 5)
    .on('mouseover', function (d, i, p) {
      select(this).style('opacity', 1);
      params.tooltip.transition().duration(200).style('opacity', 1);
      setTooltip(d);
    })
    .on('mousemove', (d, i, p) => {
      setTooltip(d);
    })
    .on('mouseout', function (d, i, p) {
      select(this).style('opacity', 0);
      params.tooltip
        .transition()
        .duration(500)
        .style('opacity', 0)
        .style('pointer-events', 'none');
    });
};

const renderTooltip = (rootRef) =>
  rootRef.current.parentElement.children.length > 1 &&
  rootRef.current.parentElement.children[1].className === 'tooltip'
    ? select(rootRef.current.parentElement.children[1])
        .attr('class', 'tooltip')
        .style('opacity', 0)
    : select(rootRef.current.parentElement)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

const setTooltip = ({ d, params, xScale, props }) => {
  return params.tooltip
    .html(
      `<div>
         <div 
            class="circle" 
            style="background-color: ${color};"
          ></div>
          Value Display
          <span>${d.value.toFixed(props.accuracy || 0)}</span>
        </div>          
        <p>${getTimeFormatTooltip(xScale, params.width, d.date)}</p>`
    )
    .attr('pointer-events', 'auto')
    .style(
      'left',
      () => 
        event.offsetX +
        (window.innerWidth - event.pageX >
        params.tooltip._groups[0][0].clientWidth + 70
          ? 20
          : window.innerWidth -
            event.pageX -
            params.tooltip._groups[0][0].clientWidth -
            70) +
        'px'
    )
    .style(
      'top',
      () => 20 + 
        event.offsetY +
        (window.innerHeight - event.pageY >
        params.tooltip._groups[0][0].clientWidth + 20
          ? 20
          : window.innerHeight -
            event.pageY -
            params.tooltip._groups[0][0].clientWidth +
            20) +
        'px'
    );
};

const hideTooltip = (tooltip) => {
  tooltip
    .transition()
    .duration(500)
    .style('opacity', 0)
    .style('pointer-events', 'none');
};

const scroll = ({
  oldX,
  params,
  updateParams,
  props,
  firstDate,
  lastDate,
  dNice,
  dRange,
  chartRender,
  idled,
}) => {
  hideTooltip(params.tooltip);

  let xScale = scaleTime()
    .domain([firstDate, lastDate])
    .nice(dNice > 1 ? dNice : 1)
    .range([-dRange, params.width + dRange]);

  const oldData = [...params.visibleData];
  let removeData = [];
  let addData = [];

  //For drag event
  if (
    event &&
    event.sourceEvent &&
    (event.sourceEvent.type === 'mousemove' || event.type === 'start')
  ) {
    if (
      event.type === 'start' &&
      params.width - 0 !== params.range[1] - params.range[0]
    )
      updateParams({ ...params, range: [0, params.width] });

    const dX =
      (event.sourceEvent.movementX / params.width) *
      (params.range[1] - params.range[0]);
    updateParams({
      ...params,
      range: [params.range[0] - dX, params.range[1] - dX],
    });

    xScale.domain([
      (oldX || xScale).invert(params.range[0] - dRange),
      (oldX || xScale).invert(params.range[1] + dRange),
    ]);

    const start = xScale.invert(0);
    const end = xScale.invert(params.width);

    if (
      (params.simpleData[0].date < start || params.simpleData[0].ind === 0) &&
      (params.simpleData[params.simpleData.length - 1].date > end ||
        params.simpleData[params.simpleData.length - 1].ind >=
          params.approximationData.length - 1)
    ) {
      updateParams({
        ...params,
        visibleData: getVisibleData({
          data: params.simpleData,
          start: xScale.invert(0),
          end: xScale.invert(params.width),
        }),
      });
    } else if (
      (params.simpleData[0].date >= start && params.simpleData[0].ind !== 0) ||
      (params.simpleData[params.simpleData.length - 1].date <= end &&
        params.simpleData[params.simpleData.length - 1].ind <
          params.approximationData.length - 1)
    ) {
      const simpleData = getSimpleData({
        data: params.approximationData,
        start,
        end,
      });

      updateParams({
        ...params,
        simpleData,
        visibleData: getVisibleData({
          data: simpleData,
          start: xScale.invert(0),
          end: xScale.invert(params.width),
        }),
      });
    }
    if (event.sourceEvent.movementX < 0) {
      const removeCount = params.visibleData[0].ind - oldData[0].ind;
      const addCount =
        params.visibleData[params.visibleData.length - 1].ind -
        oldData[oldData.length - 1].ind;

      if (removeCount) removeData = oldData.slice(0, removeCount);
      if (addCount)
        addData = params.visibleData.slice(
          params.visibleData.length - addCount,
          params.visibleData.length
        );
    } else {
      const removeCount =
        oldData[oldData.length - 1].ind -
        params.visibleData[params.visibleData.length - 1].ind;
      const addCount = oldData[0].ind - params.visibleData[0].ind;

      if (removeCount)
        removeData = oldData.slice(
          oldData.length - removeCount,
          oldData.length
        );
      if (addCount) addData = params.visibleData.slice(0, addCount);
    }
  }

  const l = line()
    .x((d) => oldX(d.date))
    .y((d) => params.yScale(d.value));

  const ar = area()
    .x((d) => oldX(d.date))
    .y0(params.height)
    .y1((d) => params.yScale(d.value));

  const brush = brushX()
    .extent([
      [0, 0],
      [params.width, params.height],
    ])
    .on('end', () => {
      if (event.selection) {
        hideTooltip(params.tooltip);

        return chartRender(xScale);
      } else {
        hideTooltip(params.tooltip);

        if (!params.idleTimeout) {
          return updateParams({
            ...params,
            idleTimeout: setTimeout(idled, 350),
          });
        } else {
          updateParams({ ...params, range: [0, params.width] });
          return chartRender();
        }
      }
    })
    .on('start', null)
    .on('brush', null);

  callX({
    props,
    params,
    xScale,
  });

  params.g.select('g.brush').call(brush);

  params.g
    .select('g.workspace')
    .attr('transform', `translate(${xScale(firstDate) - oldX(firstDate)}, 0)`);

  removeData.forEach((el) => {
    let dot = document.getElementById(
      `dot-i${el.ind}-d${el.date}-v${el.value}`
    );
    if (dot) dot.remove();
  });

  addData.forEach((el) => {
    params.g
      .select('g#dots')
      .append('circle')
      .attr('id', `dot-i${el.ind}-d${el.date}-v${el.value}`)
      .attr('class', 'dot')
      .attr('cx', oldX(el.date))
      .attr('cy', params.yScale(el.value))
      .attr('fill', color)
      .style('opacity', 0)
      .attr('r', 5)
      .on('mouseover', function (d, i, p) {
        select(this).style('opacity', 1);
        params.tooltip.transition().duration(200).style('opacity', 1);
        setTooltip({ d: el, params, xScale: oldX, props });
      })
      .on('mousemove', (d, i, p) => {
        setTooltip({ d: el, params, xScale: oldX, props });
      })
      .on('mouseout', function (d, i, p) {
        select(this).style('opacity', 0);
        params.tooltip
          .transition()
          .duration(500)
          .style('opacity', 0)
          .style('pointer-events', 'none');
      });
  });

  params.g.select('path#path-area-gradien').attr('d', ar(params.visibleData));
  params.g.select('path#path-line').attr('d', l(params.visibleData));
};

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

  const params = {
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
  };

  const updateParams = (newParams) => {
    Object.keys(newParams).forEach((el) => {
      params[el] = newParams[el];
    });
  };

  function idled() {
    updateParams({ ...params, idleTimeout: null });
  }

  const margin = props.margin || {
    top: 30,
    right: 20,
    bottom: 55,
    left: 50,
  };
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
      if (!rootRef.current) return '';
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
            .on('zoom', () => {
              if (
                event.sourceEvent &&
                event.sourceEvent.type === 'mousemove' &&
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
            .on('start', () => {
              if (
                event.sourceEvent &&
                event.sourceEvent.path.find((el) =>
                  el.className && el.className.animVal === 'x-axis'
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
            .on('end', () => updateParams({ ...params, isDrag: false }))
        )
        .attr('width', fullWidth)
        .attr('height', fullHeight);

      svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      const g = svg.selectAll('g').data([margin]);
      g.enter()
        .append('g')
        .attr('transform', (m) => 'translate(' + m.left + ',' + m.top + ')');
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
    [rootRef, event, props.startX, props.endX]
  );

  useEffect(() => {
    chartRender();
  }, [props.chartData, props.startX, props.endX]);

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
    <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
      <svg ref={rootRef}></svg>
    </div>
  );
}
