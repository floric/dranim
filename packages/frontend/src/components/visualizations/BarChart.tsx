import * as d3 from 'd3';
import * as React from 'react';

import { SVGChartWithId } from '../CustomDataRenderer';

export interface BarChartProps extends SVGChartWithId {
  value: any;
}

export class BarChart extends React.Component<BarChartProps> {
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

    const width = 250;
    const height = 25;

    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height * values.length);

    const x = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .rangeRound([0, height]);

    const column = chart
      .selectAll('rect')
      .data(values)
      .enter()
      .append('rect');

    column
      .attr('x', d => 0)
      .attr('y', (d, i) => y(i))
      .attr('width', d => x(d.value))
      .attr('height', height * 0.9)
      .attr('fill', 'steelblue');

    const text = chart
      .selectAll('text')
      .data(values)
      .enter()
      .append('text');

    text
      .text(d => d.label)
      .attr('x', d => 5)
      .attr('y', (d, i) => y(i + 0.5))
      .style('font-family', 'sans-serif')
      .style('font-size', '10px')
      .style('alignment-baseline', 'middle')
      .style('fill', 'white');
  }

  public render() {
    return <div id={this.props.containerId} />;
  }
}
