import * as d3 from 'd3';
import * as React from 'react';

import { Colors } from '@masterthesis/shared';

import { SVGChartWithId } from '../CustomDataRenderer';
import {
  LABEL_COLOR,
  LABEL_FONT_FAMILY,
  LABEL_FONT_SIZE,
  LABEL_FONT_WEIGHT
} from './styles';

export const BAR_WIDTH = 250;
export const BAR_HEIGHT = 25;

export const validateAndGetValues = (value: any) => {
  const values: Array<{ label: string; value: number }> = value.values;
  const maxVal = values.map(n => n.value).reduce((a, b) => (a > b ? a : b));
  return { values, maxVal };
};

export interface BarChartProps extends SVGChartWithId {
  value: any;
}

export class BarChart extends React.Component<BarChartProps> {
  public componentDidMount() {
    const { value, containerId } = this.props;
    const { values, maxVal } = validateAndGetValues(value);

    const chart = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('class', 'chart')
      .attr('width', BAR_WIDTH)
      .attr('height', BAR_HEIGHT * values.length);

    const x = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([0, BAR_WIDTH]);

    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .rangeRound([0, BAR_HEIGHT]);

    const column = chart
      .selectAll('rect')
      .data(values)
      .enter()
      .append('rect');

    column
      .attr('x', d => 0)
      .attr('y', (d, i) => y(i))
      .attr('width', d => x(d.value))
      .attr('height', BAR_HEIGHT * 0.9)
      .attr('fill', Colors.VisDefault);

    const text = chart
      .selectAll('text')
      .data(values)
      .enter()
      .append('text');

    text
      .text(d => d.label)
      .attr('x', d => 5)
      .attr('y', (d, i) => y(i + 0.5))
      .style('font-family', LABEL_FONT_FAMILY)
      .style('font-size', LABEL_FONT_SIZE)
      .style('font-weight', LABEL_FONT_WEIGHT)
      .style('fill', LABEL_COLOR)
      .style('alignment-baseline', 'middle');
  }

  public render() {
    return <div id={this.props.containerId} />;
  }
}
