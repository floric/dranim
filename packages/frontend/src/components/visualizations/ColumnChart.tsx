import * as React from 'react';

import * as d3 from 'd3';

import { SVGChartWithId } from '../CustomDataRenderer';

export interface ColumnChartProps extends SVGChartWithId {
  value: any;
}

export class ColumnChart extends React.Component<
  ColumnChartProps,
  { chartId: string }
> {
  public componentDidMount() {
    const { value, containerId } = this.props;
    if (
      !value.values ||
      value.values.length === 0 ||
      value.values[0].label == null ||
      value.values[0].value == null
    ) {
      throw new Error('Unsupported value');
    }

    const values: Array<{ label: string; value: number }> = value.values;
    const maxVal = values.map(n => n.value).reduce((a, b) => (a > b ? a : b));

    const width = 25;
    const height = 175;

    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('class', 'chart')
      .attr('width', width * values.length)
      .attr('height', height);

    const x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, maxVal])
      .rangeRound([0, height]);

    const column = chart
      .selectAll('rect')
      .data(values)
      .enter()
      .append('rect');

    column
      .attr('x', (d, i) => x(i))
      .attr('y', d => height - y(d.value) - 0.5)
      .attr('width', width * 0.9)
      .attr('height', d => y(d.value))
      .attr('fill', 'steelblue');

    const text = chart
      .selectAll('text')
      .data(values)
      .enter()
      .append('text');

    text
      .text(d => d.label)
      .attr('x', (d, i) => x(i + 0.5))
      .attr('y', d => height)
      .style('font-family', 'sans-serif')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('text-anchor', 'end')
      .style('writing-mode', 'tb');
  }

  public render() {
    return <div id={this.props.containerId} />;
  }
}
